import { toByteArray } from "base64-js";
import { decode } from "jpeg-js";

import { getCocoLabel } from "../constants/cocoLabels";
import { IconKey } from "../constants/theme";
import { DetectedObject } from "../types/app";

export const DEFAULT_TFLITE_MODEL_INPUT_WIDTH = 320;
export const DEFAULT_TFLITE_MODEL_INPUT_HEIGHT = 320;
export const DEFAULT_DETECTION_THRESHOLD = 0.35;
export const UNKNOWN_OBJECT_THRESHOLD = 0.12;
export const DETECTION_VECTOR_STRIDE = 6;
const MAX_DETECTIONS = 4;
const MAX_YOLO_DETECTIONS = 6;

export type SerializedDetectionCandidate = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  confidence: number;
  classIndex: number;
};

function mapLabelToIcon(label: string): IconKey {
  const normalized = label.toLowerCase();

  if (normalized.includes("chair")) {
    return "chair";
  }
  if (normalized.includes("laptop")) {
    return "laptop";
  }
  if (normalized.includes("table")) {
    return "table";
  }
  if (normalized.includes("couch")) {
    return "couch";
  }
  if (normalized.includes("person")) {
    return "person";
  }
  if (normalized.includes("car")) {
    return "car";
  }
  if (normalized.includes("phone")) {
    return "phone";
  }
  if (normalized.includes("cup")) {
    return "cup";
  }
  if (normalized.includes("bottle")) {
    return "bottle";
  }
  if (normalized.includes("book")) {
    return "book";
  }
  if (normalized.includes("tv")) {
    return "tv";
  }
  if (
    normalized.includes("dog") ||
    normalized.includes("cat") ||
    normalized.includes("horse") ||
    normalized.includes("bear")
  ) {
    return "pet";
  }
  if (
    normalized.includes("backpack") ||
    normalized.includes("suitcase") ||
    normalized.includes("handbag")
  ) {
    return "bag";
  }

  return "devices";
}

function clamp(value: number, min: number, max: number) {
  "worklet";

  return Math.min(max, Math.max(min, value));
}

function resizeRgbaToRgb(
  rgba: Uint8Array,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  dataType: "uint8" | "float32" = "uint8",
) {
  const rgb =
    dataType === "float32"
      ? new Float32Array(targetWidth * targetHeight * 3)
      : new Uint8Array(targetWidth * targetHeight * 3);
  let lumaTotal = 0;

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = Math.min(sourceHeight - 1, Math.floor((y * sourceHeight) / targetHeight));

    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(sourceWidth - 1, Math.floor((x * sourceWidth) / targetWidth));
      const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
      const targetIndex = (y * targetWidth + x) * 3;
      const red = rgba[sourceIndex] || 0;
      const green = rgba[sourceIndex + 1] || 0;
      const blue = rgba[sourceIndex + 2] || 0;

      if (dataType === "float32") {
        rgb[targetIndex] = red / 255;
        rgb[targetIndex + 1] = green / 255;
        rgb[targetIndex + 2] = blue / 255;
      } else {
        rgb[targetIndex] = red;
        rgb[targetIndex + 1] = green;
        rgb[targetIndex + 2] = blue;
      }
      lumaTotal += 0.299 * red + 0.587 * green + 0.114 * blue;
    }
  }

  return {
    input: rgb,
    averageLuma: lumaTotal / (targetWidth * targetHeight),
  };
}

export function preprocessJpegBase64ForTflite(
  base64: string,
  options?: {
    width?: number;
    height?: number;
    dataType?: "uint8" | "float32";
  },
) {
  const jpegBytes = toByteArray(base64);
  const decoded = decode(jpegBytes, { useTArray: true });

  if (!decoded.width || !decoded.height) {
    throw new Error("Failed to decode the captured JPEG frame.");
  }

  return resizeRgbaToRgb(
    decoded.data,
    decoded.width,
    decoded.height,
    options?.width || DEFAULT_TFLITE_MODEL_INPUT_WIDTH,
    options?.height || DEFAULT_TFLITE_MODEL_INPUT_HEIGHT,
    options?.dataType || "uint8",
  );
}

function describePosition(xCenter: number) {
  if (xCenter < 0.2) {
    return "far left";
  }
  if (xCenter < 0.4) {
    return "left";
  }
  if (xCenter > 0.8) {
    return "far right";
  }
  if (xCenter > 0.6) {
    return "right";
  }
  return "ahead";
}

