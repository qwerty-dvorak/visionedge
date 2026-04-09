import { IconKey } from "../constants/theme";

export type AppTab = "home" | "summary" | "settings";
export type AppMode = "idle" | "initializing" | "active" | "paused" | "error";
export type VerbosityLevel = "minimal" | "standard" | "detailed";
export type AudioOutputMode = "speaker" | "earpiece" | "bluetooth";

export interface DetectedObject {
  id: string;
  label: string;
  icon: IconKey;
  confidence: number;
  positionLabel: string;
  distanceEstimateMeters?: number;
  priority: "high" | "medium" | "low";
  quantity?: number;
}

export interface DetectionResult {
  summary: string;
  lowLight: boolean;
  backend: "local-tflite" | "local-simulated" | "gemini-fallback";
  sceneHash: string;
  inferenceTimeMs: number;
  capturedAt: number;
  objects: DetectedObject[];
}

export interface AppSettings {
  speechRate: number;
  verbosity: VerbosityLevel;
  audioOutputMode: AudioOutputMode;
  vibrationEnabled: boolean;
  lowLightAlertsEnabled: boolean;
  geminiFallbackEnabled: boolean;
  confirmActions: boolean;
  debugMode: boolean;
}

export interface SessionMetrics {
  framesCaptured: number;
  lastCaptureAt: number | null;
  lastNarrationAt: number | null;
  avgLatencyMs: number;
  lastInferenceMs: number;
  totalNarrations: number;
  queueDepth: number;
  activeBackend: DetectionResult["backend"];
}

export interface ModelMetadata {
  id: string;
  modelType: "VISION" | "TTS";
  modelVersion: string;
  quantizationType: string;
  status?: "ready" | "missing" | "disabled" | "error";
  runtime?: "bundled" | "system" | "remote" | "simulated";
  details?: string;
  assetPath?: string | null;
  loadTimeMs?: number | null;
}

export interface NarrationEvent {
  shouldSpeak: boolean;
  text: string | null;
  reason: "scene-changed" | "scene-unchanged" | "interval-refresh" | "low-light";
}

export interface DemoSceneFixture {
  id: string;
  summary: string;
  lowLight: boolean;
  objects: DetectedObject[];
}

export interface GeminiSceneResponse {
  summary: string;
  lowLight: boolean;
  objects: Array<{
    label: string;
    confidence: number;
    positionLabel: string;
    distanceEstimateMeters?: number;
  }>;
}
