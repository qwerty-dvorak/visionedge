# VisionEdge Test Report

**Date:** April 10, 2026  
**Device:** Nothing `A001` (`GalagaIND`), Android 16  
**Package:** `com.anonymous.visionedge`  
**Build / Launch Path:** Expo dev-client over Metro with ADB reverse  
**Connection:** USB ADB with `adb reverse tcp:8081 tcp:8081`

## Summary

| Total Cases | Passed | Failed | Blocked | Not Run |
|:-:|:-:|:-:|:-:|:-:|
| 39 | 24 | 4 | 11 | 0 |

## Evidence Sources

- **Automated:** `pnpm test --runInBand` passed with `9/9` suites and `33/33` tests.
- **Static implementation review:** settings persistence, retry/error routing, action confirmations, and speech-failure fallback were verified against the current source.
- **Physical device:** ADB-driven validation on device `001956545002966` using `logcat`, `uiautomator dump`, `run-as`, and `dumpsys meminfo`.

## Key Findings

- The old realtime crash is no longer the dominant issue. The current snapshot-based path runs on device, produces repeated detections, and speaks results without the prior native `SIGSEGV`.
- End-to-end live latency is now measurable on device and is under the formal `2s` target in the sampled UI evidence: `1547 ms` while active and `1766 ms` after stopping.
- Stop and cleanup behavior improved materially. After stopping assistance, `cache/visionedge-captures/` was deleted and only fonts, HTTP cache metadata, and the bundled model remained.
- Privacy is still not fully compliant during an active session. While assistance is running, transient snapshot JPEGs still appear under `cache/visionedge-captures/`.
- Memory remains the largest hard failure. During an active session, `dumpsys meminfo` reported `TOTAL PSS: 631210 KB`, well above the `200 MB` requirement.
- Capture cadence is still too slow for the formal realtime throughput case. The live UI showed `12 frames` captured with average latency around `1.7s`, which is below the `2 fps` target.

## Key Device Evidence

- Runtime bootstrap:
  - `[VisionEdge][app] Bootstrapping VisionEdge runtime.`
  - `[VisionEdge][speech] Speech engine initialized with 473 available voice(s).`
  - `[VisionEdge][model] Loaded 473 local TTS voice(s). Preferred voice: en-au-x-auc-local.`
  - `[VisionEdge][perception] TFLite model ready with android-gpu delegate in 314ms.`
  - `[VisionEdge][app] VisionEdge runtime is ready.`
- Live assistance:
  - `Live camera preview`
  - `Assistance ON`
  - `1547 ms`
  - `Queue 2`
  - `Unknown obstacle ahead about 0.4 meters away.`
  - repeated logcat entries such as:
    - `[VisionEdge][perception] TFLite detection produced 1 object(s)...`
    - `[VisionEdge][speech] Queueing speech: "Pizza left"`
    - `[VisionEdge][speech] Queueing speech: "Unknown obstacle far right"`
- Stop path and cleanup:
  - `[VisionEdge][perception] Deleted transient cache directory file:///data/user/0/com.anonymous.visionedge/cache/visionedge-captures/.`
  - `[VisionEdge][speech] Queueing speech: "Visual assistance stopped."`
  - `[VisionEdge][app] Assistance stopped.`
  - post-stop UI dump:
    - `Assistance OFF`
    - `Start Assistance`
    - `Queue 0`
- Storage audits:
  - active session:
    - `cache/visionedge-captures/mrousavy5356328509294287881.jpg`
  - after stop:
    - `cache/models/yolo26s_float16.tflite`
    - no `cache/visionedge-captures/*.jpg`
- Memory:
  - `TOTAL PSS: 631210`
  - `Native Heap: 313792 KB`
  - `Graphics: 56043 KB`

## Full Execution Matrix

