import { Directory, Paths } from "expo-file-system";
import React, { memo, useEffect, useRef } from "react";
import { Camera, useCameraDevice, useCameraFormat } from "react-native-vision-camera";

import { CAPTURE_INTERVAL_MS } from "../core/cameraConfig";
import { normalizeFileUri } from "../services/perceptionService";

const CAMERA_FORMAT_FILTERS = [
  { videoResolution: { width: 1920, height: 1080 } },
  { fps: 30 },
] as const;

const snapshotDirectory = new Directory(Paths.cache, "visionedge-captures");
const snapshotDirectoryPath = snapshotDirectory.uri.replace(/^file:\/\//, "");

export type RealtimeSnapshotPayload = {
  uri: string;
  width: number;
  height: number;
  capturedAt: number;
};

type RealtimeVisionCameraProps = {
  active: boolean;
  onCameraError: (message: string) => void;
  onInitialized: () => void;
  onSnapshot: (payload: RealtimeSnapshotPayload) => void;
  onPreviewStarted: () => void;
  onPreviewStopped: () => void;
};

export const RealtimeVisionCamera = memo(function RealtimeVisionCamera({
  active,
  onCameraError,
  onInitialized,
  onSnapshot,
  onPreviewStarted,
  onPreviewStopped,
}: RealtimeVisionCameraProps) {
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [...CAMERA_FORMAT_FILTERS]);
  const cameraRef = useRef<Camera>(null);
  const captureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureInFlightRef = useRef(false);
  const previewStartedRef = useRef(false);

  useEffect(() => {
    if (active && !device) {
      onCameraError("Back camera is unavailable on this device.");
    }
  }, [active, device, onCameraError]);

  useEffect(() => {
    let cancelled = false;

    if (!active) {
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
        captureTimerRef.current = null;
      }
      captureInFlightRef.current = false;
      previewStartedRef.current = false;
      return () => {
        cancelled = true;
      };
    }

    snapshotDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    const scheduleNext = (delayMs: number) => {
      if (cancelled) {
        return;
      }
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
      }
      captureTimerRef.current = setTimeout(() => {
        void captureSnapshot();
      }, Math.max(0, delayMs));
    };

    const captureSnapshot = async () => {
      if (cancelled || !active || captureInFlightRef.current) {
        return;
      }

      const camera = cameraRef.current;
      if (!camera) {
        scheduleNext(CAPTURE_INTERVAL_MS);
        return;
      }
      if (!previewStartedRef.current) {
        scheduleNext(CAPTURE_INTERVAL_MS);
        return;
      }

      captureInFlightRef.current = true;
      const startedAt = Date.now();

      try {
        const snapshot = await camera.takeSnapshot({
          quality: 70,
          path: snapshotDirectoryPath,
        });
        onSnapshot({
          uri: normalizeFileUri(snapshot.path),
          width: snapshot.width,
          height: snapshot.height,
          capturedAt: startedAt,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Realtime snapshot capture failed.";
        onCameraError(message);
      } finally {
        captureInFlightRef.current = false;
        scheduleNext(CAPTURE_INTERVAL_MS - (Date.now() - startedAt));
      }
    };

    scheduleNext(0);

    return () => {
      cancelled = true;
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
        captureTimerRef.current = null;
      }
      captureInFlightRef.current = false;
    };
  }, [active, onCameraError, onSnapshot]);

  if (!device) {
    return null;
  }

  return (
    <Camera
      ref={cameraRef}
      style={{ flex: 1 }}
      device={device}
      format={format}
      isActive={active}
      preview
      photo
      video={false}
      audio={false}
      fps={30}
      pixelFormat="yuv"
      androidPreviewViewType="surface-view"
      resizeMode="cover"
      onInitialized={onInitialized}
      onPreviewStarted={() => {
        previewStartedRef.current = true;
        onPreviewStarted();
      }}
      onPreviewStopped={() => {
        previewStartedRef.current = false;
        onPreviewStopped();
      }}
      onError={(error) => {
        previewStartedRef.current = false;
        onCameraError(error.message || "Camera preview failed to start.");
      }}
    />
  );
});
