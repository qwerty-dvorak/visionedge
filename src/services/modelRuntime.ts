import * as Speech from "expo-speech";

import { AudioOutputMode, ModelMetadata } from "../types/app";

type ModelLogger = (level: "info" | "warning" | "error", message: string) => void;

function logModelEvent(
  logger: ModelLogger | undefined,
  level: "info" | "warning" | "error",
  message: string,
) {
  const formatted = `[VisionEdge][model] ${message}`;
  if (level === "error") {
    console.error(formatted);
  } else if (level === "warning") {
    console.warn(formatted);
  } else {
    console.info(formatted);
  }

  logger?.(level, message);
}

export function selectPreferredVoice(
  voices: Speech.Voice[],
  audioOutputMode: AudioOutputMode,
): Speech.Voice | null {
  if (!voices.length) {
    return null;
  }

  const normalized = voices.slice().sort((left, right) => left.language.localeCompare(right.language));

  const englishVoices = normalized.filter((voice) => voice.language.toLowerCase().startsWith("en"));
  const preferredPool = englishVoices.length ? englishVoices : normalized;
  const rankVoice = (voice: Speech.Voice) => {
    const descriptor = `${voice.identifier} ${voice.name}`.toLowerCase();
    let score = 0;

    if (descriptor.includes("network")) {
      score += 8;
    }
    if (descriptor.includes("compact") || descriptor.includes("default") || descriptor.includes("embedded")) {
      score -= 4;
    }
    if (descriptor.includes("natural") || descriptor.includes("premium")) {
      score += audioOutputMode === "bluetooth" ? 1 : 3;
    }
    if (voice.quality === Speech.VoiceQuality.Enhanced) {
      score += audioOutputMode === "bluetooth" ? 1 : 4;
    }
    if (audioOutputMode === "bluetooth" && descriptor.includes("bluetooth")) {
      score -= 1;
    }

    return score;
  };

  return preferredPool.slice().sort((left, right) => rankVoice(left) - rankVoice(right))[0];
}

export async function loadRuntimeModelMetadata(options?: {
  geminiConfigured?: boolean;
  logger?: ModelLogger;
}): Promise<ModelMetadata[]> {
  const geminiConfigured = Boolean(options?.geminiConfigured);
  const models: ModelMetadata[] = [];

  try {
    const startedAt = Date.now();
    const voices = await Speech.getAvailableVoicesAsync();
    const loadTimeMs = Date.now() - startedAt;
    const preferredVoice = selectPreferredVoice(voices, "speaker");

    logModelEvent(
      options?.logger,
      voices.length ? "info" : "warning",
      voices.length
        ? `Loaded ${voices.length} local TTS voice(s). Preferred voice: ${preferredVoice?.name || "unknown"}.`
        : "No local TTS voices were reported by the system speech engine.",
    );

    models.push({
      id: "tts-android-system",
      modelType: "TTS",
      modelVersion: preferredVoice?.name || "android-system-tts",
      quantizationType: "SYSTEM",
      status: voices.length ? "ready" : "error",
      runtime: "system",
      details: voices.length
        ? `${voices.length} system voice(s) available on device.`
        : "Speech engine did not report any usable local voices.",
      assetPath: null,
      loadTimeMs,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to query the system TTS voice list.";
    logModelEvent(options?.logger, "error", message);
    models.push({
      id: "tts-android-system",
      modelType: "TTS",
      modelVersion: "android-system-tts",
      quantizationType: "SYSTEM",
      status: "error",
      runtime: "system",
      details: message,
      assetPath: null,
      loadTimeMs: null,
    });
  }

  models.push({
    id: "gemini-fallback",
    modelType: "VISION",
    modelVersion: "gemini-2.0-flash",
    quantizationType: "REMOTE_OPTIONAL",
    status: geminiConfigured ? "ready" : "disabled",
    runtime: "remote",
    details: geminiConfigured
      ? "Remote fallback is configured and can run when explicitly enabled."
      : "No Gemini API key configured. Remote fallback is disabled.",
    assetPath: null,
    loadTimeMs: null,
  });

  return models;
}
