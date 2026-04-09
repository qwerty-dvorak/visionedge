import * as Haptics from "expo-haptics";
import React, {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppState,
  AppStateStatus,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TensorflowModel } from "react-native-fast-tflite";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCameraPermission } from "react-native-vision-camera";

import { AppIcon } from "../components/AppIcon";
import { RealtimeVisionCamera } from "../components/RealtimeVisionCamera";
import {
  Banner,
  MetricCard,
  Pill,
  PrimaryButton,
  ScreenCard,
  SettingToggleRow,
} from "../components/ui";
import { colors, radius, shadows, spacing, typography } from "../constants/theme";
import {
  buildDetectionResultFromRealtimePayload,
  RealtimeFramePayload,
} from "./realtimeDetection";
import { buildNarrationEvent, describeSettingsChange, formatLatencyLabel } from "../lib/narration";
import { loadRuntimeModelMetadata } from "../services/modelRuntime";
import { DetectionInputConfig, PerceptionService } from "../services/perceptionService";
import { SessionLogEntry, settingsRepository } from "../services/settingsRepository";
import { createSpeechService } from "../services/speechService";
import {
  AppMode,
  AppSettings,
  AppTab,
  DetectionResult,
  DetectedObject,
  ModelMetadata,
  SessionMetrics,
} from "../types/app";

const speechService = createSpeechService();
const perceptionService = new PerceptionService();
const HOT_INFO_LOG_PATTERNS = [
  /^Frame processor sampled /,
  /^VisionCamera inference completed /,
];
const REALTIME_UI_SYNC_MS = 500;

function shouldPersistAppLog(level: SessionLogEntry["level"], message: string) {
  if (level !== "info") {
    return true;
  }

  return !HOT_INFO_LOG_PATTERNS.some((pattern) => pattern.test(message));
}

const defaultMetrics: SessionMetrics = {
  framesCaptured: 0,
  lastCaptureAt: null,
  lastNarrationAt: null,
  avgLatencyMs: 0,
  lastInferenceMs: 0,
  totalNarrations: 0,
  queueDepth: 0,
  activeBackend: "local-tflite",
};

const features = [
  {
    id: "objects",
    icon: "camera" as const,
    title: "Object awareness",
    description: "Start the rear camera and narrate top objects with spatial hints.",
  },
  {
    id: "offline",
    icon: "shield" as const,
    title: "Offline-first",
    description: "Local narration is the default path. Gemini is optional and disabled by default.",
  },
  {
    id: "controls",
    icon: "accessibility" as const,
    title: "Accessible controls",
    description: "Large touch targets, spoken confirmations, haptics, and a recoverable error state.",
  },
];

type HomeScreenProps = {
  mode: AppMode;
  permissionGranted: boolean;
  isMuted: boolean;
  latestResult: DetectionResult | null;
  metrics: SessionMetrics;
  errorMessage: string | null;
  onStartStop: () => void;
  onPauseResume: () => void;
  onRepeat: () => void;
  onMuteToggle: () => void;
  onOpenSettings: () => void;
  onRetry: () => void;
};

