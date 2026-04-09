import {
  buildDetectionResultSummary,
  decodeTfliteDetectionVector,
  DEFAULT_DETECTION_THRESHOLD,
  parseTfliteDetectionCandidates,
} from "../lib/tfliteDetection";
import { DetectionResult } from "../types/app";

export type RealtimeFramePayload = {
  averageLuma: number;
  detectionVector: number[];
  capturedAt: number;
  inferenceTimeMs: number;
};

export function estimateAverageLumaFromRgb(
  input: Uint8Array | Float32Array,
  dataType: "uint8" | "float32",
) {
  "worklet";

  if (!input.length) {
    return 0;
  }

  const totalPixels = Math.floor(input.length / 3);
  const targetSamples = Math.min(totalPixels, 96);
  const pixelStep = Math.max(1, Math.floor(totalPixels / Math.max(targetSamples, 1)));
  let lumaTotal = 0;
  let samples = 0;

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += pixelStep) {
    const index = pixelIndex * 3;
    const red = dataType === "float32" ? (input[index] || 0) * 255 : input[index] || 0;
    const green =
      dataType === "float32" ? (input[index + 1] || 0) * 255 : input[index + 1] || 0;
    const blue =
      dataType === "float32" ? (input[index + 2] || 0) * 255 : input[index + 2] || 0;

    lumaTotal += 0.299 * red + 0.587 * green + 0.114 * blue;
    samples += 1;
  }

  return samples ? lumaTotal / samples : 0;
}

export function buildDetectionResultFromRealtimePayload(
  payload: RealtimeFramePayload,
  options?: { threshold?: number },
): DetectionResult {
  const candidates = decodeTfliteDetectionVector(payload.detectionVector);
  const parsed = parseTfliteDetectionCandidates(
    candidates,
    options?.threshold || DEFAULT_DETECTION_THRESHOLD,
  );
  const summary = buildDetectionResultSummary(parsed.objects, payload.averageLuma);

  return {
    summary,
    lowLight: payload.averageLuma < 70,
    backend: "local-tflite",
    sceneHash: `tflite-${payload.capturedAt.toString(16)}`,
    inferenceTimeMs: payload.inferenceTimeMs,
    capturedAt: payload.capturedAt,
    objects: parsed.objects,
  };
}
