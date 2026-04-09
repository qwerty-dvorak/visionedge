import { AppSettings, DetectionResult, NarrationEvent } from "../types/app";

const FIVE_SECONDS = 5000;

function topLabels(result: DetectionResult | null) {
  return (result?.objects || [])
    .slice(0, 3)
    .map((item) => item.label.toLowerCase())
    .join("|");
}

function detailText(result: DetectionResult, settings: AppSettings) {
  if (!result.objects.length) {
    return "No objects detected.";
  }

  const topItems = result.objects.slice(0, settings.verbosity === "minimal" ? 1 : 3);
  const fragments = topItems.map((item) => {
    const prefix = item.quantity ? `${item.quantity} ${item.label.toLowerCase()}s` : item.label;
    if (settings.verbosity === "minimal") {
      return `${prefix} ahead`;
    }
    if (settings.verbosity === "detailed") {
      return `${prefix} ${item.positionLabel}, about ${
        item.distanceEstimateMeters ? item.distanceEstimateMeters.toFixed(1) : "1.0"
      } meters away`;
    }
    return `${prefix} ${item.positionLabel}`;
  });

  return fragments.join(". ");
}

export function buildNarrationEvent(
  previous: DetectionResult | null,
  next: DetectionResult,
  settings: AppSettings,
  lastNarrationAt: number | null,
): NarrationEvent {
  const now = Date.now();
  const previousLabels = topLabels(previous);
  const nextLabels = topLabels(next);
  const hasChanged = previousLabels !== nextLabels || previous?.lowLight !== next.lowLight;
  const timedOut = !lastNarrationAt || now - lastNarrationAt > FIVE_SECONDS;

  if (!hasChanged && !timedOut) {
    return {
      shouldSpeak: false,
      text: null,
      reason: "scene-unchanged",
    };
  }

  if (next.lowLight && settings.lowLightAlertsEnabled) {
    return {
      shouldSpeak: true,
      text: `Low light detected. ${detailText(next, settings)}`,
      reason: "low-light",
    };
  }

  return {
    shouldSpeak: true,
    text: detailText(next, settings),
    reason: hasChanged ? "scene-changed" : "interval-refresh",
  };
}

export function describeSettingsChange(
  key: keyof Pick<
    AppSettings,
    | "speechRate"
    | "verbosity"
    | "vibrationEnabled"
    | "lowLightAlertsEnabled"
    | "geminiFallbackEnabled"
    | "audioOutputMode"
  >,
  value: AppSettings[keyof AppSettings] | boolean | number | string,
) {
  switch (key) {
    case "speechRate":
      return `Speech rate set to ${Number(value).toFixed(2)} times.`;
    case "verbosity":
      return `Verbosity set to ${value}.`;
    case "vibrationEnabled":
      return value ? "Vibration fallback enabled." : "Vibration fallback disabled.";
    case "lowLightAlertsEnabled":
      return value ? "Low light alerts enabled." : "Low light alerts disabled.";
    case "geminiFallbackEnabled":
      return value ? "Gemini fallback enabled." : "Gemini fallback disabled.";
    case "audioOutputMode":
      return `Audio output set to ${value}.`;
    default:
      return "Settings updated.";
  }
}

export function formatLatencyLabel(latencyMs: number) {
  if (!latencyMs) {
    return "Latency --";
  }
  return `${latencyMs} ms`;
}
