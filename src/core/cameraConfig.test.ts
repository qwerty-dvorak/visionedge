import {
  CAPTURE_INTERVAL_MS,
  TARGET_CAPTURE_HEIGHT,
  TARGET_CAPTURE_WIDTH,
  chooseCapturePictureSize,
} from "./cameraConfig";

describe("cameraConfig", () => {
  it("prefers the nearest 1080p style capture size", () => {
    expect(
      chooseCapturePictureSize(["640x480", "1280x720", "1920x1080", "4032x3024"]),
    ).toBe("1920x1080");
  });

  it("falls back to the closest ratio when exact 1080p is unavailable", () => {
    expect(chooseCapturePictureSize(["1440x1080", "1600x900", "2560x1440"])).toBe("1600x900");
  });

  it("exports the faster capture cadence target", () => {
    expect(TARGET_CAPTURE_WIDTH).toBe(1920);
    expect(TARGET_CAPTURE_HEIGHT).toBe(1080);
    expect(CAPTURE_INTERVAL_MS).toBe(250);
  });
});
