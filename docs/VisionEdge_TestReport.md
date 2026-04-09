# VisionEdge Test Report

**Date:** April 10, 2026
**Device:** Nothing `A001` (`GalagaIND`), Android 16
**Package:** `com.anonymous.visionedge`
**Build / Launch Path:** `pnpm android` + `npx expo start --dev-client --clear`
**Connection:** USB ADB with `adb reverse tcp:8081 tcp:8081`

## Summary

| Total Cases | Passed | Failed | Blocked | Not Run |
|:-:|:-:|:-:|:-:|:-:|
| 39 | 6 | 0 | 2 | 31 |

## Key Evidence

- Metro/bootstrap issue was reproduced and then fixed for this run. The failing case was `Unable to load script` because no Metro process was actually serving `localhost:8081`.
- The prior `libVisionCameraTflite.so` startup crash was not reproduced after the model bootstrap change. The crash buffer remained empty for the successful relaunch.
- The bundled YOLO26s model was fetched from Metro once, cached locally, and then loaded from `file:///data/user/0/com.anonymous.visionedge/cache/models/yolo26s_float16.tflite`.
- Runtime log evidence on the device:
  - `[VisionEdge][perception] Cached bundled model from http://127.0.0.1:8081/... to file:///data/user/0/com.anonymous.visionedge/cache/models/yolo26s_float16.tflite.`
  - `[VisionEdge][perception] TFLite model ready with android-gpu delegate in 358ms.`
  - `[VisionEdge][model] Loaded 473 local TTS voice(s).`
  - `[VisionEdge][app] Assistance started. Waiting for camera readiness.`
  - `[VisionEdge][app] Camera preview is ready.`
  - `[VisionEdge][app] Camera ready. VisionCamera frame processor is active.`

## Executed Cases

| TC ID | Status | Notes |
|-------|--------|-------|
| TC-01 | Passed | After tapping Start Assistance, the device log showed VisionCamera session init and `Camera preview is ready` in about 0.8s. |
| TC-02 | Blocked | The camera session reached streaming state and VisionCamera reported `invokeOnAverageFpsChanged(33.755...)`, but this pass did not produce a stable in-app debug capture showing the on-screen frame counter/queue after assistance started. |
| TC-03 | Blocked | The detector and frame processor initialized, but this session did not complete a controlled real-scene object validation with spoken detection output. |
| TC-23 | Passed | Single tap on Start Assistance triggered speech confirmation and camera startup on the physical device. |
| TC-31 | Passed | Home screen rendered with title, status card, Start Assistance button, and Settings button visible after the intro transition. |
| TC-36 | Passed | Vision model loaded successfully at app startup. Local-device log confirmed cached local file usage and model readiness in 358ms. |
| TC-37 | Passed | Offline TTS initialized successfully at startup. Log showed 473 local voices available before assistance began. |
| TC-38 | Passed | The app reported Android GPU delegate activation. TensorFlow Lite logs confirmed delegate creation and partial GPU delegation instead of CPU-only inference. |

## Remaining Cases

- `TC-04` to `TC-22`, excluding the cases above: Not run in this session.
- `TC-24` to `TC-30`, excluding the cases above: Not run in this session.
- `TC-32` to `TC-35`, `TC-39`: Not run in this session.

## Screenshots

- Intro screen capture: `../screenshots/adb-intro-screen.png`
- Home screen capture: `../screenshots/adb-home-screen.png`
- Assistance live-state capture: placeholder pending a stable foreground capture while assistance is running

## Current Assessment

The Android startup path is materially healthier than before. The app now boots on the physical device, connects to Metro when Metro is actually running, initializes local TTS, caches the bundled YOLO26s model to a local file, and loads the model without reproducing the earlier JNI crash. The next highest-value validation step is a focused on-device pass for `TC-02`, `TC-03`, `TC-12`, `TC-17`, `TC-24`, and `TC-25` while assistance is active in the foreground.
