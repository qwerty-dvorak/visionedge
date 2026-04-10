# VisionEdge

VisionEdge is an Android-first accessibility prototype that combines a local YOLO26s TensorFlow Lite detector, VisionCamera frame processors, and offline Android TTS to narrate nearby objects with spatial hints.

## Current Stack

- Expo 55 / React Native 0.83
- `react-native-vision-camera` for realtime camera frames
- `vision-camera-resize-plugin` for native frame resize/crop conversion
- `react-native-fast-tflite` for on-device TFLite inference
- Bundled `YOLO26s` TFLite model at `320x320`
- Android system TTS via `expo-speech`

## Local Development

```bash
pnpm install
pnpm typecheck
pnpm test --runInBand
pnpm android
```

For a physical Android device, use ADB reverse after any ADB daemon restart:

```bash
adb devices -l
adb reverse tcp:8081 tcp:8081
pnpm android
```

If the dev build shows `Unable to load script`, verify both of these:

```bash
curl -L http://127.0.0.1:8081/status
adb -s <device-id> reverse --list
```

Expected results:

- Metro returns `packager-status:running`
- Reverse list contains `tcp:8081 tcp:8081`

## Performance Notes

- Realtime inference stays on the VisionCamera frame-processor path instead of shipping raw image data over the legacy React Native bridge.
- The frame processor emits a compact numeric detection vector to JS instead of full object payloads.
- Home-screen metrics are throttled and high-frequency runtime logs are no longer persisted every narration cycle.
- The active model defaults to `320x320` YOLO26s, with a lower-center crop bias that better matches road and sidewalk scenes.

## Verification

Automated checks:

- `pnpm typecheck`
- `pnpm test --runInBand`

Manual/device evidence is tracked in:

- [`docs/VisionEdge_TestReport.md`](./docs/VisionEdge_TestReport.md)
- [`VisionEdge_TestCases.md`](./VisionEdge_TestCases.md)

## Known Limits

- The dev-client workflow still depends on Metro. If the ADB daemon restarts, the reverse tunnel can disappear and must be re-applied.
- Full live-scene validation is still device/manual work; the current report distinguishes confirmed cases from blocked/not-run cases.