function HomeScreen({
  mode,
  permissionGranted,
  isMuted,
  latestResult,
  metrics,
  errorMessage,
  onStartStop,
  onPauseResume,
  onRepeat,
  onMuteToggle,
  onOpenSettings,
  onRetry,
}: HomeScreenProps) {
  const statusTitle =
    mode === "active"
      ? "Assistance ON"
      : mode === "paused"
        ? "Assistance paused"
        : mode === "initializing"
          ? "Initializing"
          : mode === "error"
            ? "Attention needed"
            : "Assistance OFF";

  const bannerTone =
    mode === "error"
      ? "danger"
      : latestResult?.lowLight
        ? "warning"
        : mode === "active"
          ? "success"
          : "neutral";

  const bannerMessage =
    errorMessage ??
    (latestResult?.summary ||
      (permissionGranted
        ? "Press Start to begin the camera and narration pipeline."
        : "Grant camera access first to activate visual assistance."));

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brandEyebrow}>VisionEdge</Text>
          <Text style={styles.pageTitle}>Android Demo</Text>
        </View>

        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={styles.iconButton}
        >
          <AppIcon name="settings" size={22} color={colors.text} />
        </Pressable>
      </View>

      <Banner
        tone={bannerTone}
        icon={mode === "error" ? "error" : latestResult?.lowLight ? "warning" : "live"}
        title={statusTitle}
        message={bannerMessage}
      />

      <ScreenCard style={styles.heroCard}>
        <Text style={styles.heroStatus}>{statusTitle}</Text>
        <Text style={styles.heroSummary}>
          {latestResult?.summary || "No scene has been analyzed yet."}
        </Text>

        <View style={styles.metricRow}>
          <Pill icon="latency" label={formatLatencyLabel(metrics.avgLatencyMs)} />
          <Pill icon="fps" label={`${metrics.framesCaptured} frames`} />
          <Pill icon="queue" label={`Queue ${metrics.queueDepth}`} />
        </View>

        <PrimaryButton
          icon={mode === "active" || mode === "paused" ? "stop" : "play"}
          label={mode === "active" || mode === "paused" ? "Stop Assistance" : "Start Assistance"}
          onPress={onStartStop}
          tone={mode === "active" || mode === "paused" ? "danger" : "primary"}
          accessibilityHint="Double tap to toggle live visual assistance"
        />

        <View style={styles.actionRow}>
          <PrimaryButton
            icon={mode === "paused" ? "play" : "pause"}
            label={mode === "paused" ? "Resume" : "Pause"}
            onPress={onPauseResume}
            tone="secondary"
            disabled={mode !== "active" && mode !== "paused"}
          />
          <PrimaryButton
            icon="repeat"
            label="Repeat"
            onPress={onRepeat}
            tone="secondary"
            disabled={!latestResult}
          />
          <PrimaryButton
            icon={isMuted ? "speaker" : "mute"}
            label={isMuted ? "Unmute" : "Mute"}
            onPress={onMuteToggle}
            tone="secondary"
          />
        </View>
      </ScreenCard>

      {mode === "error" ? (
        <ScreenCard>
          <Text style={styles.sectionTitle}>Recovery</Text>
          <Text style={styles.bodyText}>
            Retry will re-check permissions, restart the capture loop, and announce the outcome.
          </Text>
          <PrimaryButton icon="retry" label="Retry" onPress={onRetry} />
        </ScreenCard>
      ) : null}

      <ScreenCard>
        <Text style={styles.sectionTitle}>Detected Objects</Text>
        <View style={styles.listBlock}>
          {(latestResult?.objects || []).map((item) => (
            <DetectedObjectRow key={item.id} item={item} />
          ))}
          {!latestResult?.objects.length ? (
            <Text style={styles.mutedText}>No objects detected yet.</Text>
          ) : null}
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

function DetectedObjectRow({ item }: { item: DetectedObject }) {
  return (
    <View style={styles.objectRow}>
      <View style={styles.objectLeft}>
        <View style={styles.objectIcon}>
          <AppIcon name={item.icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.objectTitle}>
            {item.label}
            {item.quantity ? ` x${item.quantity}` : ""}
          </Text>
          <Text style={styles.objectSubtitle}>
            {item.positionLabel} · {Math.round(item.confidence * 100)}% confidence
          </Text>
        </View>
      </View>
      {item.distanceEstimateMeters ? (
        <Text style={styles.objectDistance}>{item.distanceEstimateMeters.toFixed(1)}m</Text>
      ) : null}
    </View>
  );
}

type OnboardingProps = {
  onGrant: () => void;
  permissionGranted: boolean;
};

