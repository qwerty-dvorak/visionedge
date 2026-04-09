import { dequeueLatestFrame, getCaptureBlockReason, shouldStartCaptureLoop } from "./captureLoop";

describe("capture loop gating", () => {
  it("blocks capture until the camera preview is ready", () => {
    expect(
      getCaptureBlockReason({
        captureInFlight: false,
        hasCameraRef: true,
        cameraReady: false,
        hasSettings: true,
        isForegroundTab: true,
        mode: "active",
        appState: "active",
      }),
    ).toBe("the camera preview has not reported ready yet");
  });

  it("blocks capture when assistance is not active", () => {
    expect(
      getCaptureBlockReason({
        captureInFlight: false,
        hasCameraRef: true,
        cameraReady: true,
        hasSettings: true,
        isForegroundTab: true,
        mode: "initializing",
        appState: "active",
      }),
    ).toBe("mode is initializing");
  });

  it("blocks capture outside the home tab to keep navigation responsive", () => {
    expect(
      getCaptureBlockReason({
        captureInFlight: false,
        hasCameraRef: true,
        cameraReady: true,
        hasSettings: true,
        isForegroundTab: false,
        mode: "active",
        appState: "active",
      }),
    ).toBe("the active tab is not Home");
  });

  it("allows the interval only when mode, camera, and app state are all active", () => {
    expect(
      shouldStartCaptureLoop({
        mode: "active",
        cameraReady: true,
        isForegroundTab: true,
        appState: "active",
      }),
    ).toBe(true);

    expect(
      shouldStartCaptureLoop({
        mode: "active",
        cameraReady: false,
        isForegroundTab: true,
        appState: "active",
      }),
    ).toBe(false);

    expect(
      shouldStartCaptureLoop({
        mode: "active",
        cameraReady: true,
        isForegroundTab: false,
        appState: "active",
      }),
    ).toBe(false);
  });

  it("keeps only the latest queued frame when processing falls behind", () => {
    const queue = ["frame-1", "frame-2", "frame-3"];

    expect(dequeueLatestFrame(queue)).toEqual({
      next: "frame-3",
      dropped: 2,
    });
    expect(queue).toEqual([]);
  });
});
