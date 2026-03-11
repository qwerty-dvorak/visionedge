import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type TabKey = "home" | "summary" | "settings";
type ScreenKey = "onboarding" | TabKey;
type IconFamily = "Ionicons" | "MaterialIcons" | "MaterialCommunityIcons";
type BannerTone = "neutral" | "warning" | "danger" | "success";
type QuickTone = "primary" | "secondary" | "ghost";
type AppMode =
  | "idle"
  | "active"
  | "paused"
  | "muted"
  | "permissionDenied"
  | "cameraUnavailable"
  | "lowLight"
  | "noObjects"
  | "audioFailure"
  | "error";

type IconNameMap = {
  Ionicons: React.ComponentProps<typeof Ionicons>["name"];
  MaterialIcons: React.ComponentProps<typeof MaterialIcons>["name"];
  MaterialCommunityIcons: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
};

type IconSpec =
  | { family: "Ionicons"; name: IconNameMap["Ionicons"] }
  | { family: "MaterialIcons"; name: IconNameMap["MaterialIcons"] }
  | {
      family: "MaterialCommunityIcons";
      name: IconNameMap["MaterialCommunityIcons"];
    };

type IconKey =
  | "vision"
  | "dashboard"
  | "settings"
  | "camera"
  | "textScan"
  | "palette"
  | "pause"
  | "repeat"
  | "mute"
  | "warning"
  | "error"
  | "latency"
  | "profile"
  | "refresh"
  | "narration"
  | "table"
  | "chair"
  | "laptop"
  | "devices"
  | "security"
  | "translation"
  | "reset"
  | "fps"
  | "queue"
  | "explore"
  | "saved"
  | "live"
  | "play"
  | "stop"
  | "check"
  | "headphones"
  | "battery"
  | "memory"
  | "shield"
  | "retry"
  | "speaker"
  | "moon"
  | "empty"
  | "accessibility"
  | "home";

type SceneObject = {
  id: string;
  label: string;
  icon: IconKey;
  confidence: number;
  distanceMeters: number;
  position: string;
  priority: "high" | "medium" | "low";
  quantity?: number;
};

type QuickAction = {
  id: string;
  label: string;
  icon: IconKey;
  tone: QuickTone;
};

type OnboardingFeature = {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
};

type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: IconKey;
  progress: number;
  tone: "up" | "down" | "stable";
};

type SystemAction = {
  id: string;
  label: string;
  description: string;
  icon: IconKey;
  value?: string;
  kind: "navigation" | "toggle" | "info";
  enabled?: boolean;
};

type SettingsState = {
  speechRate: number;
  verbosity: "minimal" | "balanced" | "detailed";
  audioRouting: "speaker" | "headphones";
  vibrationEnabled: boolean;
  lowLightAlertsEnabled: boolean;
  translationEnabled: boolean;
};

type ModeConfig = {
  title: string;
  subtitle: string;
  bannerTone: BannerTone;
  bannerTitle: string;
  bannerMessage: string;
  narration: string;
  confidenceLabel: string;
  updatedAtLabel: string;
  visibleCount: number;
  latencyLabel: string;
  heroEyebrow: string;
  isLive: boolean;
  showErrorPanel?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  errorCta?: string;
  objects: SceneObject[];
};

const colors = {
  background: "#120907",
  backgroundAlt: "#1a0f0d",
  surface: "#1e1311",
  surfaceElevated: "#261815",
  surfaceSoft: "#31211d",
  primary: "#ff8a70",
  primaryStrong: "#ff9f89",
  primaryMuted: "rgba(255,138,112,0.16)",
  primarySoft: "rgba(255,138,112,0.08)",
  border: "rgba(255,138,112,0.16)",
  text: "#f7f2ef",
  textMuted: "#bda9a2",
  textSoft: "#8f7972",
  white: "#ffffff",
  black: "#000000",
  success: "#a3e635",
  warning: "#fbbf24",
  danger: "#fb7185",
  info: "#60a5fa",
};

const iconMap: Record<IconKey, IconSpec> = {
  vision: { family: "Ionicons", name: "eye-outline" },
  dashboard: { family: "MaterialCommunityIcons", name: "monitor-dashboard" },
  settings: { family: "Ionicons", name: "settings-outline" },
  camera: { family: "Ionicons", name: "camera-outline" },
  textScan: { family: "MaterialCommunityIcons", name: "text-recognition" },
  palette: { family: "Ionicons", name: "color-palette-outline" },
  pause: { family: "Ionicons", name: "pause-circle" },
  repeat: { family: "Ionicons", name: "volume-high" },
  mute: { family: "Ionicons", name: "volume-mute" },
  warning: { family: "Ionicons", name: "warning-outline" },
  error: { family: "Ionicons", name: "alert-circle-outline" },
  latency: { family: "MaterialCommunityIcons", name: "speedometer" },
  profile: { family: "Ionicons", name: "person-circle-outline" },
  refresh: { family: "Ionicons", name: "refresh" },
  narration: { family: "MaterialCommunityIcons", name: "waveform" },
  table: { family: "MaterialCommunityIcons", name: "table-furniture" },
  chair: { family: "MaterialCommunityIcons", name: "chair-rolling" },
  laptop: { family: "MaterialCommunityIcons", name: "laptop" },
  devices: { family: "Ionicons", name: "hardware-chip-outline" },
  security: { family: "Ionicons", name: "shield-checkmark-outline" },
  translation: { family: "MaterialIcons", name: "translate" },
  reset: { family: "MaterialCommunityIcons", name: "restart" },
  fps: { family: "MaterialCommunityIcons", name: "motion-play" },
  queue: { family: "MaterialCommunityIcons", name: "playlist-play" },
  explore: { family: "Ionicons", name: "compass-outline" },
  saved: { family: "Ionicons", name: "bookmark-outline" },
  live: { family: "Ionicons", name: "radio" },
  play: { family: "Ionicons", name: "play" },
  stop: { family: "Ionicons", name: "stop-circle" },
  check: { family: "Ionicons", name: "checkmark-circle-outline" },
  headphones: { family: "Ionicons", name: "headset-outline" },
  battery: { family: "Ionicons", name: "battery-half-outline" },
  memory: { family: "MaterialCommunityIcons", name: "memory" },
  shield: { family: "Ionicons", name: "lock-closed-outline" },
  retry: { family: "Ionicons", name: "refresh-circle-outline" },
  speaker: { family: "Ionicons", name: "volume-medium-outline" },
  moon: { family: "Ionicons", name: "moon-outline" },
  empty: { family: "Ionicons", name: "sparkles-outline" },
  accessibility: {
    family: "MaterialIcons",
    name: "accessibility-new",
  },
  home: { family: "Ionicons", name: "home-outline" },
};

