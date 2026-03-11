# VisionEdge – Test Case Specification

**Project:** VisionEdge: Latency-Optimized Local Perception & TTS Pipeline
**Course:** Software Engineering Lab | Version 1.0 | February 2026
**Team:** Ayan Gattani (23BCT0059) · Madhav Juneja (23BCT0111) · Adheesh Garg (23BCT0122)
**Instructor:** Dr. Swarnalatha P | Lab Section: L23+L24

---

## Summary

| Total Test Cases | Modules Covered | Priority: High | Priority: Medium | Status |
|:-:|:-:|:-:|:-:|:-:|
| 39 | 8 | 25 | 14 | All Pending |

---

## Module 1 — Real-Time Visual Perception (REQ-1 to REQ-4)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-01 | Camera Initialization | Verify camera activates when visual assistance is enabled | App installed; camera permission granted | 1. Launch app 2. Tap Start button 3. Observe camera preview indicator | Camera session initializes within 2s; no error audio played | — | Pending | High |
| TC-02 | Real-Time Frame Capture | Verify video frames are captured continuously after start | Camera initialized (TC-01 passed) | 1. Start assistance 2. Point camera at scene 3. Monitor frame counter in debug mode | Frames captured at minimum 2 fps; no dropped stream for >5s | — | Pending | High |
| TC-03 | Object Detection Execution | Verify on-device vision model detects objects in the scene | Camera active; TFLite model loaded | 1. Point camera at a scene with 2+ identifiable objects 2. Wait 2s 3. Observe audio output | At least one object correctly identified; detection result non-empty | — | Pending | High |
| TC-04 | Camera Permission Denied | Verify system handles camera permission denial gracefully | App installed; camera permission NOT granted | 1. Revoke camera permission in settings 2. Launch app 3. Tap Start | Audio alert: "Camera access is unavailable. Please enable camera permission." | — | Pending | High |
| TC-05 | Camera Unavailable Mid-Session | Verify system handles mid-session camera disconnection | App running; camera active | 1. Start assistance 2. Simulate camera disconnect 3. Observe response | Audio alert played; app transitions to ERROR state gracefully; no crash | — | Pending | High |
| TC-06 | Low-Light Scene Detection | Verify system behavior under low-light or obscured camera conditions | Camera active; dim environment | 1. Start assistance in low-light room 2. Observe detection output | System either detects available objects or plays low-confidence audio cue; no silent failure | — | Pending | Medium |

---

## Module 2 — Text Description Generation (REQ-5 to REQ-7)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-07 | Single Object Description | Verify a single detected object produces a valid text description | Vision model running; one object in frame | 1. Show single object (e.g., chair) to camera 2. Wait for narration | Description contains object name, e.g., "A chair is detected ahead." | — | Pending | High |
| TC-08 | Multiple Object Description | Verify multiple objects are described concisely without repetition | Vision model running; 3+ objects in frame | 1. Show 3 distinct objects to camera 2. Observe audio output | Description mentions top objects by priority; total description under 15 words | — | Pending | High |
| TC-09 | Scene Change Detection | Verify descriptions update dynamically as scene changes | Assistance active; initial scene narrated | 1. Start with object A in frame 2. Replace with object B 3. Observe re-narration | New description triggered for object B; old description not repeated if scene unchanged | — | Pending | High |
| TC-10 | Static Scene Suppression | Verify no repeated narration when scene is unchanged for >5s | Assistance active; static scene | 1. Hold camera still on same scene 2. Wait 10 seconds 3. Count narrations | Maximum 1 narration per 5s for an unchanged scene; no duplicate audio | — | Pending | Medium |
| TC-11 | Empty Detection Result | Verify graceful handling when no objects are detected | Camera active; empty or featureless scene | 1. Point camera at blank white wall 2. Wait 3 seconds | Audio cue: "No objects detected." or equivalent; no silent failure or crash | — | Pending | Medium |

---

