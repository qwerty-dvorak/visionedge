# VisionEdge Implementation Plan
## Expo React Native Roadmap for UI-First Development

## 1. Purpose

This document converts the VisionEdge SDS into a practical implementation plan for building the mobile application with **React Native + Expo**, with a **UI-first approach**, **dummy data first**, and **incremental feature delivery** afterward.

The goal is to:
- build as much of the interface as possible early,
- validate accessibility and interaction design quickly,
- keep the architecture ready for offline on-device AI later,
- reduce rework when camera, perception, narration, and settings logic are added.

---

## 2. Project Context from the SDS

VisionEdge is an **offline assistive mobile application** that:
- captures live camera frames,
- performs on-device visual perception,
- converts detections into short text descriptions,
- speaks those descriptions through offline TTS,
- targets a perception-to-speech latency of **under 2 seconds**,
- avoids cloud dependency for privacy.

The SDS defines these major subsystems:
1. **Vision Perception Module (VPM)**
2. **Text Generation Engine (TGE)**
3. **TTS Pipeline Module (TPM)**
4. **Application Integration Layer (AIL)**

For the Expo app, the first implementation focus should be the **Application Integration Layer and accessibility-first UI**, while keeping clean seams for future native/ML integration.

---

## 3. Recommended Product Development Strategy

### Phase order
1. **Foundation setup**
2. **UI shell and navigation**
3. **Dummy data-driven screens**
4. **Interactive controls and local state**
5. **Simulated pipeline behavior**
6. **Real device capabilities**
7. **Native/offline AI integration**
8. **Performance and accessibility hardening**

### Why this order
This approach fits your goal well:
- you can demo progress early,
- the app structure becomes stable before complex ML work,
- you can test flows without waiting on model integration,
- accessibility and usability problems appear sooner,
- the eventual perception/TTS pipeline can replace mocked services instead of forcing a rewrite.

---

## 4. Recommended Architecture for the Expo App

Use a modular feature-oriented structure.

Suggested app layers:
- **presentation layer**: screens, components, theming, interaction states
- **application layer**: hooks, controllers, orchestration logic
- **domain layer**: app types, narration rules, scene models, state machines
- **data layer**: dummy repositories now, real device/native adapters later

Suggested responsibilities:

### 4.1 Presentation
Contains:
- Home screen
- Settings screen
- Onboarding / permissions screens
- Error and alert UI
- reusable cards, buttons, chips, meters, toggles, banners

### 4.2 Application
Contains:
- `useCameraSession`
- `useNarrationController`
- `useDetectionFeed`
- `usePermissions`
- `useAudioOutput`
- `useAppSettings`

These should coordinate behavior without embedding low-level logic directly in screens.

### 4.3 Domain
Contains:
- `DetectionResult`
- `SceneSummary`
- `NarrationEvent`
- `AudioOutputMode`
- `AppSettings`
- `PipelineStatus`
- scene deduplication rules
- confidence threshold rules
- narration throttling rules

### 4.4 Data
Start with:
- mock detections
- mock scene snapshots
- mock narration queue
- mock settings persistence

Later replace with:
- camera frame providers
- offline model inference bridge
- offline TTS provider
- local persistent storage

---

## 5. UI-First Scope

Build these screens first, using dummy data and simulated state transitions.

## 5.1 Core Screens

### A. Home / Main Screen
Primary experience screen.

Sections:
- live camera preview placeholder
- large current narration card
- detected objects list
- confidence badges
- status banner
- start / pause narration
- repeat last narration
- mute / unmute
- quick settings
- latency/status indicator

Dummy behaviors:
- fake scene updates every few seconds
- fake confidence changes
- fake "narrating..." state
- fake low-light / low-confidence warnings

### B. Settings Screen
Based on the SDS and likely product needs.

Sections:
- speech rate
- voice selection
- narration verbosity
- confidence threshold
- vibration toggle
- low-light alert toggle
- audio output preference
- offline mode info
- privacy statement
- model info placeholder
- reset settings

### C. Permissions / Onboarding Screen
Even if simple initially, add it early.

Sections:
- welcome message
- accessibility-focused explanation
- camera permission request
- microphone note if ever needed later
- audio behavior explanation
- privacy/offline explanation

### D. Error / Alert States Screen or Components
The SDS explicitly mentions alert states.

Examples:
- camera unavailable
- permissions denied
- low confidence scene
- model unavailable
- processing paused
- battery saver warning
- unsupported device warning