| TC ID | Status | Source | Notes |
|-------|--------|--------|-------|
| TC-01 | Passed | Device | Camera preview reached the active state and the UI showed `Live camera preview` with `Assistance ON`. |
| TC-02 | Failed | Device | The live UI reached only `12 frames` with average latency around `1.7s`, so the formal `>= 2 fps` requirement is not met. |
| TC-03 | Passed | Device | Repeated live detections were observed on hardware, including `Pizza left`, `Backpack right`, and `Unknown obstacle ahead`. |
| TC-04 | Passed | Device | Permission flow still handles denial gracefully through the onboarding permission gate and spoken permission messaging. |
| TC-05 | Blocked | Device | Mid-session camera removal/disconnect was not injected in this pass, so graceful degradation under real hardware loss was not fully exercised. |
| TC-06 | Passed | Device | Low-light warnings were observed live, including `Low light detected. Couch ahead`. |
| TC-07 | Passed | Jest | `src/lib/narration.test.ts` verifies valid single-object narration output. |
| TC-08 | Blocked | Device | A controlled multi-object scene was not staged specifically for this testcase, although live detections of 2 objects were observed incidentally. |
| TC-09 | Passed | Jest | `src/lib/narration.test.ts` verifies narration changes when the scene changes. |
| TC-10 | Passed | Jest | `src/lib/narration.test.ts` verifies duplicate suppression for unchanged scenes. |
| TC-11 | Passed | Device + Jest | `No objects detected.` was observed live, and `src/lib/tfliteDetection.test.ts` covers the empty-result summary path. |
| TC-12 | Passed | Device | Speech output was repeatedly queued and played on device after detections and action confirmations. |
| TC-13 | Blocked | Device | Full airplane-mode validation was not executed in this pass. |
| TC-14 | Blocked | Device | Headphone routing was not exercised on hardware in this session. |
| TC-15 | Passed | Source | `speechService` and app-level error handling provide stop, error logging, haptic fallback, and error-state routing on synthesis failure. |
| TC-16 | Blocked | Device + Source | Queueing is implemented, but a controlled rapid-scene-change playback run was not measured specifically against this testcase. |
| TC-17 | Passed | Device | Active-session UI evidence showed `1547 ms`; stopped-session summary showed `1766 ms`, both within the `< 2000 ms` requirement. |
| TC-18 | Blocked | Device | No separate high-end NPU/GPU reference device was used. |
| TC-19 | Blocked | Device | A dedicated `60s` continuous run was not captured end-to-end in this pass. |
| TC-20 | Blocked | Device | The formal `5-minute` battery drain run was not executed. |
| TC-21 | Failed | Device | `dumpsys meminfo` reported `TOTAL PSS: 631210 KB`, above the `200 MB` requirement. |
| TC-22 | Failed | Device | Load shedding is not strong enough yet; the queue rose above zero and capture cadence stayed slow instead of reducing work enough to preserve responsiveness. |
| TC-23 | Passed | Device | Single-tap Start Assistance brought the app to `Assistance ON` with spoken confirmation. |
| TC-24 | Passed | Device | Single-tap Stop Assistance returned the UI to `Assistance OFF`, spoke a stop confirmation, and released the camera preview. |
| TC-25 | Passed | Device + Source | Start, stop, permission grant, navigation, and settings actions all produce spoken confirmations in the current implementation. |
| TC-26 | Blocked | Source | Controls expose accessibility labels, but a full TalkBack traversal on-device was not executed in this pass. |
| TC-27 | Passed | UI dump | The primary button bounds remain above the minimum touch-target requirement. |
| TC-28 | Blocked | Environment | This is a dev-client + Metro validation setup. Network activity related to localhost bundle delivery cannot be used to judge packaged offline privacy behavior. |
| TC-29 | Failed | Device | While assistance was active, transient JPEGs still appeared under `cache/visionedge-captures/`. |
| TC-30 | Passed | Device | After stopping assistance, transient capture files were removed from app cache. |
| TC-31 | Passed | Device | Home UI rendered correctly with title, status banner, action buttons, and bottom navigation. |
| TC-32 | Passed | Source + Jest | Speech-rate settings exist, persist, and produce spoken change announcements. |
| TC-33 | Passed | Source + Jest | Verbosity settings exist and narration generation varies by verbosity level. |
| TC-34 | Passed | Source | A dedicated `ErrorScreen` with recovery copy and `Retry` button is present in the current app. |
| TC-35 | Passed | Source | Retry logic clears the error, rechecks permission, and restarts assistance. |
| TC-36 | Passed | Device | Vision model loaded successfully on startup and reached ready state before assistance. |
| TC-37 | Passed | Device | Offline TTS initialized successfully with `473` local voices detected. |
| TC-38 | Passed | Device | TFLite reported Android GPU delegate activation and partial GPU partitioning. |
| TC-39 | Blocked | Source | Corrupted-model handling was not injected into the installed device build during this pass. |

## Automated Coverage Used In This Report

- `src/services/perceptionService.test.ts`
  - GPU-first model loading
  - delegate fallback sequence
  - local TFLite inference path
  - file URI normalization
- `src/services/modelRuntime.test.ts`
  - low-latency voice preference
  - model metadata reporting
- `src/services/speechService.test.ts`
  - speech engine initialization
  - queued local speech playback
- `src/lib/narration.test.ts`
  - scene-change narration
  - duplicate suppression
  - low-light prioritization
  - settings-change narration
- `src/lib/tfliteDetection.test.ts`
  - no-object summary
  - low-light summaries
  - unknown obstacle fallback
  - YOLO output parsing
- `src/core/cameraConfig.test.ts`
  - 1080-style capture preference
  - 250ms target cadence export
- `src/core/captureLoop.test.ts`
  - camera-ready gating
  - active-mode gating
  - bounded queue behavior

## Screenshots And Artifacts

- Current device UI evidence came from live `uiautomator dump` captures rather than only static screenshots.
- Existing repo screenshots remain relevant for documentation context:
  - `screenshots/adb-home-screen.png`
  - `screenshots/adb-intro-screen.png`
  - `screenshots/main_screen.jpeg`
  - `screenshots/debug_screen.jpeg`
  - `screenshots/onboard_screen.jpeg`
  - `screenshots/settings_sreen.jpeg`

## Current Assessment

The high failure count in the older report was mostly due to stale evidence from the earlier crashing realtime path. The app now runs live detection and narration on the physical device, and a large portion of the formal cases pass. The remaining true failures are narrower and concrete:

- realtime throughput is still too slow for the formal frame-rate target
- memory usage is far above target while active
- transient snapshot JPEGs are still written during active assistance
- load shedding is not yet strong enough to keep the queue consistently near zero
