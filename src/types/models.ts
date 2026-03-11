export type ScreenKey = 'onboarding' | 'home' | 'vision' | 'summary' | 'settings';

export type BottomTabKey = 'home' | 'vision' | 'summary' | 'settings';

export type BannerTone = 'neutral' | 'success' | 'warning' | 'error';

export type ActionTone = 'primary' | 'secondary' | 'ghost' | 'danger';

export type VerbosityLabel = 'Concise' | 'Balanced' | 'Detailed';

export type AudioOutputLabel = 'Speaker' | 'Earpiece' | 'Bluetooth';

export interface StatusBannerModel {
  id: string;
  tone: BannerTone;
  icon: string;
  title: string;
  message: string;
  pillLabel?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  tone: ActionTone;
  accessibilityHint: string;
}

export interface DetectionItemModel {
  id: string;
  label: string;
  icon: string;
  positionLabel: string;
  distanceLabel: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export interface HomeScenario {
  id: string;
  title: string;
  subtitle: string;
  narration: string;
  environment: string;
  latencyMs: number;
  visibleCount: number;
  lowLight: boolean;
  confidenceLabel: string;
  confidenceValue: number;
  sceneNote: string;
  detections: DetectionItemModel[];
}

export interface AlertState {
  id: string;
  title: string;
  description: string;
  tone: BannerTone;
  icon: string;
  actionLabel: string;
}

export interface EmptyStateModel {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionLabel?: string;
}

export interface OnboardingStep {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  highlights?: string[];
}

export interface SettingRowBase {
  id: string;
  label: string;
  description: string;
  icon: string;
  valueLabel?: string;
}

export interface SliderSettingRow extends SettingRowBase {
  type: 'slider';
  value: number;
}

export interface ToggleSettingRow extends SettingRowBase {
  type: 'toggle';
  enabled: boolean;
}

export interface LinkSettingRow extends SettingRowBase {
  type: 'link';
}

export interface ChipGroupSettingRow extends SettingRowBase {
  type: 'chip-group';
  options: string[];
}

export interface DangerSettingRow extends SettingRowBase {
  type: 'danger';
}

export type SettingRow =
  | SliderSettingRow
  | ToggleSettingRow
  | LinkSettingRow
  | ChipGroupSettingRow
  | DangerSettingRow;

export interface SettingsSection {
  id: string;
  title: string;
  rows: SettingRow[];
}

export interface AppSettings {
  speechRate: number;
  voice: string;
  verbosity: VerbosityLabel;
  confidenceThreshold: number;
  vibrationEnabled: boolean;
  lowLightAlertsEnabled: boolean;
  audioOutputMode: AudioOutputLabel;
  offlineModeEnabled: boolean;
  repeatAfterNarration: boolean;
  announceConfidence: boolean;
}

export interface DebugMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: BannerTone;
  icon: string;
  progress: number;
}

export interface SessionStat {
  label: string;
  value: string;
}

export interface SessionSummary {
  id: string;
  engineVersion: string;
  sceneHash: string;
  lastSpokenPhrase: string;
  activeSettings: string[];
  deviceCapabilityPlaceholders: string[];
  stats: SessionStat[];
}