### E. Session Summary / Debug Screen
Not user-facing long term, but extremely useful during development.

Show:
- mock fps
- mock inference duration
- narration queue length
- scene hash / dedupe status
- last spoken phrase
- active settings
- device capability placeholders

This will help a lot once real functionality is introduced.

---

## 6. High-Priority UI Components

Build reusable components before deep feature work.

Recommended components:
- `PrimaryButton`
- `IconButton`
- `StatusBanner`
- `NarrationCard`
- `DetectionList`
- `DetectionItem`
- `ConfidenceBadge`
- `LatencyPill`
- `PermissionCard`
- `SettingRow`
- `ToggleRow`
- `SliderRow`
- `BottomActionBar`
- `EmptyState`
- `ErrorStateCard`

Accessibility requirements for all components:
- large touch targets
- strong contrast
- scalable text
- clear focus order
- readable labels for screen readers
- state announced properly for toggles, mute, pause, and narration events

---

## 7. Dummy Data Plan

Before adding real functionality, define stable mock data contracts.

## 7.1 Suggested Dummy Types

- `DetectedObject`
  - `id`
  - `label`
  - `confidence`
  - `position`
  - `priority`

- `SceneSnapshot`
  - `id`
  - `timestamp`
  - `objects`
  - `summary`
  - `lowLight`
  - `motionLevel`

- `NarrationItem`
  - `id`
  - `text`
  - `status`
  - `createdAt`

- `AppSettings`
  - `speechRate`
  - `voice`
  - `verbosity`
  - `confidenceThreshold`
  - `vibrationEnabled`
  - `lowLightAlertsEnabled`
  - `audioOutputMode`

## 7.2 Dummy Scenarios to Include

Create multiple realistic demo states:
- indoor hallway
- street crossing
- cluttered desk
- grocery shelf
- person approaching
- empty room
- low-light room
- high-confidence single-object scene
- noisy multi-object scene
- repeated static scene

These scenarios will help you validate wording, accessibility, and UI density.

## 7.3 Mock Behavior Rules
Simulate:
- detections arriving every 2 to 4 seconds
- confidence fluctuations
- duplicate scene suppression
- narration queueing
- paused state
- muted state
- error injection

This gives you a near-real product feel before real inference exists.

---

## 8. Step-by-Step Functional Rollout

## Milestone 1: Foundation
Goal: establish production-quality project baseline.

Tasks:
- set up folder structure
- add navigation
- add theme system
- add typography and spacing tokens
- define TypeScript domain models
- define mock repositories and services
- configure linting, formatting, path aliases, and environment handling

Deliverable:
- app boots into a polished shell with navigation and consistent design language

## Milestone 2: UI Shell
Goal: complete all major screens visually.

Tasks:
- build Home screen layout
- build Settings screen
- build permissions/onboarding flow
- build reusable state cards
- build loading, empty, and error states
- ensure responsiveness across common phone sizes

Deliverable:
- clickable, polished interface with no real device integration yet

## Milestone 3: Dummy Data Integration
Goal: make the UI feel alive.

Tasks:
- wire screens to local mock data
- rotate scene snapshots
- simulate narration state machine
- render confidence indicators and alerts
- support repeat, pause, mute, and threshold changes locally

Deliverable:
- realistic prototype demonstrating the full intended product flow

## Milestone 4: Local App State and Persistence
Goal: preserve behavior and settings.

Tasks:
- add centralized app state
- persist settings locally
- store recent narration history
- preserve onboarding completion state
- restore previous settings on launch

Deliverable:
- app behaves like a real installable product

## Milestone 5: Real Device Capabilities
Goal: replace placeholders with real device APIs where Expo support is strong.

Tasks:
- request camera permissions
- show real camera preview
- add haptics for alerts
- add audio playback controls
- improve app lifecycle handling
- handle background/foreground transitions safely

Deliverable:
- live camera shell and real device interaction, still using mocked perception results

## Milestone 6: Rule-Based Text Generation
Goal: implement the simplest real intelligence first.

Tasks:
- define text templates from structured detection data
- rank foreground/high-priority objects
- suppress repetitive narration
- add cooldown logic
- add low-confidence phrasing
- add verbosity modes

Deliverable:
- deterministic narration generation working on mock detections

## Milestone 7: Offline TTS Integration
Goal: introduce spoken feedback.

Tasks:
- begin with the best offline-friendly speech option available in your stack
- support speech queue management
- support interrupt / repeat behavior
- tune rate, volume, and pause timing
- expose voice and speed controls in settings

