import { Directory, File, Paths } from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Image, Platform } from "react-native";
import { loadTensorflowModel, TensorflowModel, TensorflowModelDelegate } from "react-native-fast-tflite";

import {
  buildDetectionResultSummary,
  DEFAULT_DETECTION_THRESHOLD,
  parseTfliteObjectDetectionOutputs,
  preprocessJpegBase64ForTflite,
} from "../lib/tfliteDetection";
import { AppSettings, DetectionResult, GeminiSceneResponse, ModelMetadata } from "../types/app";

type PerceptionLogger = (level: "info" | "warning" | "error", message: string) => void;

const bundledVisionModelPath = "assets/models/yolo26s_float16.tflite";
const bundledVisionModel = require("../../assets/models/yolo26s_float16.tflite");

export type DetectionInputConfig = {
  width: number;
  height: number;
  dataType: "uint8" | "float32";
};

function normalizeBundledAssetUrl(url: string) {
  if (Platform.OS !== "android") {
    return url;
  }

  return url
    .replace(/^http:\/\/localhost(?=[:/])/, "http://127.0.0.1")
    .replace(/^https:\/\/localhost(?=[:/])/, "https://127.0.0.1");
}

function logPerceptionEvent(
  logger: PerceptionLogger | undefined,
  level: "info" | "warning" | "error",
  message: string,
) {
  const formatted = `[VisionEdge][perception] ${message}`;
  if (level === "error") {
    console.error(formatted);
  } else if (level === "warning") {
    console.warn(formatted);
  } else {
    console.info(formatted);
  }

  logger?.(level, message);
}

export async function ensureBase64(input: { base64?: string; uri: string }) {
  if (input.base64) {
    return input.base64;
  }
  return new File(input.uri).base64();
}

async function resolveBundledVisionModelSource(logger?: PerceptionLogger) {
  const resolved = Image.resolveAssetSource(bundledVisionModel);
  const resolvedUri = typeof resolved?.uri === "string" ? normalizeBundledAssetUrl(resolved.uri) : null;

  if (!resolvedUri) {
    return bundledVisionModel;
  }

  if (resolvedUri.startsWith("file://")) {
    logPerceptionEvent(logger, "info", `Using local bundled model file ${resolvedUri}.`);
    return { url: resolvedUri };
  }

  if (!/^https?:\/\//.test(resolvedUri)) {
    return bundledVisionModel;
  }

  const modelDirectory = new Directory(Paths.cache, "models");
  modelDirectory.create({
    idempotent: true,
    intermediates: true,
  });
  const destination = new File(modelDirectory, "yolo26s_float16.tflite");
  const downloadedModel = await File.downloadFileAsync(resolvedUri, destination, {
    idempotent: true,
  });

  logPerceptionEvent(
    logger,
    "info",
    `Cached bundled model from ${resolvedUri} to ${downloadedModel.uri}.`,
  );

  return { url: downloadedModel.uri };
}

export async function resizePictureForModelInput(
  input: {
    base64?: string;
    uri: string;
    width?: number;
    height?: number;
  },
  resizeTo: { width: number; height: number },
) {
  const result = await manipulateAsync(
    input.uri,
    [{ resize: { width: resizeTo.width, height: resizeTo.height } }],
    {
      base64: true,
      compress: 0.7,
      format: SaveFormat.JPEG,
    },
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    base64: result.base64 || (await ensureBase64({ uri: result.uri })),
  };
}

async function analyzeWithGemini(
  base64: string,
  mimeType: string,
  logger?: PerceptionLogger,
): Promise<GeminiSceneResponse | null> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    logPerceptionEvent(logger, "warning", "Gemini fallback skipped because no API key is configured.");
    return null;
  }

  logPerceptionEvent(logger, "info", "Invoking Gemini fallback for live frame analysis.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this camera image for an assistive Android demo. Return strict JSON with keys summary, lowLight, and objects. Each object must contain label, confidence, positionLabel, and optional distanceEstimateMeters.",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    logPerceptionEvent(logger, "error", `Gemini fallback returned HTTP ${response.status}.`);
    return null;
  }

  const payload = await response.json();
  const text =
    payload?.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => part.text)?.text ||
    "";

  if (!text) {
    logPerceptionEvent(logger, "warning", "Gemini fallback returned no text content.");
    return null;
  }

  const jsonText = text.replace(/^```json/, "").replace(/```$/, "").trim();
  return JSON.parse(jsonText) as GeminiSceneResponse;
}

function buildGeminiDetectionResult(
  gemini: GeminiSceneResponse,
  capturedAt: number,
  inferenceTimeMs: number,
): DetectionResult {
  const objects = gemini.objects.map((item, index) => ({
    id: `gemini-${index}`,
      label: item.label,
      icon: "devices" as const,
      confidence: Math.max(0.4, Math.min(0.99, item.confidence)),
      positionLabel: item.positionLabel || "ahead",
      distanceEstimateMeters: item.distanceEstimateMeters,
      priority: (index === 0 ? "high" : index === 1 ? "medium" : "low") as
        | "high"
        | "medium"
        | "low",
    }));

  return {
    summary: gemini.summary || buildDetectionResultSummary(objects, gemini.lowLight ? 50 : 120),
    lowLight: Boolean(gemini.lowLight),
    backend: "gemini-fallback",
    sceneHash: `gemini-${capturedAt.toString(16)}`,
    inferenceTimeMs,
    capturedAt,
    objects,
  };
}

export class PerceptionService {
  private logger?: PerceptionLogger;

  private model: TensorflowModel | null = null;

  private modelMetadata: ModelMetadata = {
    id: "vision-yolo26s",
    modelType: "VISION",
    modelVersion: "yolo26s_float16_320",
    quantizationType: "FLOAT16",
    runtime: "bundled",
    status: "missing",
    details: "Model has not been loaded yet.",
    assetPath: bundledVisionModelPath,
    loadTimeMs: null,
  };

