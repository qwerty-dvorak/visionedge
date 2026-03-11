import { IconKey } from "../constants/theme";
import {
  ActiveSettingChip,
  AppTab,
  Milestone2MockData,
  OnboardingFeature,
  SettingCardAction,
  SummaryMetric,
} from "../types/app";

export const tabs: Array<{
  key: AppTab;
  label: string;
  icon: IconKey;
}> = [
  { key: "home", label: "Vision", icon: "vision" },
  { key: "summary", label: "Debug", icon: "dashboard" },
  { key: "settings", label: "Settings", icon: "settings" },
];

const onboardingFeatures: OnboardingFeature[] = [
  {
    id: "identify-objects",
    title: "Identify Objects",
    description:
      "Recognize everyday items instantly with clear spoken summaries.",
    icon: "camera",
  },
  {
    id: "read-text",
    title: "Read Text",
    description: "Preview OCR-focused guidance and text-to-speech UI states.",
    icon: "textScan",
  },
  {
    id: "detect-color",
    title: "Color Detection",
    description:
      "Use color-aware assistance for clothing, labels, and surroundings.",
    icon: "palette",
  },
];

const summaryMetrics: SummaryMetric[] = [
  {
    id: "fps",
    label: "FPS",
    value: "120",
    delta: "+2.4%",
    trend: "up",
    icon: "fps",
    progress: 0.82,
  },
  {
    id: "latency",
    label: "Latency",
    value: "8.2ms",
    delta: "-0.5",
    trend: "down",
    icon: "latency",
    progress: 0.34,
  },
  {
    id: "queue",
    label: "Queue",
    value: "2",
    delta: "Stable",
    trend: "stable",
    icon: "queue",
    progress: 0.16,
  },
];

const activeSettings: ActiveSettingChip[] = [
  { id: "wireframe", label: "Wireframe", icon: "vision", enabled: true },
  { id: "occlusion", label: "Occlusion", icon: "explore", enabled: false },
  { id: "gizmos", label: "Gizmos", icon: "detectedObjects", enabled: true },
  { id: "lighting", label: "PBR Light", icon: "live", enabled: false },
];

const systemActions: SettingCardAction[] = [
  {
    id: "paired-devices",
    label: "Paired Devices",
    description: "Manage connected wearables and audio accessories.",
    icon: "devices",
    value: "2 connected",
    type: "navigation",
  },
  {
    id: "privacy-security",
    label: "Privacy & Security",
    description: "Review local processing expectations and access permissions.",
    icon: "security",
    type: "navigation",
  },
  {
    id: "translation",
    label: "Real-time Translation",
    description: "Placeholder toggle for future language assistance.",
    icon: "translation",
    type: "toggle",
    enabled: false,
  },
  {
    id: "reset-settings",
    label: "Reset Settings",
    description: "Restore all milestone 2 demo values to defaults.",
    icon: "reset",
    type: "info",
  },
];

export const milestone2MockData: Milestone2MockData = {
  appName: "VisionEdge",
  heroTitle: "Empowering your vision",
  heroSubtitle: "AI-powered visual assistance designed for independence.",
  currentScreen: "onboarding",
  statusBanner: {
    id: "latency-live",
    tone: "warning",
    icon: "warning",
    title: "Low confidence warning",
    message:
      "Dim lighting is reducing precision. Move slowly and rely on nearby object cues.",
  },
  quickActions: [
    {
      id: "pause",
      label: "Pause",
      icon: "pause",
      active: false,
    },
    {
      id: "repeat",
      label: "Repeat",
      icon: "repeat",
      emphasized: true,
    },
    {
      id: "mute",
      label: "Mute",
      icon: "mute",
      active: false,
    },
  ],
  onboardingFeatures,
  permissionCard: {
    title: "Grant camera access",
    description:
      "Camera permission will be required for live scene understanding. In milestone 2 this remains a polished placeholder flow.",
    privacyNote:
      "Your data stays on device and the current experience uses only mock UI states.",
    status: "pending",
    ctaLabel: "Grant Camera Access",
  },
  scene: {
    id: "living-room",
    title: "Living Room Interior",
    summary:
      "A wooden dining table with a ceramic vase and four chairs in a brightly lit room. A laptop is open on the far end.",
    latencyMs: 12,
    visibleCount: 3,
    lowLight: false,
    lowConfidence: false,
    motionLevel: "low",
    confidenceLabel: "High confidence",
    narrationStatus: "narrating",
    updatedAtLabel: "Updated 2s ago",
    objects: [
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
    ],
  },
  summary: {
    lastSpokenPhrase:
      "A desk ahead contains a keyboard, notebook, coffee mug, and charging cable with moderate overlap between items.",
    sceneHash: "0x7F2A9B1C",
    engineStatus: "Active (Production)",
    vramUsageLabel: "428MB / 2.0GB",
    shaderCountLabel: "1,244",
    frameBufferLabel:
      "Frame Buffer: 0x82...A1 | UV Map: Enabled | Vertex Count: 1.2M",
    coordinates: {
      x: "192.44",
      y: "842.01",
      z: "-12.33",
    },
    metrics: summaryMetrics,
    activeSettings,
  },
  settings: {
    speechRate: 0.95,
    voice: "Aria (Natural)",
    verbosity: "balanced",
    confidenceThreshold: 0.72,
    vibrationEnabled: true,
    lowLightAlertsEnabled: true,
    translationEnabled: false,
    audioOutputMode: "speaker",
    offlineModeLabel: "Offline-first mode enabled",
    privacySummary:
      "All milestone 2 interactions are local UI placeholders with privacy-first copy.",
    modelInfoLabel: "Model runtime placeholder · Milestone 2 shell",
  },
  systemActions,
};