function OnboardingScreen({ onGrant, permissionGranted }: OnboardingProps) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.onboardingHeader}>
        <View style={styles.iconBadge}>
          <AppIcon name="vision" size={42} color={colors.primary} />
        </View>
        <Text style={styles.pageTitle}>Repository Demo Build</Text>
        <Text style={styles.onboardingCopy}>
          This build wires the VisionEdge prototype to real camera permissions, a speech queue,
          persisted settings, runtime metrics, and an offline-first scene narration loop.
        </Text>
      </View>

      <ScreenCard>
        <Text style={styles.sectionTitle}>What works now</Text>
        <View style={styles.listBlock}>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <AppIcon name={feature.icon} size={20} color={colors.primary} />
              <View style={styles.flex}>
                <Text style={styles.objectTitle}>{feature.title}</Text>
                <Text style={styles.objectSubtitle}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScreenCard>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Privacy and Demo Constraints</Text>
        <Text style={styles.bodyText}>
          Raw frames are used transiently in memory. Local analysis is the default path. Optional
          Gemini fallback is only used when enabled in settings and a key is configured.
        </Text>
        <PrimaryButton
          icon="camera"
          label={permissionGranted ? "Continue to Home" : "Grant Camera Access"}
          onPress={onGrant}
        />
      </ScreenCard>
    </ScrollView>
  );
}

type SettingsProps = {
  settings: AppSettings;
  geminiConfigured: boolean;
  onBack: () => void;
  onPatch: (patch: Partial<AppSettings>, announcement: string) => void;
};