Deliverable:
- actual spoken descriptions driven by mock scene data

## Milestone 8: Vision Integration
Goal: introduce real perception incrementally.

Tasks:
- integrate camera frame capture strategy
- define native bridge boundary for inference
- load small experimental model first
- map raw model outputs into `DetectedObject`
- test on target Android hardware early
- benchmark latency and memory use

Deliverable:
- first real perception loop, even if accuracy is limited

## Milestone 9: Pipeline Optimization
Goal: move toward the SDS latency target.

Tasks:
- throttle frame processing
- skip near-duplicate scenes
- reduce render frequency
- memoize expensive UI work
- manage narration queue aggressively
- tune model size and confidence thresholds
- profile startup, inference, and speech timings

Deliverable:
- measurable movement toward sub-2-second perception-to-speech flow

## Milestone 10: Accessibility and Reliability Hardening
Goal: make the product robust and usable.

Tasks:
- screen reader testing
- large text testing
- dark and bright environment testing
- permission denial flows
- camera failure handling
- battery impact review
- crash-safe fallbacks
- offline guarantee review

Deliverable:
- demo-ready and user-test-ready build

---

## 9. Recommended State Model

Use a simple explicit state model for the core pipeline.

Suggested top-level states:
- `idle`
- `requesting_permissions`
- `ready`
- `scanning`
- `processing`
- `narrating`
- `paused`
- `error`

Suggested benefits:
- easier UI rendering,
- easier debugging,
- fewer impossible combinations,
- smoother transition from mocks to real services.

---

## 10. Recommended Navigation

Suggested navigation structure:
- stack navigator for onboarding / permissions
- tab or stack navigation for main product areas
- modal for quick settings / error details / debug panel

Minimal structure:
- `Onboarding`
- `Permissions`
- `Home`
- `Settings`
- `Debug`

Keep this simple at first. The main complexity should be inside the Home flow, not in navigation.

---

## 11. Expo + React Native Recommendations

Your current stack is minimal. For a strong modern baseline, the following additions are worth considering.

## 11.1 Recommended Libraries

