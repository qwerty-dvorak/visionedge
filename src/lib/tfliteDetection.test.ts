import { fromByteArray } from "base64-js";
import { encode } from "jpeg-js";

import {
  buildDetectionResultSummary,
  decodeTfliteDetectionVector,
  extractTfliteDetectionVector,
  parseTfliteObjectDetectionOutputs,
  preprocessJpegBase64ForTflite,
} from "./tfliteDetection";

describe("tflite detection helpers", () => {
  it("parses SSD MobileNet outputs into detected objects", () => {
    const outputs = [
      new Float32Array([
        0.1, 0.2, 0.7, 0.6,
        0.2, 0.65, 0.8, 0.95,
      ]),
      new Float32Array([1, 73]),
      new Float32Array([0.95, 0.8]),
      new Float32Array([2]),
    ] as const;

    const result = parseTfliteObjectDetectionOutputs(outputs, 0.5);

    expect(result.objects).toHaveLength(2);
    expect(result.objects[0]?.label).toBe("Person");
    expect(result.objects[1]?.label).toBe("Laptop");
  });

  it("builds a no-objects summary for sparse scenes", () => {
    expect(buildDetectionResultSummary([], 120)).toContain("No objects detected");
  });

  it("marks dim scenes in the summary when luma is low", () => {
    const summary = buildDetectionResultSummary(
      [
        {
          id: "chair-0",
          label: "Chair",
          icon: "chair",
          confidence: 0.9,
          positionLabel: "ahead",
          distanceEstimateMeters: 1.2,
          priority: "high",
        },
      ],
      50,
    );

    expect(summary).toContain("Scene is dim");
  });

  it("produces an unknown obstacle when only low-confidence large boxes exist", () => {
    const outputs = [
      new Float32Array([0.2, 0.2, 0.8, 0.8]),
      new Float32Array([1]),
      new Float32Array([0.2]),
      new Float32Array([1]),
    ] as const;

    const result = parseTfliteObjectDetectionOutputs(outputs, 0.5);

    expect(result.objects).toHaveLength(1);
    expect(result.objects[0]?.label).toBe("Unknown obstacle");
    expect(result.summary).toContain("about");
  });

  it("supports float32 preprocessing for metadata-driven models", () => {
    const encoded = encode(
      {
        width: 1,
        height: 1,
        data: Uint8Array.from([255, 0, 0, 255]),
      },
      90,
    );

    const result = preprocessJpegBase64ForTflite(fromByteArray(encoded.data), {
      width: 2,
      height: 2,
      dataType: "float32",
    });

    expect(result.input).toBeInstanceOf(Float32Array);
    expect(result.input[0]).toBeGreaterThan(0.9);
  });

  it("parses Ultralytics end-to-end YOLO detections from a single output tensor", () => {
    const outputs = [
      new Float32Array([
        0.1, 0.2, 0.5, 0.9, 0.86, 3,
        0.55, 0.25, 0.95, 0.75, 0.68, 1,
      ]),
    ] as const;

    const result = parseTfliteObjectDetectionOutputs(outputs, 0.5, {
      inputWidth: 640,
      inputHeight: 640,
    });

    expect(result.objects).toHaveLength(2);
    expect(result.objects[0]?.label).toBe("Car");
    expect(result.objects[1]?.label).toBe("Person");
  });

  it("parses Ultralytics YOLO detections when coordinates are scaled to input pixels", () => {
    const outputs = [
      new Float32Array([
        64, 128, 320, 576, 0.9, 3,
      ]),
    ] as const;

    const result = parseTfliteObjectDetectionOutputs(outputs, 0.5, {
      inputWidth: 640,
      inputHeight: 640,
    });

    expect(result.objects).toHaveLength(1);
    expect(result.objects[0]?.label).toBe("Car");
    expect(result.objects[0]?.positionLabel).toBe("left");
  });

  it("serializes detections into a compact numeric vector", () => {
    const outputs = [
      new Float32Array([0.1, 0.2, 0.7, 0.6]),
      new Float32Array([1]),
      new Float32Array([0.95]),
      new Float32Array([1]),
    ] as const;

    const vector = extractTfliteDetectionVector(outputs);
    const candidates = decodeTfliteDetectionVector(vector);

    expect(vector).toHaveLength(6);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.xMin).toBeCloseTo(0.2, 5);
    expect(candidates[0]?.yMin).toBeCloseTo(0.1, 5);
    expect(candidates[0]?.xMax).toBeCloseTo(0.6, 5);
    expect(candidates[0]?.yMax).toBeCloseTo(0.7, 5);
    expect(candidates[0]?.confidence).toBeCloseTo(0.95, 5);
    expect(candidates[0]?.classIndex).toBe(1);
  });
});