function estimateDistance(xMin: number, yMin: number, xMax: number, yMax: number) {
  const area = Math.max(0.001, (xMax - xMin) * (yMax - yMin));
  return clamp(2.6 - area * 7.5, 0.4, 4.5);
}

function formatDistance(distanceEstimateMeters?: number) {
  if (!distanceEstimateMeters) {
    return "";
  }

  const rounded = distanceEstimateMeters >= 1.5
    ? Math.round(distanceEstimateMeters)
    : Math.round(distanceEstimateMeters * 10) / 10;
  return ` about ${rounded} meter${rounded === 1 ? "" : "s"} away`;
}

function buildSummary(objects: DetectedObject[], lowLight: boolean) {
  if (!objects.length) {
    return lowLight
      ? "No objects detected. The scene is dim, so move slowly and point the phone at better lighting."
      : "No objects detected. Move slowly or point the phone toward a more detailed scene.";
  }

  const fragments = objects
    .slice(0, 3)
    .map((item) => `${item.label} ${item.positionLabel}${formatDistance(item.distanceEstimateMeters)}`);
  const prefix = lowLight ? "Scene is dim. " : "";
  return `${prefix}${fragments.join(", ")}.`;
}

function buildUnknownObstacle(
  index: number,
  confidence: number,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
): DetectedObject | null {
  const area = Math.max(0, (xMax - xMin) * (yMax - yMin));
  if (confidence < UNKNOWN_OBJECT_THRESHOLD || area < 0.05) {
    return null;
  }

  return {
    id: `unknown-${index}`,
    label: "Unknown obstacle",
    icon: "devices",
    confidence: Math.max(0.15, Math.min(0.49, confidence)),
    positionLabel: describePosition((xMin + xMax) / 2),
    distanceEstimateMeters: estimateDistance(xMin, yMin, xMax, yMax),
    priority: "medium",
  };
}

function normalizeCoordinate(value: number, size: number) {
  "worklet";

  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value > 1) {
    return clamp(value / Math.max(size, 1), 0, 1);
  }
  return clamp(value, 0, 1);
}

function buildDetectedObject(candidate: SerializedDetectionCandidate, index: number) {
  const label = getCocoLabel(candidate.classIndex);
  if (!label) {
    return null;
  }

  return {
    id: `${label}-${index}`,
    label: label
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    icon: mapLabelToIcon(label),
    confidence: candidate.confidence,
    positionLabel: describePosition((candidate.xMin + candidate.xMax) / 2),
    distanceEstimateMeters: estimateDistance(
      candidate.xMin,
      candidate.yMin,
      candidate.xMax,
      candidate.yMax,
    ),
    priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
  } satisfies DetectedObject;
}

function pushDetectionVectorEntry(
  vector: number[],
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  confidence: number,
  classIndex: number,
) {
  "worklet";

  vector.push(xMin, yMin, xMax, yMax, confidence, classIndex);
}

function extractBoxClassifierDetectionVector(outputs: ArrayLike<ArrayBufferView>) {
  "worklet";

  const boxes = outputs[0] as Float32Array;
  const classes = outputs[1] as Float32Array;
  const scores = outputs[2] as Float32Array;
  const count = outputs[3] as Float32Array;
  const detectionCount = Math.min(Math.round(count?.[0] || 0), MAX_DETECTIONS);
  const vector: number[] = [];

  for (let index = 0; index < detectionCount; index += 1) {
    const baseIndex = index * 4;
    pushDetectionVectorEntry(
      vector,
      clamp(boxes[baseIndex + 1] || 0, 0, 1),
      clamp(boxes[baseIndex] || 0, 0, 1),
      clamp(boxes[baseIndex + 3] || 0, 0, 1),
      clamp(boxes[baseIndex + 2] || 0, 0, 1),
      clamp(scores[index] || 0, 0, 1),
      Math.max(0, Math.round(classes[index] || 0)),
    );
  }

  return vector;
}