### Core app structure
- `expo-router` or `@react-navigation/native`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-gesture-handler`

### Styling / design system
Choose one primary style direction:
- `NativeWind` if you want fast utility-first styling
- or `Tamagui` if you want a more advanced cross-platform design system
- or plain React Native `StyleSheet` with a custom token system for maximum control

For this project, I would lean toward:
- **custom design tokens + StyleSheet** for stability and accessibility
- optionally add **NativeWind** only if you are already comfortable with it

### State and data
- `zustand` for lightweight global state
- `@react-native-async-storage/async-storage` for settings persistence
- `react-hook-form` if forms become more complex
- `zod` for runtime-safe config/data validation

### Device capabilities
- `expo-camera`
- `expo-speech` as an early-step placeholder for TTS experiments
- `expo-av` or the current Expo audio package for playback control
- `expo-haptics`
- `expo-keep-awake`

### Quality and developer experience
- `eslint`
- `prettier`
- `typescript-eslint`
- path aliases
- commit hooks if you want consistent quality

---

## 12. Suggested Improvements to the SDS for an Expo Build

The SDS is strong at a conceptual and systems level, but for implementation planning in Expo/React Native it would benefit from more app-specific detail.

## 12.1 Add explicit mobile app architecture
The SDS should explicitly define:
- navigation structure
- state management approach
- local persistence strategy
- error boundary strategy
- permission handling flow
- accessibility testing criteria

## 12.2 Clarify Android-first vs cross-platform scope
The SDS mentions modern Android smartphones and Android-specific audio/camera details. It should clearly state one of:
- Android-first with optional iOS later, or
- cross-platform from day one

For your current SDS, **Android-first** appears more realistic.

## 12.3 Add fallback plan for Expo limitations
The SDS assumes native ML inference bindings are available. For Expo, it should state:
- whether the project remains in managed workflow,
- whether prebuild/custom native modules are allowed,
- when ejection or custom development builds are acceptable.

## 12.4 Add UI accessibility acceptance criteria
The SDS talks about accessibility-focused UI, but it should define measurable criteria such as:
- minimum touch target size,
- screen reader compatibility,
- max interaction steps for core actions,
- contrast requirements,
- narration interruption behavior,
- error announcement behavior.

## 12.5 Add instrumentation requirements
To hit the latency target, the SDS should require instrumentation for:
- camera frame capture time
- inference time
- text generation time
- TTS queue time
- playback start time
- total end-to-end latency

Without measurement, the latency target stays theoretical.

## 12.6 Add model delivery/update strategy
The SDS should clarify:
- how models are packaged,
- expected model download size if updates are ever allowed,
- whether models ship bundled,
- how versioning works,
- what happens when a model fails to load.

---

## 13. Drawbacks and Risks of React Native with Expo for VisionEdge

Expo is excellent for rapid UI development, but this project has some important constraints.

## 13.1 Main advantages
Expo is very good for:
- fast UI prototyping
- polished cross-platform interfaces
- quicker onboarding
- easy device testing
- simpler camera/audio/haptics integration in early stages
- strong developer experience

That makes it a very good fit for your **UI-first** plan.

## 13.2 Main drawbacks
For the full VisionEdge vision, Expo has challenges:

### A. Native ML inference is the hardest part
The SDS expects on-device model inference through frameworks like TFLite or ONNX Runtime Mobile. That typically requires:
- native modules,
- custom builds,
- lower-level performance tuning.

This is where plain managed Expo becomes limiting.

### B. Latency-sensitive pipelines are harder in JS
Your core requirement is sub-2-second perception-to-speech. Heavy image processing, inference orchestration, and low-level optimization are usually better handled in native code than across the JS bridge.

### C. Camera frame access for real-time inference is non-trivial
Displaying a camera preview is easy. Efficiently pulling frames for inference, throttling them, and processing them on-device with low latency is much more complex.

### D. Offline TTS quality may exceed what Expo-first tools provide
Basic speech is easy. High-quality neural offline TTS on device is much harder and may require native integration beyond standard Expo modules.

### E. Android hardware acceleration paths are specialized
If you want GPU/NPU acceleration, quantized models, and device-specific optimization, you will likely need deeper Android-native control.

## 13.3 Practical conclusion
Use **Expo now** for:
- UI,
- accessibility,
- navigation,
- settings,
- mock pipeline behavior,
- permissions,
- camera preview shell,
- early speech placeholder behavior.

But plan for one of these later:
1. **Expo with custom development builds and native modules**
2. **React Native bare workflow**
3. **Hybrid architecture where native Android handles inference/TTS and React Native handles UI**

For this product, option 1 or 3 is likely the most realistic.

---

## 14. Recommended Technical Direction

### Best near-term direction
- stay on Expo for rapid UI and interaction development
- design clean interfaces around camera, inference, narration, and audio
- use mocks heavily
- validate user experience early

### Best long-term direction
- keep React Native/Expo for the app shell
- move latency-critical ML and possibly TTS into native Android modules or a dedicated native layer
- expose a narrow interface back to the React Native app

This gives you both:
- fast product iteration,
- and a realistic path toward the SDS performance goals.

---

## 15. Immediate Next Steps

## Sprint 1
- finalize information architecture
- create design tokens
- implement navigation
- create Home, Settings, Onboarding, and Error states
- build reusable components

## Sprint 2
- add realistic mock data
- add simulated narration and detection updates
- add local settings persistence
- add debug screen
- refine accessibility labels and interactions

## Sprint 3
- add real camera preview
- add early speech placeholder
- implement rule-based text generation from mock detections
- test on physical Android devices

## Sprint 4
- investigate native inference path
- validate Expo custom build strategy
- benchmark camera + speech + rendering behavior
- define first real model integration spike

---

## 16. Suggested Definition of Done Per Feature

A feature should be considered complete only when it has:
- visual implementation,
- accessibility labels,
- loading/error/empty states,
- dummy data support,
- real-state wiring if applicable,
- tested behavior on a physical Android device,
- no blocking TypeScript issues.

---

## 17. Final Recommendation

You should absolutely start with **React Native + Expo** for VisionEdge because it is a strong choice for:
- building the UI quickly,
- validating flows,
- testing accessibility,
- simulating the end-to-end experience.

However, you should treat Expo as the **application shell and UX layer**, not necessarily the final home of the latency-critical perception stack.

The most practical plan is:

1. **Build the entire accessible UI first**
2. **Drive it with robust dummy data**
3. **Add local behaviors and persistence**
4. **Integrate camera/audio features incrementally**
5. **Move the heavy offline AI/TTS pieces into native integrations when needed**

That approach matches both your stated goal and the SDS constraints better than trying to solve native ML from day one.