  private inputConfig: DetectionInputConfig = {
    width: 448,
    height: 448,
    dataType: "uint8",
  };

  setLogger(logger: PerceptionLogger) {
    this.logger = logger;
  }

  async initialize(): Promise<ModelMetadata> {
    const delegates: TensorflowModelDelegate[] = ["android-gpu", "nnapi", "default"];
    let lastError: unknown = null;
    const bundledModelSource = await resolveBundledVisionModelSource(this.logger);

    for (const delegate of delegates) {
      const startedAt = Date.now();
      try {
        logPerceptionEvent(this.logger, "info", `Loading bundled TFLite model with ${delegate} delegate.`);
        const model = await loadTensorflowModel(bundledModelSource, delegate);
        const inputShape = model.inputs?.[0]?.shape || [];
        const shapeHeight = Number(inputShape[1]) || 448;
        const shapeWidth = Number(inputShape[2]) || 448;
        const inputDataType =
          model.inputs?.[0]?.dataType === "float32" ? "float32" : "uint8";
        this.inputConfig = {
          width: shapeWidth,
          height: shapeHeight,
          dataType: inputDataType,
        };
        this.model = model;
        this.modelMetadata = {
          id: "vision-yolo26s",
          modelType: "VISION",
          modelVersion: "yolo26s_float16_320",
          quantizationType: inputDataType === "float32" ? "FLOAT16" : "UINT8",
          runtime: "bundled",
          status: "ready",
          details: `Loaded with ${delegate} delegate. Input: ${JSON.stringify(model.inputs)} Output: ${JSON.stringify(model.outputs)}.`,
          assetPath: bundledVisionModelPath,
          loadTimeMs: Date.now() - startedAt,
        };
        logPerceptionEvent(
          this.logger,
          "info",
          `TFLite model ready with ${delegate} delegate in ${this.modelMetadata.loadTimeMs}ms.`,
        );
        return this.modelMetadata;
      } catch (error: unknown) {
        lastError = error;
        logPerceptionEvent(
          this.logger,
          delegate === "default" ? "error" : "warning",
          `Failed to load TFLite model with ${delegate} delegate: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }

    this.model = null;
    this.modelMetadata = {
      id: "vision-yolo26s",
      modelType: "VISION",
      modelVersion: "yolo26s_float16_320",
      quantizationType: "FLOAT16",
      runtime: "bundled",
      status: "error",
      details:
        lastError instanceof Error
          ? lastError.message
          : "Failed to load the bundled TFLite model.",
      assetPath: bundledVisionModelPath,
      loadTimeMs: null,
    };
    return this.modelMetadata;
  }

  getModelMetadata() {
    return this.modelMetadata;
  }

  getTensorflowModel() {
    return this.model;
  }

  getInputConfig(): DetectionInputConfig {
    return { ...this.inputConfig };
  }

  isReady() {
    return this.model != null;
  }

  async preparePictureForAnalysis(picture: {
    base64?: string;
    uri: string;
    width?: number;
    height?: number;
  }): Promise<{
    uri: string;
    width?: number;
    height?: number;
    base64: string;
  }> {
    const targetWidth = this.inputConfig.width;
    const targetHeight = this.inputConfig.height;

    if (picture.width === targetWidth && picture.height === targetHeight) {
      return {
        uri: picture.uri,
        width: picture.width,
        height: picture.height,
        base64: picture.base64 || (await ensureBase64(picture)),
      };
    }

    return resizePictureForModelInput(picture, {
      width: targetWidth,
      height: targetHeight,
    });
  }

  async analyze(
    picture: {
      base64: string;
      uri: string;
      width?: number;
      height?: number;
    },
    settings: AppSettings,
  ): Promise<DetectionResult> {
    if (!this.model) {
      throw new Error(
        "Local TFLite vision model is not loaded. Rebuild the Android app with `npx expo run:android` so the native runtime is installed.",
      );
    }

    const startedAt = Date.now();
    logPerceptionEvent(
      this.logger,
      "info",
      `Analyzing frame ${picture.width || 0}x${picture.height || 0} base64=${picture.base64.length}.`,
    );

    const { input, averageLuma } = preprocessJpegBase64ForTflite(picture.base64, this.inputConfig);
    const outputs = await this.model.run([input]);
    const parsed = parseTfliteObjectDetectionOutputs(outputs, DEFAULT_DETECTION_THRESHOLD, {
      inputWidth: this.inputConfig.width,
      inputHeight: this.inputConfig.height,
    });
    const lowLight = averageLuma < 70;
    const summary = buildDetectionResultSummary(parsed.objects, averageLuma);
    const localResult: DetectionResult = {
      summary,
      lowLight,
      backend: "local-tflite",
      sceneHash: `tflite-${startedAt.toString(16)}`,
      inferenceTimeMs: Date.now() - startedAt,
      capturedAt: Date.now(),
      objects: parsed.objects,
    };

    logPerceptionEvent(
      this.logger,
      parsed.objects.length ? "info" : "warning",
      `TFLite detection produced ${parsed.objects.length} object(s); average luma ${averageLuma.toFixed(1)}.`,
    );

    if (parsed.objects.length || !settings.geminiFallbackEnabled) {
      return localResult;
    }

    const gemini = await analyzeWithGemini(picture.base64, "image/jpeg", this.logger);
    if (gemini?.objects?.length) {
      logPerceptionEvent(this.logger, "info", "Gemini fallback returned non-empty detections.");
      return buildGeminiDetectionResult(gemini, Date.now(), Date.now() - startedAt);
    }

    return localResult;
  }
}
