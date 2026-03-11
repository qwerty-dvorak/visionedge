export type AppTab = 'home' | 'summary' | 'settings';

export type AppScreen = 'onboarding' | AppTab;

export type BannerTone = 'neutral' | 'success' | 'warning' | 'danger';

export type NarrationStatus = 'idle' | 'narrating' | 'paused' | 'muted';

export type PermissionStatus = 'granted' | 'pending' | 'denied';

export type VerbosityLevel = 'concise' | 'balanced' | 'detailed';

export type AudioOutputMode = 'speaker' | 'earpiece' | 'bluetooth';

export interface DetectedObject {
  id: string;
  label: string;
  icon: string;
  confidence: number;
  distanceMeters: number;
  position: string;
  priority: 'high' | 'medium' | 'low';
  quantity?: number;
}

export interface SceneSnapshot {
  id: string;
  title: string;
  summary: string;
  latencyMs: number;
  visibleCount: number;
  lowLight: boolean;
  lowConfidence: boolean;
  motionLevel: 'low' | 'moderate' | 'high';
  confidenceLabel: string;
  narrationStatus: NarrationStatus;
  updatedAtLabel: string;
  objects: DetectedObject[];
}

export interface StatusBannerData {
  id: string;
  tone: BannerTone;
  icon: string;
  title: string;
  message: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  emphasized?: boolean;
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  progress: number;
}

export interface ActiveSettingChip {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export interface SessionSummary {
  lastSpokenPhrase: string;
  sceneHash: string;
  engineStatus: string;
  vramUsageLabel: string;
  shaderCountLabel: string;
  frameBufferLabel: string;
  coordinates: {
    x: string;
    y: string;
    z: string;
  };
  metrics: SummaryMetric[];
  activeSettings: ActiveSettingChip[];
}

export interface SettingsState {
  speechRate: number;
  voice: string;
  verbosity: VerbosityLevel;
  confidenceThreshold: number;
  vibrationEnabled: boolean;
  lowLightAlertsEnabled: boolean;
  translationEnabled: boolean;
  audioOutputMode: AudioOutputMode;
  offlineModeLabel: string;
  privacySummary: string;
  modelInfoLabel: string;
}

export interface SettingCardAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  value?: string;
  type: 'navigation' | 'toggle' | 'info';
  enabled?: boolean;
}

export interface OnboardingFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PermissionCardData {
  title: string;
  description: string;
  privacyNote: string;
  status: PermissionStatus;
  ctaLabel: string;
}

export interface Milestone2MockData {
  appName: string;
  heroTitle: string;
  heroSubtitle: string;
  currentScreen: AppScreen;
  statusBanner: StatusBannerData;
  quickActions: QuickAction[];
  onboardingFeatures: OnboardingFeature[];
  permissionCard: PermissionCardData;
  scene: SceneSnapshot;
  summary: SessionSummary;
  settings: SettingsState;
  systemActions: SettingCardAction[];
}