const tabs: Array<{ key: TabKey; label: string; icon: IconKey }> = [
  { key: "home", label: "Vision", icon: "vision" },
  { key: "summary", label: "Debug", icon: "dashboard" },
  { key: "settings", label: "Settings", icon: "settings" },
];

const onboardingFeatures: OnboardingFeature[] = [
  {
    id: "identify",
    title: "Identify Objects",
    description:
      "Recognize nearby furniture, devices, and obstacles with spoken updates.",
    icon: "camera",
  },
  {
    id: "read",
    title: "Read Text",
    description:
      "Prepare the UI for OCR-focused guidance and narration workflows.",
    icon: "textScan",
  },
  {
    id: "color",
    title: "Color Detection",
    description:
      "Preview future color-aware assistance for labels, clothing, and scenes.",
    icon: "palette",
  },
];

const baseObjects: SceneObject[] = [
  {
    id: "table",
    label: "Dining Table",
    icon: "table",
    confidence: 0.95,
    distanceMeters: 1.2,
    position: "Center of room",
    priority: "high",
  },
  {
    id: "chairs",
    label: "Chair",
    icon: "chair",
    confidence: 0.88,
    distanceMeters: 1.5,
    position: "Around table",
    priority: "medium",
    quantity: 4,
  },
  {
    id: "laptop",
    label: "Laptop",
    icon: "laptop",
    confidence: 0.83,
    distanceMeters: 0.8,
    position: "On table edge",
    priority: "medium",
  },
];

const modeConfigs: Record<AppMode, ModeConfig> = {
  idle: {
    title: "Ready to Start Assistance",
    subtitle: "Home",
    bannerTone: "neutral",
    bannerTitle: "System ready",
    bannerMessage:
      "Tap Start to initialize the camera, begin frame capture, and prepare narration.",
    narration: "Visual assistance is idle. Tap Start to begin.",
    confidenceLabel: "Awaiting camera start",
    updatedAtLabel: "Idle state",
    visibleCount: 0,
    latencyLabel: "Standby",
    heroEyebrow: "Idle",
    isLive: false,
    objects: [],
  },
  active: {
    title: "Living Room Interior",
    subtitle: "Current Scene",
    bannerTone: "success",
    bannerTitle: "Visual assistance started",
    bannerMessage:
      "Camera preview, object detection, and offline narration placeholders are active.",
    narration:
      "A wooden dining table with a ceramic vase and four chairs is ahead. A laptop is open on the far end.",
    confidenceLabel: "High confidence",
    updatedAtLabel: "Updated 2s ago",
    visibleCount: 3,
    latencyLabel: "12ms",
    heroEyebrow: "Live assistance",
    isLive: true,
    objects: baseObjects,
  },
  paused: {
    title: "Processing Paused",
    subtitle: "Session State",
    bannerTone: "warning",
    bannerTitle: "Narration paused",
    bannerMessage:
      "Scene updates and spoken output are paused until you resume the session.",
    narration:
      "Narration is paused. Resume when you're ready for live updates.",
    confidenceLabel: "Paused state",
    updatedAtLabel: "Updated just now",
    visibleCount: 3,
    latencyLabel: "Paused",
    heroEyebrow: "Paused",
    isLive: false,
    objects: baseObjects,
  },
  muted: {
    title: "Audio Muted",
    subtitle: "Session State",
    bannerTone: "warning",
    bannerTitle: "Speech muted",
    bannerMessage:
      "Detections continue, but audible confirmations and narration are muted.",
    narration:
      "Objects are still being analyzed, but speech output is muted at the moment.",
    confidenceLabel: "Audio muted",
    updatedAtLabel: "Updated just now",
    visibleCount: 3,
    latencyLabel: "14ms",
    heroEyebrow: "Muted",
    isLive: true,
    objects: baseObjects,
  },
  permissionDenied: {
    title: "Camera Permission Required",
    subtitle: "Permission State",
    bannerTone: "danger",
    bannerTitle: "Camera access is unavailable",
    bannerMessage:
      "Please enable camera permission before starting live visual assistance.",
    narration: "Camera access is unavailable. Please enable camera permission.",
    confidenceLabel: "Permission denied",
    updatedAtLabel: "Needs permission",
    visibleCount: 0,
    latencyLabel: "Blocked",
    heroEyebrow: "Permission required",
    isLive: false,
    showErrorPanel: true,
    errorTitle: "Camera permission denied",
    errorMessage:
      "Grant permission in settings, then tap Retry to reinitialize the session.",
    errorCta: "Retry",
    objects: [],
  },
  cameraUnavailable: {
    title: "Camera Unavailable",
    subtitle: "Recovery State",
    bannerTone: "danger",
    bannerTitle: "Camera disconnected",
    bannerMessage:
      "The camera became unavailable during the session. VisionEdge moved to a safe error state.",
    narration: "Camera unavailable. Visual assistance has stopped safely.",
    confidenceLabel: "Hardware unavailable",
    updatedAtLabel: "Disconnected just now",
    visibleCount: 0,
    latencyLabel: "Unavailable",
    heroEyebrow: "Subsystem error",
    isLive: false,
    showErrorPanel: true,
    errorTitle: "Camera unavailable mid-session",
    errorMessage:
      "Reconnect camera access or retry initialization to return to idle state.",
    errorCta: "Retry",
    objects: [],
  },
  lowLight: {
    title: "Low-Light Room",
    subtitle: "Current Scene",
    bannerTone: "warning",
    bannerTitle: "Low-light detected",
    bannerMessage:
      "Dim lighting is reducing precision. Move slowly and rely on nearby object cues.",
    narration:
      "The room is dim. A side table is near your left hand and a sofa is against the far wall.",
    confidenceLabel: "Reduced confidence",
    updatedAtLabel: "Updated 4s ago",
    visibleCount: 2,
    latencyLabel: "21ms",
    heroEyebrow: "Live assistance",
    isLive: true,
    objects: [
      {
        id: "side-table",
        label: "Side Table",
        icon: "table",
        confidence: 0.61,
        distanceMeters: 0.7,
        position: "Left side",
        priority: "high",
      },
      {
        id: "sofa",
        label: "Sofa",
        icon: "saved",
        confidence: 0.67,
        distanceMeters: 2.0,
        position: "Against back wall",
        priority: "medium",
      },
    ],
  },
  noObjects: {
    title: "Featureless Scene",
    subtitle: "Current Scene",
    bannerTone: "neutral",
    bannerTitle: "No objects detected",
    bannerMessage:
      "The current view is blank or low-feature. VisionEdge is still monitoring for changes.",
    narration: "No objects detected.",
    confidenceLabel: "Empty result",
    updatedAtLabel: "Updated 3s ago",
    visibleCount: 0,
    latencyLabel: "11ms",
    heroEyebrow: "Live assistance",
    isLive: true,
    objects: [],
  },
  audioFailure: {
    title: "Audio Output Issue",
    subtitle: "Fallback State",
    bannerTone: "warning",
    bannerTitle: "Audio output failure",
    bannerMessage:
      "Speech playback failed. Visual fallback and haptic notification placeholders are shown instead.",
    narration:
      "Audio output failed. Visual feedback is being used as a fallback.",
    confidenceLabel: "Fallback active",
    updatedAtLabel: "Updated just now",
    visibleCount: 3,
    latencyLabel: "16ms",
    heroEyebrow: "Live assistance",
    isLive: true,
    objects: baseObjects,
  },
  error: {
    title: "Subsystem Error",
    subtitle: "Error State",
    bannerTone: "danger",
    bannerTitle: "Recovery required",
    bannerMessage:
      "An unrecoverable placeholder error occurred. Use Retry to reinitialize the subsystem.",
    narration: "An error occurred. Retry when the subsystem is ready again.",
    confidenceLabel: "Error state",
    updatedAtLabel: "Updated just now",
    visibleCount: 0,
    latencyLabel: "Stopped",
    heroEyebrow: "Error",
    isLive: false,
    showErrorPanel: true,
    errorTitle: "Visual assistance stopped",
    errorMessage:
      "Retry should attempt to restore permissions, reinitialize the camera, and return to idle.",
    errorCta: "Retry",
    objects: [],
  },
};