## Module 3 — Offline TTS Output (REQ-8 to REQ-10)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-12 | Basic TTS Audio Output | Verify text description is converted to audible speech | TTS model loaded; description generated | 1. Generate a detection result 2. Observe audio output through speaker | Clear, intelligible speech plays within 2s of description generation | — | Pending | High |
| TC-13 | Offline Operation | Verify TTS functions with no internet connection | App installed; airplane mode ON | 1. Enable airplane mode 2. Start assistance 3. Point camera at object | Speech output plays normally; no network errors; no degradation in quality | — | Pending | High |
| TC-14 | Headphone Audio Routing | Verify audio routes correctly to connected headphones | Wired/BT headphones connected; assistance active | 1. Connect headphones 2. Start assistance 3. Observe audio output destination | Audio plays through headphones, not device speaker | — | Pending | Medium |
| TC-15 | Audio Output Failure Handling | Verify system handles audio output failure gracefully | App running; audio output forcibly disabled | 1. Mute device or disable audio 2. Trigger detection 3. Observe behavior | System logs error; visual or haptic fallback notification displayed; no crash | — | Pending | High |
| TC-16 | TTS Queue Handling | Verify back-to-back descriptions are queued and played without overlap | Assistance active; rapidly changing scene | 1. Move camera across multiple distinct objects quickly 2. Observe audio output | Audio plays sequentially without overlap; no audio corruption | — | Pending | Medium |

---

## Module 4 — Low-Latency Processing (REQ-11 to REQ-12, PERF-1 to PERF-4)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-17 | End-to-End Latency < 2 Seconds | Verify total latency from frame capture to audio output is under 2s | App active; target device; test object in frame | 1. Start assistance 2. Present known object 3. Measure time from frame to audio start | End-to-end latency <= 2000ms on reference device | — | Pending | High |
| TC-18 | Sub-1s Latency on High-End Device | Verify latency target of <1s on devices with NPU/GPU acceleration | High-end Android device with NPU; app active | 1. Start assistance 2. Present object 3. Measure audio start time | Latency < 1000ms on supported high-end devices | — | Pending | Medium |
| TC-19 | Sustained 60-Second Operation | Verify system runs continuously for 60s without interruption or crash | App active; varied scene | 1. Start assistance 2. Move camera across different scenes for 60 seconds 3. Observe stability | No crashes, no ANR dialogs, continuous audio feedback throughout | — | Pending | High |
| TC-20 | Battery Consumption | Verify app does not excessively drain battery during 5-minute session | Fully charged device; baseline battery drain measured | 1. Run assistance for 5 minutes 2. Measure battery % change | Battery drain < 5% over 5 minutes on a modern device | — | Pending | Medium |
| TC-21 | Memory Usage Within Bounds | Verify combined model memory footprint stays below 200 MB | App running; models loaded | 1. Launch app 2. Start assistance 3. Check memory usage via profiler | Total app memory (vision + TTS models + runtime) < 200 MB RAM | — | Pending | High |
| TC-22 | Frame-Skip Logic Under Load | Verify frame-skip reduces redundant computation on static scenes | App active; static scene held for 10s | 1. Hold camera still on scene 2. Monitor inference call count via debug mode | Inference calls reduce after scene stabilizes; CPU usage drops noticeably | — | Pending | Medium |

---

## Module 5 — Accessibility & User Control (REQ-13 to REQ-15)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-23 | Start Assistance | Verify user can start assistance with a single tap | App on Home screen; assistance OFF | 1. Tap the Start button once | Assistance activates; audio confirms "Visual assistance started" | — | Pending | High |
| TC-24 | Stop Assistance | Verify user can stop assistance with a single tap | Assistance currently ACTIVE | 1. Tap Stop button once | Assistance stops; camera releases; audio confirms "Visual assistance stopped" | — | Pending | High |
| TC-25 | Audio Confirmation for Actions | Verify every user action produces audio confirmation | App running | 1. Tap Start — listen for confirm 2. Tap Stop — listen for confirm 3. Adjust settings — listen for confirm | Audio confirmation plays within 500ms for each action | — | Pending | High |
| TC-26 | TalkBack Compatibility | Verify all UI controls are accessible via Android TalkBack screen reader | TalkBack enabled on device | 1. Enable TalkBack 2. Navigate to app 3. Swipe through all controls | All buttons have correct content descriptions read aloud by TalkBack | — | Pending | Medium |
| TC-27 | Large Touch Target | Verify primary button meets minimum 72dp touch target requirement | App on Home screen | 1. Inspect layout with Android Layout Inspector 2. Measure Start button dimensions | Start button touch target >= 72dp x 72dp | — | Pending | Medium |

