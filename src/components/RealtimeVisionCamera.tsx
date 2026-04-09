import React, { memo, useEffect } from "react";
import {
  Camera,
  runAsync,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
} from "react-native-vision-camera";
import { TensorflowModel } from "react-native-fast-tflite";
import { useRunOnJS } from "react-native-worklets-core";
import { useResizePlugin } from "vision-camera-resize-plugin";

import { CAPTURE_INTERVAL_MS } from "../core/cameraConfig";
import {
  RealtimeFramePayload,
} from "../core/realtimeDetection";
import { extractTfliteDetectionVector } from "../lib/tfliteDetection";
import { DetectionInputConfig } from "../services/perceptionService";

const FRAME_PROCESSOR_TARGET_FPS = Math.max(1, Math.round(1000 / CAPTURE_INTERVAL_MS));
const CAMERA_FORMAT_FILTERS = [
  { videoResolution: { width: 1920, height: 1080 } },
  { fps: 30 },
] as const;

type RealtimeVisionCameraProps = {
  active: boolean;
  inputConfig: DetectionInputConfig | null;
  model: TensorflowModel | null;
  onCameraError: (message: string) => void;
  onInitialized: () => void;
  onFrameResult: (payload: RealtimeFramePayload) => void;
  onPreviewStarted: () => void;
  onPreviewStopped: () => void;
};

export const RealtimeVisionCamera = memo(function RealtimeVisionCamera({
  active,
  inputConfig,
  model,
  onCameraError,
  onInitialized,
  onFrameResult,
  onPreviewStarted,
  onPreviewStopped,
}: RealtimeVisionCameraProps) {
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [...CAMERA_FORMAT_FILTERS]);
  const { resize } = useResizePlugin();
  const emitFrameResult = useRunOnJS(
    (averageLuma: number, detectionVector: number[], capturedAt: number, inferenceTimeMs: number) => {
      onFrameResult({
        averageLuma,
        detectionVector,
        capturedAt,
        inferenceTimeMs,
      });
    },
    [onFrameResult],
  );
  const emitCameraError = useRunOnJS(onCameraError, [onCameraError]);

  useEffect(() => {
    if (active && !device) {
      onCameraError("Back camera is unavailable on this device.");
    }
  }, [active, device, onCameraError]);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";

      if (!active || !model || !inputConfig) {
        return;
      }

      runAtTargetFps(FRAME_PROCESSOR_TARGET_FPS, () => {
        "worklet";

        runAsync(frame, () => {
          "worklet";

          try {
            const capturedAt = Date.now();
            const inferenceStartedAt = Date.now();
            const resizedFrame = resize(frame, {
              scale: {
                width: inputConfig.width,
                height: inputConfig.height,
              },
              pixelFormat: "rgb",
              dataType: inputConfig.dataType,
            });
            // Avoid iterating a large shared Float32Array in the worklet hot path.
            const averageLuma = 128;
            const outputs = model.runSync([resizedFrame]);
            const detectionVector = extractTfliteDetectionVector(outputs, {
              inputHeight: inputConfig.height,
              inputWidth: inputConfig.width,
            });

            emitFrameResult(
              averageLuma,
              detectionVector,
              capturedAt,
              Date.now() - inferenceStartedAt,
            );
          } catch (error) {
            const message =
              typeof error === "object" && error && "message" in error
                ? String(error.message)
                : "Realtime frame processing failed.";
            emitCameraError(message);
          }
        });
      });
    },
    [active, emitCameraError, emitFrameResult, inputConfig, model, resize],
  );

  if (!device) {
    return null;
  }

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      format={format}
      isActive={active}
      preview
      photo={false}
      video={false}
      audio={false}
      fps={30}
      pixelFormat="yuv"
      lowLightBoost={device.supportsLowLightBoost}
      androidPreviewViewType="surface-view"
      resizeMode="cover"
      frameProcessor={frameProcessor}
      onInitialized={onInitialized}
      onPreviewStarted={onPreviewStarted}
      onPreviewStopped={onPreviewStopped}
      onError={(error) => {
        onCameraError(error.message || "Camera preview failed to start.");
      }}
    />
  );
});
