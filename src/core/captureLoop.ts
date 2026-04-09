import { AppStateStatus } from "react-native";

import { AppMode } from "../types/app";

type CaptureGateState = {
  captureInFlight: boolean;
  hasCameraRef: boolean;
  cameraReady: boolean;
  hasSettings: boolean;
  isForegroundTab: boolean;
  mode: AppMode;
  appState: AppStateStatus;
};

export function getCaptureBlockReason(state: CaptureGateState): string | null {
  if (state.captureInFlight) {
    return "a previous capture is still in flight";
  }

  if (!state.hasCameraRef) {
    return "the camera ref is not ready yet";
  }

  if (!state.cameraReady) {
    return "the camera preview has not reported ready yet";
  }

  if (!state.hasSettings) {
    return "settings are not loaded yet";
  }

  if (!state.isForegroundTab) {
    return "the active tab is not Home";
  }

  if (state.mode !== "active") {
    return `mode is ${state.mode}`;
  }

  if (state.appState !== "active") {
    return `app state is ${state.appState}`;
  }

  return null;
}

export function shouldStartCaptureLoop(state: {
  mode: AppMode;
  cameraReady: boolean;
  isForegroundTab: boolean;
  appState: AppStateStatus;
}) {
  return (
    state.mode === "active" &&
    state.cameraReady &&
    state.isForegroundTab &&
    state.appState === "active"
  );
}

export function dequeueLatestFrame<T>(queue: T[]) {
  if (!queue.length) {
    return {
      next: null as T | null,
      dropped: 0,
    };
  }

  const next = queue[queue.length - 1] ?? null;
  const dropped = Math.max(0, queue.length - 1);
  queue.length = 0;

  return {
    next,
    dropped,
  };
}