const summaryMetrics: SummaryMetric[] = [
  {
    id: "fps",
    label: "FPS",
    value: "2.4",
    delta: "Target met",
    icon: "fps",
    progress: 0.75,
    tone: "up",
  },
  {
    id: "latency",
    label: "Latency",
    value: "1.2s",
    delta: "< 2s",
    icon: "latency",
    progress: 0.65,
    tone: "up",
  },
  {
    id: "queue",
    label: "TTS Queue",
    value: "2",
    delta: "Sequential",
    icon: "queue",
    progress: 0.3,
    tone: "stable",
  },
];

const systemActions: SystemAction[] = [
  {
    id: "devices",
    label: "Paired Devices",
    description: "Manage connected wearables and headphone routing.",
    icon: "headphones",
    value: "2 connected",
    kind: "navigation",
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    description:
      "Review local processing, no-network, and no-storage promises.",
    icon: "shield",
    kind: "navigation",
  },
  {
    id: "translation",
    label: "Real-time Translation",
    description: "Placeholder toggle for future multilingual assistance.",
    icon: "translation",
    kind: "toggle",
    enabled: false,
  },
  {
    id: "reset",
    label: "Reset Settings",
    description: "Restore the test UI to default demo values.",
    icon: "reset",
    kind: "info",
  },
];

function AppIcon({
  icon,
  size = 22,
  color = colors.text,
}: {
  icon: IconKey;
  size?: number;
  color?: string;
}) {
  const spec = iconMap[icon];

  if (spec.family === "Ionicons") {
    return <Ionicons name={spec.name} size={size} color={color} />;
  }

  if (spec.family === "MaterialIcons") {
    return <MaterialIcons name={spec.name} size={size} color={color} />;
  }

  return <MaterialCommunityIcons name={spec.name} size={size} color={color} />;
}

function SectionTitle({
  title,
  accessory,
}: {
  title: string;
  accessory?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {accessory}
    </View>
  );
}