export const homeScenarios = [
  milestone2MockData.scene,
  {
    ...milestone2MockData.scene,
    id: "street-crossing",
    title: "Street Crossing",
    summary:
      "A pedestrian crossing is ahead with a bicycle to the left and a person approaching from the right curb.",
    latencyMs: 18,
    visibleCount: 4,
    lowLight: false,
    lowConfidence: false,
    motionLevel: "high" as const,
    confidenceLabel: "Dynamic scene",
    updatedAtLabel: "Updated 5s ago",
    objects: [
      {
        id: "crosswalk",
        label: "Crosswalk",
        icon: "explore",
        confidence: 0.9,
        distanceMeters: 2.4,
        position: "Ahead",
        priority: "high" as const,
      },
      {
        id: "person",
        label: "Person",
        icon: "profile",
        confidence: 0.81,
        distanceMeters: 1.7,
        position: "Right curb",
        priority: "high" as const,
      },
      {
        id: "bicycle",
        label: "Bicycle",
        icon: "saved",
        confidence: 0.76,
        distanceMeters: 1.9,
        position: "Left curb",
        priority: "medium" as const,
      },
      {
        id: "signal",
        label: "Signal",
        icon: "warning",
        confidence: 0.71,
        distanceMeters: 6.1,
        position: "Forward left",
        priority: "low" as const,
      },
    ],
  },
  {
    ...milestone2MockData.scene,
    id: "low-light-room",
    title: "Low-Light Room",
    summary:
      "The room is dim with a sofa against the wall and a side table near your left hand. Detection confidence is reduced.",
    latencyMs: 21,
    visibleCount: 2,
    lowLight: true,
    lowConfidence: true,
    motionLevel: "moderate" as const,
    confidenceLabel: "Low light detected",
    updatedAtLabel: "Updated 7s ago",
    objects: [
      {
        id: "sofa",
        label: "Sofa",
        icon: "saved",
        confidence: 0.67,
        distanceMeters: 2.0,
        position: "Against back wall",
        priority: "medium" as const,
      },
      {
        id: "side-table",
        label: "Side Table",
        icon: "table",
        confidence: 0.61,
        distanceMeters: 0.7,
        position: "Left side",
        priority: "high" as const,
      },
    ],
  },
];

export const alertCards = [
  {
    id: "camera-unavailable",
    tone: "danger" as const,
    icon: "error" as const,
    title: "Camera unavailable",
    message:
      "VisionEdge cannot access the camera feed. Check permissions or try again later.",
  },
  {
    id: "permissions-denied",
    tone: "warning" as const,
    icon: "warning" as const,
    title: "Permissions denied",
    message:
      "Camera permission is required before live scene understanding can begin.",
  },
  {
    id: "processing-paused",
    tone: "neutral" as const,
    icon: "pause" as const,
    title: "Processing paused",
    message:
      "Narration and scene updates are paused until you resume the session.",
  },
];

export const emptyState = {
  id: "empty-room",
  icon: "empty" as const,
  title: "No notable objects detected",
  message:
    "The current room appears open and quiet. VisionEdge is still listening for scene changes.",
};

export const loadingState = {
  id: "loading",
  icon: "narration" as const,
  title: "Preparing live narration",
  message:
    "Building your demo session with mock camera, narration, and detection placeholders.",
};
