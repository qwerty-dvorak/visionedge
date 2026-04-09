import {
  buildDetectionResultFromRealtimePayload,
  estimateAverageLumaFromRgb,
} from "./realtimeDetection";

describe("realtimeDetection", () => {
  it("estimates luma from uint8 rgb buffers", () => {
    const luma = estimateAverageLumaFromRgb(
      new Uint8Array([
        255, 255, 255,
        0, 0, 0,
        255, 0, 0,
        0, 255, 0,
      ]),
      "uint8",
    );

    expect(luma).toBeGreaterThan(80);
    expect(luma).toBeLessThan(200);
  });

  it("builds a local detection result from serialized candidates", () => {
    const result = buildDetectionResultFromRealtimePayload(
      {
        averageLuma: 120,
        detectionVector: [
          20 / 448,
          40 / 448,
          220 / 448,
          280 / 448,
          0.82,
          3,
        ],
        capturedAt: 1234,
        inferenceTimeMs: 88,
      },
    );

    expect(result.backend).toBe("local-tflite");
    expect(result.lowLight).toBe(false);
    expect(result.objects[0]?.label).toBe("Car");
    expect(result.summary.toLowerCase()).toContain("car");
  });
});