function SettingsScreen({ settings, geminiConfigured, onBack, onPatch }: SettingsProps) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.iconButton}
        >
          <AppIcon name="back" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.flex}>
          <Text style={styles.brandEyebrow}>VisionEdge</Text>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>
      </View>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Narration</Text>
        <View style={styles.settingRowWrap}>
          <Text style={styles.settingLabel}>Speech rate</Text>
          <View style={styles.settingActions}>
            {[0.75, 1, 1.25, 1.5].map((value) => (
              <Pressable
                key={value}
                onPress={() =>
                  onPatch({ speechRate: value }, describeSettingsChange("speechRate", value))
                }
                style={[
                  styles.choiceChip,
                  settings.speechRate === value && styles.choiceChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    settings.speechRate === value && styles.choiceChipTextActive,
                  ]}
                >
                  {value.toFixed(2)}x
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.settingRowWrap}>
          <Text style={styles.settingLabel}>Verbosity</Text>
          <View style={styles.settingActions}>
            {(["minimal", "standard", "detailed"] as const).map((value) => (
              <Pressable
                key={value}
                onPress={() =>
                  onPatch({ verbosity: value }, describeSettingsChange("verbosity", value))
                }
                style={[
                  styles.choiceChip,
                  settings.verbosity === value && styles.choiceChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    settings.verbosity === value && styles.choiceChipTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScreenCard>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Pipeline</Text>
        <SettingToggleRow
          label="Vibration fallback"
          description="Trigger haptics when speech fails or when a warning is raised."
          value={settings.vibrationEnabled}
          onValueChange={(value) =>
            onPatch({ vibrationEnabled: value }, describeSettingsChange("vibrationEnabled", value))
          }
        />
        <SettingToggleRow
          label="Low-light alerts"
          description="Speak a warning when the local analyzer marks a scene as low light."
          value={settings.lowLightAlertsEnabled}
          onValueChange={(value) =>
            onPatch(
              { lowLightAlertsEnabled: value },
              describeSettingsChange("lowLightAlertsEnabled", value),
            )
          }
        />
        <SettingToggleRow
          label="Gemini fallback"
          description={
            geminiConfigured
              ? "Use Gemini only after local analysis fails or returns an empty scene."
              : "No Gemini API key configured. Local analysis remains active."
          }
          value={settings.geminiFallbackEnabled && geminiConfigured}
          disabled={!geminiConfigured}
          onValueChange={(value) =>
            onPatch(
              { geminiFallbackEnabled: value },
              describeSettingsChange("geminiFallbackEnabled", value),
            )
          }
        />
      </ScreenCard>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Audio Output</Text>
        <View style={styles.settingActions}>
          {(["speaker", "earpiece", "bluetooth"] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() =>
                onPatch({ audioOutputMode: value }, describeSettingsChange("audioOutputMode", value))
              }
              style={[
                styles.choiceChip,
                settings.audioOutputMode === value && styles.choiceChipActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceChipText,
                  settings.audioOutputMode === value && styles.choiceChipTextActive,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

type SummaryProps = {
  mode: AppMode;
  latestResult: DetectionResult | null;
  metrics: SessionMetrics;
  logs: SessionLogEntry[];
  models: ModelMetadata[];
  onBack: () => void;
};

function SummaryScreen({ mode, latestResult, metrics, logs, models, onBack }: SummaryProps) {
  const cards = [
    { label: "Frames", value: String(metrics.framesCaptured), icon: "fps" as const },
    { label: "Latency", value: formatLatencyLabel(metrics.avgLatencyMs), icon: "latency" as const },
    { label: "Queue", value: String(metrics.queueDepth), icon: "queue" as const },
    { label: "Backend", value: metrics.activeBackend, icon: "hardware" as const },
  ];

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={onBack}
          style={styles.iconButton}
        >
          <AppIcon name="back" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.brandEyebrow}>VisionEdge</Text>
          <Text style={styles.pageTitle}>Debug Summary</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {cards.map((card) => (
          <MetricCard key={card.label} icon={card.icon} label={card.label} value={card.value} />
        ))}
      </View>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Session State</Text>
        <Text style={styles.bodyText}>Mode: {mode}</Text>
        <Text style={styles.bodyText}>Last summary: {latestResult?.summary || "None"}</Text>
        <Text style={styles.bodyText}>
          Last backend: {latestResult?.backend || "local-tflite"}
        </Text>
      </ScreenCard>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Model Metadata</Text>
        <View style={styles.listBlock}>
          {models.map((model) => (
            <Text key={model.id} style={styles.objectSubtitle}>
              {model.modelType}: {model.modelVersion} · {model.quantizationType}
              {model.status ? ` · ${model.status}` : ""}
              {model.details ? ` · ${model.details}` : ""}
            </Text>
          ))}
        </View>
      </ScreenCard>

      <ScreenCard>
        <Text style={styles.sectionTitle}>Event Log</Text>
        <View style={styles.listBlock}>
          {logs.slice(0, 8).map((entry) => (
            <Text key={entry.id} style={styles.objectSubtitle}>
              {new Date(entry.createdAt).toLocaleTimeString()} · {entry.level.toUpperCase()} ·{" "}
              {entry.message}
            </Text>
          ))}
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

export default function VisionEdgeApp() {
  const latestResultRef = useRef<DetectionResult | null>(null);
  const metricsRef = useRef<SessionMetrics>(defaultMetrics);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const cameraReadyRef = useRef(false);
  const modeRef = useRef<AppMode>("idle");
  const activeTabRef = useRef<AppTab>("home");
  const settingsRef = useRef<AppSettings | null>(null);
  const processedFrameCountRef = useRef(0);
  const lastNarrationAtRef = useRef<number | null>(null);
  const isMutedRef = useRef(false);
  const uiSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUiSyncAtRef = useRef(0);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [appReady, setAppReady] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [mode, setMode] = useState<AppMode>("idle");
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [latestResult, setLatestResult] = useState<DetectionResult | null>(null);
  const [metrics, setMetrics] = useState<SessionMetrics>(defaultMetrics);
  const [logs, setLogs] = useState<SessionLogEntry[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [frameProcessorModel, setFrameProcessorModel] = useState<TensorflowModel | null>(null);
  const [frameProcessorInputConfig, setFrameProcessorInputConfig] =
    useState<DetectionInputConfig | null>(null);
  const deferredLatestResult = useDeferredValue(latestResult);
  const deferredMetrics = useDeferredValue(metrics);

  const geminiConfigured = useMemo(
    () => Boolean(process.env.EXPO_PUBLIC_GEMINI_API_KEY),
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      await settingsRepository.init();
      appendLog("info", "Bootstrapping VisionEdge runtime.");
      await settingsRepository.seedDefaultMetadata();
      perceptionService.setLogger(appendLog);
      const [storedSettings, storedLogs] = await Promise.all([
        settingsRepository.getSettings(),
        settingsRepository.getRecentLogs(),
      ]);
      await speechService.initialize();
      const [visionModel, runtimeModels] = await Promise.all([
        perceptionService.initialize(),
        loadRuntimeModelMetadata({
          geminiConfigured,
          logger: appendLog,
        }),
      ]);
      const nextModels = [visionModel, ...runtimeModels];

      if (!mounted) {
        return;
      }

      setSettings(storedSettings);
      setLogs(storedLogs);
      setModels(nextModels);
      setFrameProcessorModel(perceptionService.getTensorflowModel());
      setFrameProcessorInputConfig(perceptionService.getInputConfig());
      setAppReady(true);
      setSpeechReady(true);
      appendLog("info", "VisionEdge runtime is ready.");
    }

    bootstrap().catch((error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : "Failed to initialize the app.");
      updateMode("error");
    });

    return () => {
      mounted = false;
      speechService.stop();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      appStateRef.current = nextState;
      setAppState(nextState);
      if (nextState !== "active") {
        updateCameraReady(false);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(
    () => () => {
      if (uiSyncTimeoutRef.current) {
        clearTimeout(uiSyncTimeoutRef.current);
        uiSyncTimeoutRef.current = null;
      }
    },
    [],
  );

  function updateCameraReady(nextValue: boolean) {
    cameraReadyRef.current = nextValue;
    setCameraReady(nextValue);
  }

  function updateMode(nextValue: AppMode) {
    modeRef.current = nextValue;
    setMode(nextValue);
  }

  function scheduleRealtimeUiSync(immediate = false) {
    const flush = () => {
      uiSyncTimeoutRef.current = null;
      lastUiSyncAtRef.current = Date.now();
      const nextResult = latestResultRef.current;
      const nextMetrics = { ...metricsRef.current };
      startTransition(() => {
        setLatestResult(nextResult);
        setMetrics(nextMetrics);
      });
    };

    if (immediate) {
      if (uiSyncTimeoutRef.current) {
        clearTimeout(uiSyncTimeoutRef.current);
        uiSyncTimeoutRef.current = null;
      }
      flush();
      return;
    }

    const elapsed = Date.now() - lastUiSyncAtRef.current;
    if (elapsed >= REALTIME_UI_SYNC_MS) {
      flush();
      return;
    }

    if (!uiSyncTimeoutRef.current) {
      uiSyncTimeoutRef.current = setTimeout(flush, REALTIME_UI_SYNC_MS - elapsed);
    }
  }

  function syncQueueDepth() {
    metricsRef.current = {
      ...metricsRef.current,
      queueDepth: speechService.getQueueDepth(),
    };
    scheduleRealtimeUiSync(true);
  }

  function appendLog(level: SessionLogEntry["level"], message: string) {
    const formatted = `[VisionEdge][app] ${message}`;
    if (level === "error") {
      console.error(formatted);
    } else if (level === "warning") {
      console.warn(formatted);
    } else {
      console.info(formatted);
    }

    if (!shouldPersistAppLog(level, message)) {
      return;
    }

    const entry: SessionLogEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      level,
      message,
      createdAt: Date.now(),
    };
    setLogs((current) => [entry, ...current].slice(0, 20));
    void settingsRepository.addSessionLog(entry);
  }

  async function speak(
    text: string,
    options?: {
      interrupt?: boolean;
      replaceQueue?: boolean;
    },
  ) {
    const currentSettings = settingsRef.current;
    if (!currentSettings || isMutedRef.current) {
      return;
    }
    try {
      syncQueueDepth();
      await speechService.enqueue(text, {
        rate: currentSettings.speechRate,
        audioOutputMode: currentSettings.audioOutputMode,
        interrupt: options?.interrupt,
        replaceQueue: options?.replaceQueue,
      });
      syncQueueDepth();
    } catch (error: unknown) {
      if (currentSettings.vibrationEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setErrorMessage(error instanceof Error ? error.message : "Speech output failed.");
      updateMode("error");
      appendLog("error", "Speech output failed.");
    }
  }

  async function requestCameraAccess() {
    appendLog("info", "Requesting camera permission.");
    if (hasPermission || (await requestPermission())) {
      setOnboardingComplete(true);
      activeTabRef.current = "home";
      setActiveTab("home");
      void speak("Camera access granted.", { interrupt: true, replaceQueue: true });
      appendLog("info", "Camera permission granted.");
      return true;
    }

    setErrorMessage("Camera access is unavailable. Please enable camera permission.");
    updateMode("error");
    void speak("Camera access is unavailable. Please enable camera permission.", {
      interrupt: true,
      replaceQueue: true,
    });
    appendLog("warning", "Camera permission denied.");
    return false;
  }

  function handleRealtimeDetection(payload: RealtimeFramePayload) {
    if (activeTabRef.current !== "home" || modeRef.current !== "active") {
      return;
    }

    const currentSettings = settingsRef.current;
    if (!currentSettings) {
      return;
    }

    const previousResult = latestResultRef.current;
    const result = buildDetectionResultFromRealtimePayload(payload);
    const narrationEvent = buildNarrationEvent(
      previousResult,
      result,
      currentSettings,
      lastNarrationAtRef.current,
    );
    const latency = Date.now() - payload.capturedAt;
    processedFrameCountRef.current += 1;
    latestResultRef.current = result;
    metricsRef.current = {
      ...metricsRef.current,
      framesCaptured: metricsRef.current.framesCaptured + 1,
      lastCaptureAt: payload.capturedAt,
      avgLatencyMs:
        processedFrameCountRef.current === 1
          ? latency
          : Math.round(
              (metricsRef.current.avgLatencyMs * (processedFrameCountRef.current - 1) + latency) /
                processedFrameCountRef.current,
            ),
      lastInferenceMs: result.inferenceTimeMs,
      queueDepth: speechService.getQueueDepth(),
      activeBackend: result.backend,
    };
    setErrorMessage(null);

    if (narrationEvent.shouldSpeak && narrationEvent.text) {
      const spokenAt = Date.now();
      lastNarrationAtRef.current = spokenAt;
      metricsRef.current = {
        ...metricsRef.current,
        lastNarrationAt: spokenAt,
        totalNarrations: metricsRef.current.totalNarrations + 1,
        queueDepth: speechService.getQueueDepth(),
      };
      void speak(narrationEvent.text, {
        interrupt: true,
        replaceQueue: true,
      });
      appendLog("info", `Narrated scene via ${result.backend}.`);
    }

    if (
      result.lowLight &&
      currentSettings.lowLightAlertsEnabled &&
      !previousResult?.lowLight
    ) {
      appendLog("warning", "Low-light scene detected.");
    }

    const sceneChanged =
      !previousResult ||
      previousResult.summary !== result.summary ||
      previousResult.lowLight !== result.lowLight;
    scheduleRealtimeUiSync(sceneChanged || narrationEvent.shouldSpeak);
  }

  async function startAssistance() {
    if (!hasPermission) {
      const permissionGranted = await requestCameraAccess();
      if (!permissionGranted) {
        return;
      }
    }

    updateMode("initializing");
    processedFrameCountRef.current = 0;
    lastNarrationAtRef.current = null;
    latestResultRef.current = null;
    metricsRef.current = { ...defaultMetrics };
    scheduleRealtimeUiSync(true);
    setCameraVisible(true);
    updateCameraReady(false);
    syncQueueDepth();
    void speak("Visual assistance started.", { interrupt: true, replaceQueue: true });
    if (!frameProcessorModel || !frameProcessorInputConfig) {
      const message =
        "Bundled local vision model is unavailable. Rebuild the Android app so the TFLite runtime and model are installed.";
      void speak(message, { interrupt: true, replaceQueue: true });
      setErrorMessage(message);
      updateMode("error");
      setCameraVisible(false);
      appendLog("error", message);
      return;
    }
    appendLog("info", "Assistance started. Waiting for camera readiness.");
  }

  async function stopAssistance() {
    updateMode("idle");
    setCameraVisible(false);
    updateCameraReady(false);
    syncQueueDepth();
    void speechService.stop();
    void speak("Visual assistance stopped.", { interrupt: true, replaceQueue: true });
    appendLog("info", "Assistance stopped.");
  }

  async function toggleAssistance() {
    if (mode === "active" || mode === "paused") {
      await stopAssistance();
      return;
    }

    await startAssistance();
  }

  async function togglePause() {
    if (mode === "active") {
      updateMode("paused");
      updateCameraReady(false);
      void speak("Narration paused.", { interrupt: true, replaceQueue: true });
      appendLog("info", "Assistance paused.");
      return;
    }

    if (mode === "paused") {
      updateMode("initializing");
      void speak("Narration resumed.", { interrupt: true, replaceQueue: true });
      appendLog("info", "Assistance resumed.");
    }
  }

  async function handleRepeat() {
    await speechService.repeatLast({
      rate: settings?.speechRate || 1,
      audioOutputMode: settings?.audioOutputMode || "speaker",
    });
    appendLog("info", "Repeated the last narration.");
  }

  async function handleMuteToggle() {
    const nextValue = !isMuted;
    if (nextValue) {
      await speak("Audio muted.");
      setIsMuted(true);
      await speechService.stop();
    } else {
      setIsMuted(false);
      await speak("Audio unmuted.");
    }
    appendLog("info", nextValue ? "Audio muted." : "Audio unmuted.");
  }

  async function handleRetry() {
    setErrorMessage(null);
    updateMode("idle");
    if (!hasPermission) {
      const permissionGranted = await requestCameraAccess();
      if (!permissionGranted) {
        return;
      }
    }
    await startAssistance();
  }

  async function handlePatchSettings(patch: Partial<AppSettings>, announcement: string) {
    if (!settings) {
      return;
    }

    const nextSettings = { ...settings, ...patch };
    setSettings(nextSettings);
    void settingsRepository.saveSettings(nextSettings);
    void speak(announcement, { interrupt: true, replaceQueue: true });
    appendLog("info", announcement);
  }

  function handleCameraInitialized() {
    appendLog("info", "VisionCamera session initialized.");
  }

  function handleCameraReady() {
    updateCameraReady(true);
    appendLog("info", "Camera preview is ready.");
    if (modeRef.current === "initializing") {
      updateMode("active");
      appendLog("info", "Camera ready. VisionCamera frame processor is active.");
    }
  }

  function handleCameraStopped() {
    updateCameraReady(false);
    appendLog("info", "Camera preview stopped.");
  }

  function handleCameraMountError(message: string) {
    updateCameraReady(false);
    setErrorMessage(message);
    updateMode("error");
    setCameraVisible(false);
    appendLog("error", `Camera runtime failed: ${message}`);
    void speak(message, { interrupt: true, replaceQueue: true });
  }

  async function navigateToTab(nextTab: AppTab, announcement?: string) {
    activeTabRef.current = nextTab;
    setActiveTab(nextTab);
    if (nextTab !== "home") {
      updateCameraReady(false);
    }
    if (announcement) {
      void speak(announcement, { interrupt: true, replaceQueue: true });
    }
    appendLog("info", `Navigated to ${nextTab}.`);
  }

  const handleRealtimeDetectionStable = useCallback((payload: RealtimeFramePayload) => {
    handleRealtimeDetection(payload);
  }, []);
  const handleCameraMountErrorStable = useCallback((message: string) => {
    handleCameraMountError(message);
  }, []);
  const handleCameraInitializedStable = useCallback(() => {
    handleCameraInitialized();
  }, []);
  const handleCameraReadyStable = useCallback(() => {
    handleCameraReady();
  }, []);
  const handleCameraStoppedStable = useCallback(() => {
    handleCameraStopped();
  }, []);
  const navigateHome = useCallback(() => {
    void navigateToTab("home", "Home screen.");
  }, []);
  const navigateToSettings = useCallback(() => {
    void navigateToTab("settings", "Settings opened.");
  }, []);

  if (!appReady || !settings) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingState}>
          <Text style={styles.pageTitle}>Loading VisionEdge</Text>
          <Text style={styles.bodyText}>Preparing settings, speech, and local model metadata.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showOnboarding = !onboardingComplete;
  const isCameraStreamActive =
    cameraVisible &&
    activeTab === "home" &&
    appState === "active" &&
    (mode === "active" || mode === "initializing");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {cameraVisible && activeTab === "home" ? (
        <View style={styles.cameraFrame}>
          <RealtimeVisionCamera
            active={isCameraStreamActive}
            model={frameProcessorModel}
            inputConfig={frameProcessorInputConfig}
            onInitialized={handleCameraInitializedStable}
            onFrameResult={handleRealtimeDetectionStable}
            onCameraError={handleCameraMountErrorStable}
            onPreviewStarted={handleCameraReadyStable}
            onPreviewStopped={handleCameraStoppedStable}
          />
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraOverlayText}>
              {!cameraReady
                ? "Waiting for camera preview"
                : speechReady
                  ? "Live camera preview"
                  : "Speech initializing"}
            </Text>
          </View>
        </View>
      ) : null}

      {showOnboarding ? (
        <OnboardingScreen onGrant={requestCameraAccess} permissionGranted={hasPermission} />
      ) : activeTab === "settings" ? (
        <SettingsScreen
          settings={settings}
          geminiConfigured={geminiConfigured}
          onBack={navigateHome}
          onPatch={handlePatchSettings}
        />
      ) : activeTab === "summary" ? (
        <SummaryScreen
          mode={mode}
          latestResult={deferredLatestResult}
          metrics={deferredMetrics}
          logs={logs}
          models={models}
          onBack={navigateHome}
        />
      ) : (
        <HomeScreen
          mode={mode}
          permissionGranted={hasPermission}
          isMuted={isMuted}
          latestResult={deferredLatestResult}
          metrics={deferredMetrics}
          errorMessage={errorMessage}
          onStartStop={toggleAssistance}
          onPauseResume={togglePause}
          onRepeat={handleRepeat}
          onMuteToggle={handleMuteToggle}
          onOpenSettings={navigateToSettings}
          onRetry={handleRetry}
        />
      )}

      {!showOnboarding ? (
        <View style={styles.tabBar}>
          {[
            { key: "home" as const, label: "Home", icon: "home" as const },
            { key: "summary" as const, label: "Debug", icon: "dashboard" as const },
            { key: "settings" as const, label: "Settings", icon: "settings" as const },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={`Open ${tab.label}`}
              onPress={() => {
                void navigateToTab(
                  tab.key,
                  tab.key === "home"
                    ? "Home screen."
                    : tab.key === "summary"
                      ? "Debug summary opened."
                      : "Settings opened.",
                );
              }}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            >
              <AppIcon
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 110,
    gap: spacing.lg,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  brandEyebrow: {
    ...typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.primary,
  },
  pageTitle: {
    ...typography.title1,
    color: colors.text,
  },
  heroCard: {
    gap: spacing.lg,
  },
  heroStatus: {
    ...typography.title2,
    color: colors.text,
    textAlign: "center",
  },
  heroSummary: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
  },
  bodyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  listBlock: {
    gap: spacing.md,
  },
  objectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  objectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  objectIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  objectTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  objectSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  objectDistance: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  mutedText: {
    ...typography.body,
    color: colors.textSoft,
  },
  onboardingHeader: {
    alignItems: "center",
    gap: spacing.md,
  },
  iconBadge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floating,
  },
  onboardingCopy: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  settingRowWrap: {
    gap: spacing.sm,
  },
  settingLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  settingActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  choiceChip: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  choiceChipText: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  choiceChipTextActive: {
    color: colors.primary,
  },
  metricsGrid: {
    gap: spacing.sm,
  },
  tabBar: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    minHeight: 60,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    ...typography.micro,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  cameraFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    overflow: "hidden",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  cameraOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cameraOverlayText: {
    ...typography.caption,
    color: colors.white,
    textAlign: "center",
  },
});
