import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export const colors = {
  background: "#120907",
  surface: "#1e1311",
  surfaceSoft: "#2d1d1a",
  primary: "#ff8a70",
  primarySoft: "rgba(255, 138, 112, 0.1)",
  border: "rgba(255, 138, 112, 0.18)",
  text: "#f7f2ef",
  textMuted: "#b9a39d",
  textSoft: "#907974",
  white: "#ffffff",
  success: "#a3e635",
  warning: "#fbbf24",
  warningSoft: "rgba(251, 191, 36, 0.14)",
  danger: "#fb7185",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  title1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
  },
  title2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
  },
  title3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
} as const;

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  floating: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

type IconDefinition =
  | {
      family: "Ionicons";
      name: IoniconName;
    }
  | {
      family: "MaterialIcons";
      name: MaterialIconName;
    }
  | {
      family: "MaterialCommunityIcons";
      name: MaterialCommunityIconName;
    };

export const iconMap = {
  vision: { family: "Ionicons", name: "eye-outline" },
  dashboard: { family: "MaterialCommunityIcons", name: "monitor-dashboard" },
  settings: { family: "Ionicons", name: "settings-outline" },
  camera: { family: "Ionicons", name: "camera-outline" },
  pause: { family: "Ionicons", name: "pause-circle" },
  repeat: { family: "Ionicons", name: "volume-high" },
  mute: { family: "Ionicons", name: "volume-mute" },
  speaker: { family: "Ionicons", name: "volume-medium-outline" },
  warning: { family: "Ionicons", name: "warning-outline" },
  error: { family: "Ionicons", name: "alert-circle-outline" },
  latency: { family: "MaterialCommunityIcons", name: "speedometer" },
  narration: { family: "MaterialCommunityIcons", name: "waveform" },
  table: { family: "MaterialCommunityIcons", name: "table-furniture" },
  chair: { family: "MaterialCommunityIcons", name: "chair-rolling" },
  laptop: { family: "MaterialCommunityIcons", name: "laptop" },
  couch: { family: "MaterialCommunityIcons", name: "sofa" },
  person: { family: "Ionicons", name: "person-outline" },
  car: { family: "Ionicons", name: "car-sport-outline" },
  phone: { family: "Ionicons", name: "phone-portrait-outline" },
  cup: { family: "Ionicons", name: "cafe-outline" },
  bottle: { family: "MaterialCommunityIcons", name: "bottle-soda-outline" },
  book: { family: "Ionicons", name: "book-outline" },
  tv: { family: "Ionicons", name: "tv-outline" },
  bag: { family: "MaterialCommunityIcons", name: "bag-personal-outline" },
  pet: { family: "MaterialCommunityIcons", name: "dog-side" },
  devices: { family: "Ionicons", name: "hardware-chip-outline" },
  security: { family: "Ionicons", name: "shield-checkmark-outline" },
  reset: { family: "MaterialCommunityIcons", name: "restart" },
  fps: { family: "MaterialCommunityIcons", name: "motion-play" },
  queue: { family: "MaterialCommunityIcons", name: "playlist-play" },
  live: { family: "Ionicons", name: "radio" },
  play: { family: "Ionicons", name: "play" },
  stop: { family: "Ionicons", name: "stop-circle" },
  retry: { family: "Ionicons", name: "refresh-circle-outline" },
  shield: { family: "Ionicons", name: "lock-closed-outline" },
  accessibility: { family: "MaterialIcons", name: "accessibility-new" },
  home: { family: "Ionicons", name: "home-outline" },
  hardware: { family: "MaterialCommunityIcons", name: "memory" },
  back: { family: "Ionicons", name: "arrow-back" },
} as const satisfies Record<string, IconDefinition>;

export type IconKey = keyof typeof iconMap;