---

## Module 6 — Privacy & Security (SEC-1 to SEC-3, BR-1 to BR-3)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-28 | No Network Transmission | Verify no data is transmitted over network during operation | Network monitoring tool active (e.g., Charles Proxy); app running | 1. Start assistance for 60s with active camera 2. Monitor all network traffic | Zero outbound network requests from the app at any point | — | Pending | High |
| TC-29 | No Persistent Video Storage | Verify raw video frames are not written to device storage | App active; file system monitoring enabled | 1. Run assistance for 2 minutes 2. Check app's internal storage and SD card for video files | No video or image files created in app storage; only config DB present | — | Pending | High |
| TC-30 | Session Data Discarded on Exit | Verify temporary processing data is cleared when app closes | App was running; user force-closes the app | 1. Run assistance 2. Force close app 3. Inspect app data directory | No temporary frame data or audio buffers persisted to disk after close | — | Pending | Medium |

---

## Module 7 — User Interface (REQ-13 to REQ-15, Screens 1–3)

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-31 | Home Screen Rendering | Verify Home screen displays correctly with all elements visible | App freshly installed and launched | 1. Launch app 2. Observe Home screen layout | Title, status label, Start button, and Settings icon all visible and correctly positioned | — | Pending | Medium |
| TC-32 | Settings — Speech Rate Adjustment | Verify speech rate slider changes TTS output speed | App on Settings screen | 1. Open Settings 2. Move speech rate slider to 2.0x 3. Return and trigger detection | TTS speech noticeably faster; audio confirms new rate value | — | Pending | Medium |
| TC-33 | Settings — Verbosity Change | Verify verbosity setting affects description detail level | App on Settings screen | 1. Set verbosity to "Detailed" 2. Trigger detection 3. Compare to "Minimal" output | "Detailed" produces longer description with spatial context; "Minimal" produces shorter description | — | Pending | Medium |
| TC-34 | Error State Display | Verify error screen displays and announces error correctly | App running; camera forcibly unavailable | 1. Revoke camera permission mid-session 2. Observe UI transition | Error screen shown with icon + description; TTS announces error message; Retry button present | — | Pending | High |
| TC-35 | Retry from Error State | Verify Retry button attempts subsystem reinitialization | App in ERROR state (TC-34) | 1. Re-grant camera permission 2. Tap Retry button | App reinitializes camera; transitions back to IDLE state; audio confirms recovery | — | Pending | High |

---

## Module 8 — Model Loading & Initialization

| TC ID | Test Case Name | Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Priority |
|-------|---------------|-------------|----------------|------------|-----------------|---------------|--------|----------|
| TC-36 | Vision Model Load on Startup | Verify TFLite vision model loads successfully at app launch | App installed with model assets bundled | 1. Launch app 2. Check logcat for model load confirmation | Model loads within 3s; no load error; inference ready before first frame | — | Pending | High |
| TC-37 | TTS Model Load on Startup | Verify offline TTS model loads successfully at app launch | App installed with TTS model bundled | 1. Launch app 2. Check logcat or debug mode for TTS init status | TTS model loads within 3s; no load error; synthesis ready before first detection | — | Pending | High |
| TC-38 | GPU/NPU Delegate Activation | Verify model inference uses GPU/NPU delegate when available | Device with GPU or NPU; app running | 1. Launch app 2. Start assistance 3. Check debug info for inference delegate | Inference reports GPU or NNAPI delegate active; not CPU-only on capable device | — | Pending | Medium |
| TC-39 | Corrupted Model File Handling | Verify graceful failure if model file is corrupted or missing | App installed; model asset deleted or corrupted manually | 1. Corrupt model file 2. Launch app 3. Observe response | App displays error: "Model failed to load. Please reinstall the app."; no crash | — | Pending | High |

---

*VisionEdge – Software Engineering Lab | © 2026 Team VisionEdge*