function extractUltralyticsYoloDetectionVector(
  output: ArrayBufferView | undefined,
  options?: {
    inputWidth?: number;
    inputHeight?: number;
  },
) {
  "worklet";

  const values = output as unknown as ArrayLike<number> | undefined;
  const inputWidth = options?.inputWidth || DEFAULT_TFLITE_MODEL_INPUT_WIDTH;
  const inputHeight = options?.inputHeight || DEFAULT_TFLITE_MODEL_INPUT_HEIGHT;
  const detectionCount = Math.min(
    Math.floor((values?.length || 0) / DETECTION_VECTOR_STRIDE),
    MAX_YOLO_DETECTIONS,
  );
  const vector: number[] = [];

  for (let index = 0; index < detectionCount; index += 1) {
    const baseIndex = index * DETECTION_VECTOR_STRIDE;
    pushDetectionVectorEntry(
      vector,
      normalizeCoordinate(values?.[baseIndex] || 0, inputWidth),
      normalizeCoordinate(values?.[baseIndex + 1] || 0, inputHeight),
      normalizeCoordinate(values?.[baseIndex + 2] || 0, inputWidth),
      normalizeCoordinate(values?.[baseIndex + 3] || 0, inputHeight),
      clamp(values?.[baseIndex + 4] || 0, 0, 1),
      Math.max(0, Math.round(values?.[baseIndex + 5] || 0)),
    );
  }

  return vector;
}

export function extractTfliteDetectionVector(
  outputs: ArrayLike<ArrayBufferView>,
  options?: {
    inputWidth?: number;
    inputHeight?: number;
  },
) {
  "worklet";

  if (outputs.length === 1) {
    return extractUltralyticsYoloDetectionVector(outputs[0], options);
  }

  return extractBoxClassifierDetectionVector(outputs);
}

export function decodeTfliteDetectionVector(vector: ArrayLike<number>) {
  const candidates: SerializedDetectionCandidate[] = [];

  for (let index = 0; index + DETECTION_VECTOR_STRIDE - 1 < vector.length; index += DETECTION_VECTOR_STRIDE) {
    candidates.push({
      xMin: Number(vector[index] || 0),
      yMin: Number(vector[index + 1] || 0),
      xMax: Number(vector[index + 2] || 0),
      yMax: Number(vector[index + 3] || 0),
      confidence: Number(vector[index + 4] || 0),
      classIndex: Math.max(0, Math.round(Number(vector[index + 5] || 0))),
    });
  }

  return candidates;
}

export function extractTfliteDetectionCandidates(
  outputs: ArrayLike<ArrayBufferView>,
  options?: {
    inputWidth?: number;
    inputHeight?: number;
  },
) {
  return decodeTfliteDetectionVector(extractTfliteDetectionVector(outputs, options));
}

export function parseTfliteDetectionCandidates(
  candidates: SerializedDetectionCandidate[],
  threshold = DEFAULT_DETECTION_THRESHOLD,
) {
  const objects: DetectedObject[] = [];
  let unknownCandidate: DetectedObject | null = null;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (!candidate) {
      continue;
    }

    const maybeUnknown = buildUnknownObstacle(
      index,
      candidate.confidence,
      candidate.xMin,
      candidate.yMin,
      candidate.xMax,
      candidate.yMax,
    );
    if (maybeUnknown && (!unknownCandidate || maybeUnknown.confidence > unknownCandidate.confidence)) {
      unknownCandidate = maybeUnknown;
    }

    if (candidate.confidence < threshold) {
      continue;
    }

    const object = buildDetectedObject(candidate, index);
    if (object) {
      objects.push(object);
    }
  }

  if (!objects.length && unknownCandidate) {
    objects.push(unknownCandidate);
  }

  const lowLight = false;
  return {
    objects,
    summary: buildSummary(objects, lowLight),
    lowLight,
  };
}

function parseUltralyticsYoloOutputs(
  output: ArrayBufferView | undefined,
  threshold: number,
  options?: {
    inputWidth?: number;
    inputHeight?: number;
  },
) {
  return parseTfliteDetectionCandidates(
    decodeTfliteDetectionVector(extractUltralyticsYoloDetectionVector(output, options)),
    threshold,
  );
}

export function parseTfliteObjectDetectionOutputs(
  outputs: ArrayLike<ArrayBufferView>,
  threshold = DEFAULT_DETECTION_THRESHOLD,
  options?: {
    inputWidth?: number;
    inputHeight?: number;
  },
): { objects: DetectedObject[]; summary: string; lowLight: boolean } {
  return parseTfliteDetectionCandidates(
    extractTfliteDetectionCandidates(outputs, options),
    threshold,
  );
}

export function buildDetectionResultSummary(objects: DetectedObject[], averageLuma: number) {
  return buildSummary(objects, averageLuma < 70);
}
