import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export const colors = {
  background: '#120907',
  backgroundAlt: '#1a0f0d',
  surface: '#1e1311',
  surfaceMuted: '#2a1d1a',
  surfaceSoft: '#33231f',
  primary: '#ff8a70',
  primaryMuted: 'rgba(255, 138, 112, 0.16)',
  primarySoft: 'rgba(255, 138, 112, 0.08)',
  primaryBorder: 'rgba(255, 138, 112, 0.22)',
  text: '#f7f2ef',
  textMuted: '#b8a6a0',
  textSoft: '#8d7972',
  white: '#ffffff',
  black: '#000000',
  success: '#a3e635',
  warning: '#fbbf24',
  danger: '#fb7185',
  info: '#60a5fa',
  overlay: 'rgba(0, 0, 0, 0.45)',
  cardOverlay: 'rgba(255, 138, 112, 0.05)',
  divider: 'rgba(255, 138, 112, 0.10)',
  shadow: 'rgba(0, 0, 0, 0.35)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  floating: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
} as const;

export const gradients = {
  hero: ['#1a0f0d', '#120907'] as const,
  primary: ['#ff9b84', '#ff8a70'] as const,
  card: ['rgba(255, 138, 112, 0.12)', 'rgba(255, 138, 112, 0.03)'] as const,
  narration: ['rgba(255, 138, 112, 0.18)', 'rgba(255, 138, 112, 0.05)'] as const,
} as const;

export const appTheme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  gradients,
} as const;

export type AppTheme = typeof appTheme;

type IconDefinition =
  | {
      family: 'Ionicons';
      name: IoniconName;
    }
  | {
      family: 'MaterialIcons';
      name: MaterialIconName;
    }
  | {
      family: 'MaterialCommunityIcons';
      name: MaterialCommunityIconName;
    };

export const iconMap = {
  latency: { family: 'MaterialCommunityIcons', name: 'speedometer' },
  settings: { family: 'Ionicons', name: 'settings-outline' },
  profile: { family: 'Ionicons', name: 'person-circle-outline' },
  refresh: { family: 'Ionicons', name: 'refresh' },
  live: { family: 'Ionicons', name: 'radio' },
  narration: { family: 'MaterialCommunityIcons', name: 'waveform' },
  pause: { family: 'Ionicons', name: 'pause-circle' },
  repeat: { family: 'Ionicons', name: 'volume-high' },
  mute: { family: 'Ionicons', name: 'volume-mute' },
  detectedObjects: { family: 'MaterialIcons', name: 'view-in-ar' },
  table: { family: 'MaterialCommunityIcons', name: 'table-furniture' },
  chair: { family: 'MaterialCommunityIcons', name: 'chair-rolling' },
  laptop: { family: 'MaterialCommunityIcons', name: 'laptop' },
  home: { family: 'Ionicons', name: 'home-outline' },
  vision: { family: 'Ionicons', name: 'eye-outline' },
  history: { family: 'Ionicons', name: 'time-outline' },
  explore: { family: 'Ionicons', name: 'compass-outline' },
  saved: { family: 'Ionicons', name: 'bookmark-outline' },
  stats: { family: 'Ionicons', name: 'analytics-outline' },
  dashboard: { family: 'MaterialCommunityIcons', name: 'monitor-dashboard' },
  hardware: { family: 'MaterialCommunityIcons', name: 'memory' },
  logs: { family: 'MaterialCommunityIcons', name: 'format-list-bulleted' },
  config: { family: 'Ionicons', name: 'options-outline' },
  add: { family: 'Ionicons', name: 'add' },
  back: { family: 'Ionicons', name: 'arrow-back' },
  search: { family: 'Ionicons', name: 'search' },
  proximity: { family: 'Ionicons', name: 'eye-outline' },
  voice: { family: 'MaterialCommunityIcons', name: 'account-voice' },
  translation: { family: 'MaterialIcons', name: 'translate' },
  devices: { family: 'Ionicons', name: 'hardware-chip-outline' },
  security: { family: 'Ionicons', name: 'shield-checkmark-outline' },
  reset: { family: 'MaterialCommunityIcons', name: 'restart' },
  camera: { family: 'Ionicons', name: 'camera-outline' },
  textScan: { family: 'MaterialCommunityIcons', name: 'text-recognition' },
  palette: { family: 'Ionicons', name: 'color-palette-outline' },
  debug: { family: 'Ionicons', name: 'bug-outline' },
  terminal: { family: 'MaterialCommunityIcons', name: 'console' },
  fps: { family: 'MaterialCommunityIcons', name: 'motion-play' },
  queue: { family: 'MaterialCommunityIcons', name: 'playlist-play' },
  system: { family: 'MaterialCommunityIcons', name: 'tune-variant' },
  privacy: { family: 'Ionicons', name: 'lock-closed-outline' },
  warning: { family: 'Ionicons', name: 'warning-outline' },
  error: { family: 'Ionicons', name: 'alert-circle-outline' },
  empty: { family: 'Ionicons', name: 'sparkles-outline' },
  mic: { family: 'Ionicons', name: 'mic' },
} as const satisfies Record<string, IconDefinition>;

export type IconKey = keyof typeof iconMap;
