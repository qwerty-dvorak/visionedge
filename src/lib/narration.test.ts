import { buildNarrationEvent, describeSettingsChange } from "./narration";
import { AppSettings, DetectionResult } from "../types/app";

const settings: AppSettings = {
  speechRate: 1,
  verbosity: "detailed",
  audioOutputMode: "speaker",
  vibrationEnabled: true,
  lowLightAlertsEnabled: true,
  geminiFallbackEnabled: false,
  confirmActions: true,
  debugMode: true,
};

const sampleResult: DetectionResult = {
  summary: "A chair is ahead.",
  lowLight: false,
  backend: "local-simulated",
  sceneHash: "scene-a",
  inferenceTimeMs: 120,
  capturedAt: 1,
  objects: [
    {
      id: "chair",
      label: "Chair",
      icon: "chair",
      confidence: 0.9,
      positionLabel: "ahead",
      distanceEstimateMeters: 1.1,
      priority: "high",
    },
  ],
};

describe("buildNarrationEvent", () => {
  it("speaks when the scene changes", () => {
    const event = buildNarrationEvent(null, sampleResult, settings, null);
    expect(event.shouldSpeak).toBe(true);
    expect(event.text).toContain("Chair");
  });

  it("suppresses duplicate narration inside five seconds", () => {
    jest.spyOn(Date, "now").mockReturnValue(4000);
    const event = buildNarrationEvent(sampleResult, sampleResult, settings, 1000);
    expect(event.shouldSpeak).toBe(false);
    jest.restoreAllMocks();
  });

  it("prioritizes low-light warnings", () => {
    const event = buildNarrationEvent(
      sampleResult,
      { ...sampleResult, lowLight: true },
      settings,
      null,
    );
    expect(event.reason).toBe("low-light");
  });
});

describe("describeSettingsChange", () => {
  it("formats speech rate updates", () => {
    expect(describeSettingsChange("speechRate", 1.25)).toContain("1.25");
  });
});