function TonePill({ tone, label }: { tone: BannerTone; label: string }) {
  const toneColor =
    tone === "danger"
      ? colors.danger
      : tone === "warning"
        ? colors.warning
        : tone === "success"
          ? colors.success
          : colors.primary;

  return (
    <View
      style={[
        styles.pill,
        { borderColor: toneColor, backgroundColor: `${toneColor}22` },
      ]}
    >
      <Text style={[styles.pillText, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

function StatusBanner({
  tone,
  title,
  message,
  icon,
}: {
  tone: BannerTone;
  title: string;
  message: string;
  icon: IconKey;
}) {
  const bannerColor =
    tone === "danger"
      ? colors.danger
      : tone === "warning"
        ? colors.warning
        : tone === "success"
          ? colors.success
          : colors.primary;

  return (
    <View
      style={[
        styles.alertCard,
        {
          borderColor: `${bannerColor}55`,
          backgroundColor:
            tone === "danger"
              ? "rgba(251,113,133,0.08)"
              : tone === "warning"
                ? "rgba(251,191,36,0.08)"
                : tone === "success"
                  ? "rgba(163,230,53,0.08)"
                  : colors.surface,
        },
      ]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title}. ${message}`}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIcon}>
          <AppIcon icon={icon} size={18} color={bannerColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

function SliderBar({
  value,
  min = 0,
  max = 1,
}: {
  value: number;
  min?: number;
  max?: number;
}) {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const sliderWidth = 100;
  const thumbSize = 24;
  const fillWidth = ratio * sliderWidth;
  const thumbLeft = fillWidth - thumbSize / 2;

  return (
    <View style={styles.fakeSliderTrack} accessibilityRole="adjustable">
      <View style={[styles.fakeSliderFill, { width: fillWidth }]} />
      <View style={[styles.fakeSliderThumb, { left: thumbLeft }]} />
    </View>
  );
}

function HomeScreen({
  mode,
  settings,
  onOpenSettings,
  onToggleStartStop,
  onPause,
  onRepeat,
  onMute,
  onRetry,
  onSelectMode,
}: {
  mode: AppMode;
  settings: SettingsState;
  onOpenSettings: () => void;
  onToggleStartStop: () => void;
  onPause: () => void;
  onRepeat: () => void;
  onMute: () => void;
  onRetry: () => void;
  onSelectMode: (nextMode: AppMode) => void;
}) {
  const config = modeConfigs[mode];

  const quickActions: QuickAction[] = [
    {
      id: "pause",
      label: mode === "paused" ? "Resume" : "Pause",
      icon: mode === "paused" ? "play" : "pause",
      tone: "secondary",
    },
    { id: "repeat", label: "Repeat", icon: "repeat", tone: "primary" },
    {
      id: "mute",
      label: mode === "muted" ? "Unmute" : "Mute",
      icon: mode === "muted" ? "speaker" : "mute",
      tone: "secondary",
    },
  ];

  const startStopLabel =
    mode === "active" ||
    mode === "paused" ||
    mode === "muted" ||
    mode === "lowLight" ||
    mode === "noObjects" ||
    mode === "audioFailure"
      ? "Stop Assistance"
      : "Start Assistance";

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.latencyBadge}>
          <AppIcon icon="latency" size={14} color={colors.primary} />
          <Text style={styles.latencyText}>Latency: {config.latencyLabel}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            accessibilityHint="Open the settings screen"
            onPress={onOpenSettings}
            style={styles.iconButton}
          >
            <AppIcon icon="settings" size={20} color={colors.primary} />
          </Pressable>
          <View
            style={styles.avatarWrap}
            accessibilityRole="image"
            accessibilityLabel="VisionEdge profile status"
          >
            <AppIcon icon="profile" size={24} color={colors.primary} />
          </View>
        </View>
      </View>

      <View style={styles.heroCard}>
        <LinearGradient
          colors={["#35201b", "#120907"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroGrid} />

        <View style={styles.heroTopRow}>
          {config.isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          ) : (
            <View style={[styles.liveBadge, styles.standbyBadge]}>
              <Text style={styles.liveText}>Standby</Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={startStopLabel}
            accessibilityHint={
              startStopLabel === "Start Assistance"
                ? "Start camera and narration placeholders"
                : "Stop assistance and release active session state"
            }
            onPress={onToggleStartStop}
            style={[
              styles.primaryAssistButton,
              startStopLabel === "Stop Assistance" && styles.stopAssistButton,
            ]}
          >
            <AppIcon
              icon={startStopLabel === "Start Assistance" ? "play" : "stop"}
              size={18}
              color={
                startStopLabel === "Start Assistance"
                  ? colors.background
                  : colors.white
              }
            />
            <Text
              style={[
                styles.primaryAssistButtonText,
                startStopLabel === "Stop Assistance" &&
                  styles.stopAssistButtonText,
              ]}
            >
              {startStopLabel}
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroBody}>
          <Text style={styles.eyebrow}>{config.heroEyebrow}</Text>
          <Text style={styles.heroTitle}>{config.title}</Text>
          <Text style={styles.heroCaption}>{config.updatedAtLabel}</Text>
          <View style={styles.heroMetaRow}>
            <TonePill tone={config.bannerTone} label={config.confidenceLabel} />
            <TonePill tone="neutral" label={`${config.visibleCount} visible`} />
            <TonePill
              tone="neutral"
              label={`${settings.speechRate.toFixed(1)}x`}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry initialization"
          accessibilityHint="Attempt to recover the camera and narration pipeline"
          onPress={onRetry}
          style={styles.refreshFab}
        >
          <AppIcon icon="refresh" size={22} color={colors.background} />
        </Pressable>
      </View>

      <StatusBanner
        tone={config.bannerTone}
        title={config.bannerTitle}
        message={config.bannerMessage}
        icon={
          config.bannerTone === "danger"
            ? "error"
            : config.bannerTone === "warning"
              ? "warning"
              : config.bannerTone === "success"
                ? "check"
                : "narration"
        }
      />

      <LinearGradient
        colors={["rgba(255,138,112,0.18)", "rgba(255,138,112,0.04)"]}
        style={styles.narrationCard}
      >
        <View style={styles.narrationWatermark}>
          <AppIcon icon="narration" size={48} color="rgba(255,255,255,0.12)" />
        </View>
        <Text style={styles.eyebrow}>Live Narration</Text>
        <Text style={styles.narrationText}>"{config.narration}"</Text>
      </LinearGradient>

      {config.showErrorPanel ? (
        <View style={styles.errorStateCard}>
          <View style={styles.errorStateIcon}>
            <AppIcon icon="error" size={28} color={colors.danger} />
          </View>
          <Text style={styles.errorStateTitle}>{config.errorTitle}</Text>
          <Text style={styles.errorStateMessage}>{config.errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={config.errorCta ?? "Retry"}
            onPress={onRetry}
            style={styles.errorRetryButton}
          >
            <AppIcon icon="retry" size={18} color={colors.background} />
            <Text style={styles.errorRetryText}>
              {config.errorCta ?? "Retry"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.quickActionRow}>
        {quickActions.map((action) => {
          const isPrimary = action.tone === "primary";
          const onPress =
            action.id === "pause"
              ? onPause
              : action.id === "repeat"
                ? onRepeat
                : onMute;

          return (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={`Trigger ${action.label.toLowerCase()} action`}
              onPress={onPress}
              style={[
                styles.quickActionButton,
                isPrimary
                  ? styles.quickActionPrimary
                  : styles.quickActionSecondary,
              ]}
            >
              <AppIcon
                icon={action.icon}
                size={28}
                color={isPrimary ? colors.background : colors.primary}
              />
              <Text
                style={[
                  styles.quickActionText,
                  { color: isPrimary ? colors.background : colors.primary },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle
        title="Detected Objects"
        accessory={
          <TonePill tone="success" label={`${config.visibleCount} visible`} />
        }
      />

      {config.objects.length > 0 ? (
        config.objects.map((item) => (
          <View
            key={item.id}
            style={styles.objectCard}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`${item.label}${item.quantity ? ` times ${item.quantity}` : ""}, ${Math.round(
              item.confidence * 100,
            )} percent confidence, ${item.distanceMeters.toFixed(
              1,
            )} meters away, ${item.position}`}
          >
            <View style={styles.objectMain}>
              <View style={styles.objectIconWrap}>
                <AppIcon icon={item.icon} size={24} color={colors.primary} />
              </View>

              <View style={styles.objectTextWrap}>
                <Text style={styles.objectTitle}>
                  {item.label}
                  {item.quantity ? ` x${item.quantity}` : ""}
                </Text>
                <Text style={styles.objectSubtitle}>{item.position}</Text>
              </View>
            </View>

            <View style={styles.objectMeta}>
              <Text style={styles.objectDistance}>
                {item.distanceMeters.toFixed(1)}m
              </Text>
              <Text style={styles.objectMetaLabel}>
                {Math.round(item.confidence * 100)}% confidence
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <AppIcon icon="empty" size={28} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No objects detected</Text>
          <Text style={styles.emptyMessage}>
            This placeholder state supports blank scenes, permission issues, and
            stable-scene suppression cases.
          </Text>
        </View>
      )}

      <SectionTitle title="Test Case UI States" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeStrip}
      >
        {(
          [
            "idle",
            "active",
            "permissionDenied",
            "cameraUnavailable",
            "lowLight",
            "noObjects",
            "audioFailure",
            "error",
          ] as AppMode[]
        ).map((stateMode) => {
          const active = mode === stateMode;
          return (
            <Pressable
              key={stateMode}
              accessibilityRole="button"
              accessibilityLabel={`Preview ${stateMode} state`}
              onPress={() => onSelectMode(stateMode)}
              style={[
                styles.modeChip,
                active ? styles.modeChipActive : styles.modeChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.modeChipText,
                  { color: active ? colors.background : colors.primary },
                ]}
              >
                {stateMode}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionTitle title="Accessibility & Controls" />
      <View style={styles.accessibilityCard}>
        <View style={styles.accessibilityRow}>
          <View style={styles.accessibilityIconWrap}>
            <AppIcon icon="accessibility" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.accessibilityTitle}>
              TalkBack-friendly controls
            </Text>
            <Text style={styles.accessibilitySubtitle}>
              Primary buttons include descriptive labels, and the main action
              area is sized above the 72dp target expectation.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SummaryScreen({ mode }: { mode: AppMode }) {
  const config = modeConfigs[mode];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryHeader}>
        <View>
          <Text style={styles.summaryBrand}>VisionEdge Debug</Text>
          <Text style={styles.summarySubBrand}>ENGINE_V2.0.4_STABLE</Text>
        </View>

        <View style={styles.summaryActions}>
          <View style={styles.smallCircle}>
            <MaterialCommunityIcons
              name="console"
              size={20}
              color={colors.text}
            />
          </View>
          <View style={[styles.smallCircle, styles.smallCirclePrimary]}>
            <Ionicons name="bug-outline" size={20} color={colors.background} />
          </View>
        </View>
      </View>

      <View style={styles.metricRow}>
        {summaryMetrics.map((metric) => {
          const deltaColor =
            metric.tone === "up"
              ? colors.success
              : metric.tone === "down"
                ? colors.danger
                : colors.textSoft;

          return (
            <View key={metric.id} style={styles.metricCard}>
              <View style={styles.metricIconGhost}>
                <AppIcon
                  icon={metric.icon}
                  size={26}
                  color="rgba(255,255,255,0.16)"
                />
              </View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricValueRow}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={[styles.metricDelta, { color: deltaColor }]}>
                  {metric.delta}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${metric.progress * 100}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.debugPreviewCard}>
        <LinearGradient
          colors={["#241511", "#0d0706"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroGrid} />
        <View style={styles.debugHudTop}>
          <View style={styles.rawCapturePill}>
            <Text style={styles.rawCaptureText}>Raw Capture: Active</Text>
          </View>
          <View>
            <Text style={styles.coordsText}>X: 192.44</Text>
            <Text style={styles.coordsText}>Y: 842.01</Text>
            <Text style={styles.coordsText}>Z: -12.33</Text>
          </View>
        </View>

        <View style={styles.crosshairWrap}>
          <View style={styles.crosshairOuter}>
            <View style={styles.crosshairDot} />
          </View>
        </View>

        <View style={styles.debugFooterStrip}>
          <Text style={styles.debugFooterText}>
            Scene: {config.title} | Frame Buffer: 0x82...A1 | Queue: Sequential
          </Text>
        </View>
      </View>

      <View style={styles.systemStateCard}>
        <Text style={styles.systemStateTitle}>System State</Text>

        {[
          [
            "App Mode",
            mode === "active" ? "Active" : mode === "idle" ? "Idle" : mode,
          ],
          ["Narration", config.narration],
          ["Visible Objects", `${config.visibleCount}`],
          ["Status Label", config.confidenceLabel],
          [
            "Expected Error Recovery",
            config.showErrorPanel ? "Retry shown" : "Not needed",
          ],
        ].map(([label, value]) => (
          <View key={label} style={styles.systemStateRow}>
            <Text style={styles.systemStateLabel}>{label}</Text>
            <Text style={styles.systemStateValue}>{value}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="Module Coverage Preview" />
      <View style={styles.coverageList}>
        {[
          "Camera initialization and permission handling",
          "Object narration and static-scene suppression placeholder",
          "Offline TTS queue and audio-failure fallback placeholder",
          "Latency, memory, and sustained-session debug cards",
          "Accessibility, TalkBack labels, and large touch targets",
          "Privacy and no-network/no-storage reassurance UI",
          "Error screen and retry recovery flow",
        ].map((item) => (
          <View key={item} style={styles.coverageItem}>
            <AppIcon icon="check" size={18} color={colors.success} />
            <Text style={styles.coverageItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SettingsScreen({
  settings,
  onBack,
  onCycleSpeechRate,
  onCycleVerbosity,
  onToggleAudioRouting,
  onToggleVibration,
  onToggleLowLightAlerts,
  onToggleTranslation,
}: {
  settings: SettingsState;
  onBack: () => void;
  onCycleSpeechRate: () => void;
  onCycleVerbosity: () => void;
  onToggleAudioRouting: () => void;
  onToggleVibration: () => void;
  onToggleLowLightAlerts: () => void;
  onToggleTranslation: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.settingsTopBar}>
        <View style={styles.settingsTopLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.settingsBrand}>VisionEdge</Text>
        </View>

        <View style={styles.iconButton}>
          <Ionicons name="search" size={20} color={colors.text} />
        </View>
      </View>

      <View style={styles.settingsHeading}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <Text style={styles.settingsSubtitle}>
          Configure audio, verbosity, alerts, privacy, and control placeholders
        </Text>
      </View>

      <Text style={styles.groupLabel}>Audio & Voice</Text>
      <View style={styles.settingsCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Speech rate ${settings.speechRate.toFixed(1)} times`}
          onPress={onCycleSpeechRate}
          style={styles.settingRowColumn}
        >
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Speech Rate</Text>
            <Text style={styles.sliderValue}>
              {settings.speechRate.toFixed(1)}x
            </Text>
          </View>
          <Text style={styles.settingLeadSubtitle}>
            Tap to cycle through speed presets for the TTS placeholder.
          </Text>
          <SliderBar value={settings.speechRate} min={0.5} max={2.0} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Narration verbosity ${settings.verbosity}`}
          onPress={onCycleVerbosity}
          style={styles.simpleSettingRow}
        >
          <View style={styles.inlineWithIcon}>
            <MaterialCommunityIcons
              name="account-voice"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.simpleSettingTitle}>Narration Verbosity</Text>
          </View>
          <Text style={styles.simpleSettingValue}>
            {settings.verbosity.charAt(0).toUpperCase() +
              settings.verbosity.slice(1)}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Audio routing ${settings.audioRouting}`}
          onPress={onToggleAudioRouting}
          style={styles.simpleSettingRow}
        >
          <View style={styles.inlineWithIcon}>
            <AppIcon
              icon={
                settings.audioRouting === "speaker" ? "speaker" : "headphones"
              }
              size={20}
              color={colors.primary}
            />
            <Text style={styles.simpleSettingTitle}>Audio Output Routing</Text>
          </View>
          <Text style={styles.simpleSettingValue}>
            {settings.audioRouting === "speaker" ? "Speaker" : "Headphones"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.groupLabel}>Vision Alerts</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingLeadRow}>
          <View style={styles.settingLeadLeft}>
            <View style={styles.roundIconWrap}>
              <AppIcon icon="vision" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLeadTitle}>Vibration Feedback</Text>
              <Text style={styles.settingLeadSubtitle}>
                Placeholder for nearby object and warning haptics.
              </Text>
            </View>
          </View>

          <Switch
            value={settings.vibrationEnabled}
            onValueChange={onToggleVibration}
            trackColor={{ false: "#55443f", true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Toggle vibration feedback"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingLeadRow}>
          <View style={styles.settingLeadLeft}>
            <View style={styles.roundIconWrap}>
              <AppIcon icon="moon" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLeadTitle}>Low-Light Alerts</Text>
              <Text style={styles.settingLeadSubtitle}>
                Warn when dim environments reduce detection confidence.
              </Text>
            </View>
          </View>

          <Switch
            value={settings.lowLightAlertsEnabled}
            onValueChange={onToggleLowLightAlerts}
            trackColor={{ false: "#55443f", true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Toggle low-light alerts"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.simpleSettingRow}>
          <View style={styles.inlineWithIcon}>
            <MaterialIcons name="translate" size={20} color={colors.primary} />
            <Text style={styles.simpleSettingTitle}>Real-time Translation</Text>
          </View>
          <Switch
            value={settings.translationEnabled}
            onValueChange={onToggleTranslation}
            trackColor={{ false: "#55443f", true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Toggle real-time translation"
          />
        </View>
      </View>

      <Text style={styles.groupLabel}>Privacy & Performance</Text>
      <View style={styles.systemActionList}>
        <View style={styles.systemActionCard}>
          <View style={styles.systemActionLeft}>
            <AppIcon icon="shield" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.systemActionTitle}>
                No Network Transmission
              </Text>
              <Text style={styles.systemActionSubtitle}>
                UI copy explicitly communicates local-only processing intent.
              </Text>
            </View>
          </View>
          <Text style={styles.systemActionValue}>Local</Text>
        </View>

        <View style={styles.systemActionCard}>
          <View style={styles.systemActionLeft}>
            <AppIcon icon="memory" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.systemActionTitle}>Memory Footprint</Text>
              <Text style={styles.systemActionSubtitle}>
                Placeholder budget card for model and runtime memory tracking.
              </Text>
            </View>
          </View>
          <Text style={styles.systemActionValue}>{"< 200MB"}</Text>
        </View>

        <View style={styles.systemActionCard}>
          <View style={styles.systemActionLeft}>
            <AppIcon icon="battery" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.systemActionTitle}>Battery Awareness</Text>
              <Text style={styles.systemActionSubtitle}>
                Placeholder state for frame skipping and sustained operation.
              </Text>
            </View>
          </View>
          <Text style={styles.systemActionValue}>Optimized</Text>
        </View>
      </View>

      <Text style={styles.groupLabel}>System</Text>
      <View style={styles.systemActionList}>
        {systemActions.map((action) => (
          <View key={action.id} style={styles.systemActionCard}>
            <View style={styles.systemActionLeft}>
              <AppIcon icon={action.icon} size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.systemActionTitle}>{action.label}</Text>
                <Text style={styles.systemActionSubtitle}>
                  {action.description}
                </Text>
              </View>
            </View>

            {action.kind === "toggle" ? (
              <Switch
                value={!!action.enabled}
                onValueChange={() => {}}
                trackColor={{ false: "#55443f", true: colors.primary }}
                thumbColor={colors.white}
                accessibilityLabel={`Toggle ${action.label}`}
              />
            ) : (
              <Text style={styles.systemActionValue}>
                {action.value ?? "Open"}
              </Text>
            )}
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset all settings"
        style={styles.resetButton}
      >
        <AppIcon icon="reset" size={18} color={colors.danger} />
        <Text style={styles.resetButtonText}>Reset All Settings</Text>
      </Pressable>

      <Text style={styles.versionText}>VisionEdge UI test shell · 2026</Text>
    </ScrollView>
  );
}

function OnboardingScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.onboardingContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.onboardingHeader}>
        <View style={styles.brandRow}>
          <AppIcon icon="vision" size={28} color={colors.primary} />
          <Text style={styles.brandText}>VisionEdge</Text>
        </View>
        <View style={styles.pulseDot} />
      </View>

      <View style={styles.eyeHeroWrap}>
        <View style={styles.eyeOuterGlow} />
        <View style={styles.eyeGridRing}>
          <View style={styles.eyeInnerRing}>
            <MaterialCommunityIcons
              name="blur-radial"
              size={80}
              color={colors.primary}
            />
          </View>
        </View>
      </View>

      <Text style={styles.onboardingTitle}>
        Empowering{"\n"}
        <Text style={styles.onboardingTitleAccent}>Your Vision</Text>
      </Text>
      <Text style={styles.onboardingSubtitle}>
        AI-powered visual assistance designed for accessible, low-latency local
        perception and narration.
      </Text>

      <View style={styles.featureList}>
        {onboardingFeatures.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <AppIcon icon={feature.icon} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.permissionPanel}>
        <Text style={styles.permissionPanelTitle}>Grant Camera Access</Text>
        <Text style={styles.permissionPanelText}>
          Camera permission is required for live scene understanding. This UI
          shell also previews denied, unavailable, and retry states.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Grant camera access"
        accessibilityHint="Continue to the home screen and initialize the demo"
        style={styles.primaryCta}
        onPress={onContinue}
      >
        <AppIcon icon="camera" size={20} color={colors.background} />
        <Text style={styles.primaryCtaText}>Grant Camera Access</Text>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={onSkip}>
        <Text style={styles.secondaryLink}>View Privacy Policy</Text>
      </Pressable>

      <View style={styles.paginationRow}>
        <View style={styles.paginationActive} />
        <View style={styles.paginationDot} />
        <View style={styles.paginationDot} />
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("onboarding");
  const [mode, setMode] = useState<AppMode>("idle");
  const [settings, setSettings] = useState<SettingsState>({
    speechRate: 1.0,
    verbosity: "balanced",
    audioRouting: "speaker",
    vibrationEnabled: true,
    lowLightAlertsEnabled: true,
    translationEnabled: false,
  });

  const activeTab = useMemo<TabKey>(() => {
    if (screen === "onboarding") {
      return "home";
    }

    return screen;
  }, [screen]);

  const handleRetry = () => {
    setMode("idle");
  };

  const handleToggleStartStop = () => {
    const isRunning =
      mode === "active" ||
      mode === "paused" ||
      mode === "muted" ||
      mode === "lowLight" ||
      mode === "noObjects" ||
      mode === "audioFailure";

    if (isRunning) {
      setMode("idle");
      return;
    }

    if (
      mode === "permissionDenied" ||
      mode === "cameraUnavailable" ||
      mode === "error"
    ) {
      setMode("idle");
      return;
    }

    setMode("active");
  };

  const handlePause = () => {
    if (mode === "active" || mode === "lowLight" || mode === "noObjects") {
      setMode("paused");
      return;
    }

    if (mode === "paused") {
      setMode("active");
    }
  };

  const handleMute = () => {
    if (mode === "muted") {
      setMode("active");
      return;
    }

    if (
      mode === "active" ||
      mode === "paused" ||
      mode === "lowLight" ||
      mode === "noObjects" ||
      mode === "audioFailure"
    ) {
      setMode("muted");
    }
  };

  const handleRepeat = () => {
    if (mode === "idle") {
      setMode("active");
    }
  };

  const cycleSpeechRate = () => {
    setSettings((current) => {
      const values = [0.8, 1.0, 1.5, 2.0];
      const index = values.indexOf(current.speechRate);
      return {
        ...current,
        speechRate: values[(index + 1) % values.length] ?? 1.0,
      };
    });
  };

  const cycleVerbosity = () => {
    setSettings((current) => {
      const values: SettingsState["verbosity"][] = [
        "minimal",
        "balanced",
        "detailed",
      ];
      const index = values.indexOf(current.verbosity);
      return {
        ...current,
        verbosity: values[(index + 1) % values.length] ?? "balanced",
      };
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {screen === "onboarding" ? (
          <OnboardingScreen
            onContinue={() => {
              setScreen("home");
              setMode("idle");
            }}
            onSkip={() => {
              setScreen("home");
              setMode("idle");
            }}
          />
        ) : screen === "home" ? (
          <HomeScreen
            mode={mode}
            settings={settings}
            onOpenSettings={() => setScreen("settings")}
            onToggleStartStop={handleToggleStartStop}
            onPause={handlePause}
            onRepeat={handleRepeat}
            onMute={handleMute}
            onRetry={handleRetry}
            onSelectMode={setMode}
          />
        ) : screen === "summary" ? (
          <SummaryScreen mode={mode} />
        ) : (
          <SettingsScreen
            settings={settings}
            onBack={() => setScreen("home")}
            onCycleSpeechRate={cycleSpeechRate}
            onCycleVerbosity={cycleVerbosity}
            onToggleAudioRouting={() =>
              setSettings((current) => ({
                ...current,
                audioRouting:
                  current.audioRouting === "speaker" ? "headphones" : "speaker",
              }))
            }
            onToggleVibration={() =>
              setSettings((current) => ({
                ...current,
                vibrationEnabled: !current.vibrationEnabled,
              }))
            }
            onToggleLowLightAlerts={() =>
              setSettings((current) => ({
                ...current,
                lowLightAlertsEnabled: !current.lowLightAlertsEnabled,
              }))
            }
            onToggleTranslation={() =>
              setSettings((current) => ({
                ...current,
                translationEnabled: !current.translationEnabled,
              }))
            }
          />
        )}

        {screen !== "onboarding" && (
          <View style={styles.bottomNavShell}>
            <View style={styles.bottomNav}>
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${tab.label}`}
                    style={styles.navItem}
                    onPress={() => setScreen(tab.key)}
                  >
                    <AppIcon
                      icon={tab.icon}
                      size={24}
                      color={active ? colors.primary : colors.textSoft}
                    />
                    <Text
                      style={[
                        styles.navLabel,
                        { color: active ? colors.primary : colors.textSoft },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 16,
  },
  onboardingContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    minHeight: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  latencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  latencyText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  heroCard: {
    minHeight: 268,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "space-between",
  },
  heroGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.16,
    backgroundColor: "transparent",
  },
  heroTopRow: {
    marginTop: 16,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  liveBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#d92d20",
  },
  standbyBadge: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  liveText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  primaryAssistButton: {
    minHeight: 72,
    minWidth: 148,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stopAssistButton: {
    backgroundColor: colors.danger,
  },
  primaryAssistButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  stopAssistButtonText: {
    color: colors.white,
  },
  heroBody: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroCaption: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 10,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  refreshFab: {
    position: "absolute",
    right: 16,
    bottom: 18,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  narrationCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  narrationWatermark: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  narrationText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "500",
  },
  errorStateCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.30)",
    backgroundColor: "rgba(251,113,133,0.08)",
    padding: 20,
    alignItems: "center",
  },
  errorStateIcon: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(251,113,133,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorStateTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  errorStateMessage: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  errorRetryButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorRetryText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minHeight: 96,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionPrimary: {
    backgroundColor: colors.primary,
  },
  quickActionSecondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionHeader: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    flex: 1,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  objectCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  objectMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  objectIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  objectTextWrap: {
    flex: 1,
  },
  objectTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 3,
  },
  objectSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  objectMeta: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  objectDistance: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  objectMetaLabel: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  alertCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  alertHeader: {
    flexDirection: "row",
    gap: 12,
  },
  alertIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  alertTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  alertMessage: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  modeStrip: {
    gap: 10,
    paddingRight: 8,
  },
  modeChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
  },
  modeChipInactive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  accessibilityCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  accessibilityRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  accessibilityIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  accessibilityTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  accessibilitySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryBrand: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  summarySubBrand: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1,
  },
  summaryActions: {
    flexDirection: "row",
    gap: 10,
  },
  smallCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  smallCirclePrimary: {
    backgroundColor: colors.primary,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    overflow: "hidden",
  },
  metricIconGhost: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  metricLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  metricValueRow: {
    gap: 2,
  },
  metricValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  metricDelta: {
    fontSize: 11,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  debugPreviewCard: {
    height: 230,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
  },
  debugHudTop: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rawCapturePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rawCaptureText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  coordsText: {
    color: colors.primaryStrong,
    fontSize: 10,
    textAlign: "right",
  },
  crosshairWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairOuter: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,138,112,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  debugFooterStrip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  debugFooterText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  systemStateCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  systemStateTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  systemStateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,138,112,0.08)",
    gap: 12,
  },
  systemStateLabel: {
    color: colors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  systemStateValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  coverageList: {
    gap: 12,
  },
  coverageItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
  },
  coverageItemText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  settingsTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsBrand: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  settingsHeading: {
    marginTop: 4,
    marginBottom: 4,
  },
  settingsTitle: {
    color: colors.primary,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
  },
  settingsSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
    lineHeight: 22,
  },
  groupLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 6,
  },
  settingsCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 18,
  },
  settingLeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  settingLeadLeft: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    flex: 1,
  },
  roundIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLeadTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  settingLeadSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  sliderBlock: {
    gap: 12,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sliderLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  sliderValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  fakeSliderTrack: {
    width: 100,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    overflow: "visible",
    justifyContent: "center",
  },
  fakeSliderFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  fakeSliderThumb: {
    position: "absolute",
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    top: -7,
  },
  settingRowColumn: {
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,138,112,0.08)",
  },
  simpleSettingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inlineWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  simpleSettingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  simpleSettingValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  systemActionList: {
    gap: 12,
  },
  systemActionCard: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  systemActionLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
    alignItems: "center",
  },
  systemActionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  systemActionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  systemActionValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  resetButton: {
    height: 54,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(251,113,133,0.26)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  resetButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "800",
  },
  versionText: {
    color: colors.textSoft,
    textAlign: "center",
    fontSize: 12,
    marginTop: -4,
  },
  onboardingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  eyeHeroWrap: {
    height: 290,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  eyeOuterGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(255,138,112,0.08)",
  },
  eyeGridRing: {
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeInnerRing: {
    width: 128,
    height: 128,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingTitle: {
    color: colors.text,
    textAlign: "center",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "800",
  },
  onboardingTitleAccent: {
    color: colors.primary,
    fontStyle: "italic",
  },
  onboardingSubtitle: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 28,
  },
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  permissionPanel: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  permissionPanelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  permissionPanelText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryCta: {
    minHeight: 72,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  primaryCtaText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "800",
  },
  secondaryLink: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 24,
  },
  paginationRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: "auto",
  },
  paginationActive: {
    width: 32,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  paginationDot: {
    width: 8,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  bottomNavShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  bottomNav: {
    height: 78,
    borderRadius: 28,
    backgroundColor: "rgba(18,9,7,0.96)",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 72,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
