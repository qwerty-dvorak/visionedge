import React from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { colors, radius, shadows, spacing, typography } from "../constants/theme";
import { IconKey } from "../constants/theme";
import { AppIcon } from "./AppIcon";

type Tone = "primary" | "secondary" | "danger" | "success" | "warning" | "neutral";

const toneMap: Record<Tone, { bg: string; border: string; fg: string }> = {
  primary: {
    bg: colors.primary,
    border: colors.primary,
    fg: colors.background,
  },
  secondary: {
    bg: colors.surfaceSoft,
    border: colors.border,
    fg: colors.text,
  },
  danger: {
    bg: colors.danger,
    border: colors.danger,
    fg: colors.white,
  },
  success: {
    bg: colors.success,
    border: colors.success,
    fg: colors.background,
  },
  warning: {
    bg: colors.warningSoft,
    border: colors.warning,
    fg: colors.warning,
  },
  neutral: {
    bg: colors.surface,
    border: colors.border,
    fg: colors.text,
  },
};

type PrimaryButtonProps = {
  label: string;
  icon?: IconKey;
  tone?: Tone;
  disabled?: boolean;
  accessibilityHint?: string;
  onPress?: () => void;
};

export function PrimaryButton({
  label,
  icon,
  tone = "primary",
  disabled = false,
  accessibilityHint,
  onPress,
}: PrimaryButtonProps) {
  const palette = toneMap[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.86 : 1,
        },
      ]}
    >
      {icon ? <AppIcon name={icon} size={18} color={palette.fg} /> : null}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function ScreenCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ icon, label }: { icon: IconKey; label: string }) {
  return (
    <View style={styles.pill}>
      <AppIcon name={icon} size={14} color={colors.primary} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

export function Banner({
  tone,
  icon,
  title,
  message,
}: {
  tone: Tone;
  icon: IconKey;
  title: string;
  message: string;
}) {
  const palette = toneMap[tone];
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={styles.bannerIcon}>
        <AppIcon name={icon} size={18} color={palette.fg} />
      </View>
      <View style={styles.bannerCopy}>
        <Text style={[styles.bannerTitle, { color: palette.fg }]}>{title}</Text>
        <Text
          style={[
            styles.bannerMessage,
            { color: tone === "primary" || tone === "danger" || tone === "success" ? palette.fg : colors.textMuted },
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

export function SettingToggleRow({
  label,
  description,
  value,
  disabled,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.bannerCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceSoft, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function MetricCard({
  icon,
  label,
  value,
}: {
  icon: IconKey;
  label: string;
  value: string;
}) {
  return (
    <ScreenCard>
      <View style={styles.metricHeader}>
        <AppIcon name={icon} size={16} color={colors.primary} />
        <Text style={styles.toggleDescription}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </ScreenCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  button: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    ...typography.bodyStrong,
    textAlign: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...typography.caption,
    color: colors.text,
  },
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  bannerCopy: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    ...typography.bodyStrong,
  },
  bannerMessage: {
    ...typography.caption,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toggleLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  toggleDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metricValue: {
    ...typography.title2,
    color: colors.text,
  },
});
