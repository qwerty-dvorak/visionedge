import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';

import { colors, gradients, iconMap, radius, shadows, spacing, typography } from '../constants/theme';

type IconFamily = 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons';
type IconName =
  | React.ComponentProps<typeof Ionicons>['name']
  | React.ComponentProps<typeof MaterialIcons>['name']
  | React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type UiTone = 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'danger' | 'neutral';

export interface IconSymbolProps {
  name: keyof typeof iconMap | string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
}

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof iconMap | string;
  tone?: UiTone;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface IconButtonProps {
  icon: keyof typeof iconMap | string;
  onPress?: () => void;
  tone?: UiTone;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface BadgeProps {
  label: string;
  tone?: UiTone;
  icon?: keyof typeof iconMap | string;
  style?: StyleProp<ViewStyle>;
}

export interface StatusCardProps {
  title: string;
  message: string;
  tone?: UiTone;
  icon?: keyof typeof iconMap | string;
  badgeLabel?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof iconMap | string;
  actionLabel?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export interface LoadingStateProps {
  title: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export interface ToggleRowProps {
  icon?: keyof typeof iconMap | string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface MetricPillProps {
  icon?: keyof typeof iconMap | string;
  label: string;
  tone?: UiTone;
  style?: StyleProp<ViewStyle>;
}

const toneStyles: Record<
  UiTone,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    softBackgroundColor: string;
  }
> = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    textColor: colors.background,
    softBackgroundColor: colors.primaryMuted,
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primaryBorder,
    textColor: colors.text,
    softBackgroundColor: colors.primarySoft,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.primaryBorder,
    textColor: colors.primary,
    softBackgroundColor: colors.primarySoft,
  },
  success: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    textColor: colors.background,
    softBackgroundColor: 'rgba(163, 230, 53, 0.15)',
  },
  warning: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
    textColor: colors.background,
    softBackgroundColor: 'rgba(251, 191, 36, 0.16)',
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    textColor: colors.white,
    softBackgroundColor: 'rgba(251, 113, 133, 0.16)',
  },
  neutral: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
    textColor: colors.text,
    softBackgroundColor: colors.surfaceMuted,
  },
};

function resolveRawIcon(name: string): { family: IconFamily; name: IconName } {
  if (name in iconMap) {
    const mapped = iconMap[name as keyof typeof iconMap];
    return { family: mapped.family, name: mapped.name as IconName };
  }

  return {
    family: 'MaterialIcons',
    name: name as React.ComponentProps<typeof MaterialIcons>['name'],
  };
}

export function IconSymbol({
  name,
  size = 20,
  color = colors.text,
  style,
}: IconSymbolProps) {
  const resolved = resolveRawIcon(name);

  if (resolved.family === 'Ionicons') {
    return <Ionicons name={resolved.name as React.ComponentProps<typeof Ionicons>['name']} size={size} color={color} style={style} />;
  }

  if (resolved.family === 'MaterialCommunityIcons') {
    return (
      <MaterialCommunityIcons
        name={resolved.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return <MaterialIcons name={resolved.name as React.ComponentProps<typeof MaterialIcons>['name']} size={size} color={color} style={style} />;
}

export function AppCard({ children, style, padded = true }: AppCardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.cardPadded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  onPressAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed]}
        >
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  tone = 'primary',
  disabled,
  loading,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const toneStyle = toneStyles[tone];
  const isPrimaryLike = tone === 'primary';

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={isPrimaryLike ? colors.background : toneStyle.textColor} />
      ) : icon ? (
        <IconSymbol
          name={icon}
          size={20}
          color={isPrimaryLike ? colors.background : toneStyle.textColor}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          { color: isPrimaryLike ? colors.background : toneStyle.textColor },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonBase,
        !isPrimaryLike && {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
          borderWidth: 1,
        },
        disabled && styles.buttonDisabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isPrimaryLike ? (
        <LinearGradient colors={[...gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
          {content}
        </LinearGradient>
      ) : (
        <View style={styles.buttonFlat}>{content}</View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  tone = 'secondary',
  size = 44,
  disabled,
  style,
}: IconButtonProps) {
  const toneStyle = toneStyles[tone];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderColor: toneStyle.borderColor,
          backgroundColor: toneStyle.softBackgroundColor,
        },
        disabled && styles.buttonDisabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <IconSymbol name={icon} size={22} color={toneStyle.textColor} />
    </Pressable>
  );
}

export function Badge({ label, tone = 'secondary', icon, style }: BadgeProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: toneStyle.softBackgroundColor,
          borderColor: toneStyle.borderColor,
        },
        style,
      ]}
    >
      {icon ? <IconSymbol name={icon} size={14} color={toneStyle.textColor} /> : null}
      <Text style={[styles.badgeText, { color: toneStyle.textColor }]}>{label}</Text>
    </View>
  );
}

export function StatusCard({
  title,
  message,
  tone = 'neutral',
  icon = 'warning',
  badgeLabel,
  actionLabel,
  onPressAction,
  style,
}: StatusCardProps) {
  const toneStyle = toneStyles[tone];

  return (
    <AppCard style={[style, { borderColor: toneStyle.borderColor, backgroundColor: toneStyle.softBackgroundColor }]}>
      <View style={styles.statusHeader}>
        <View style={styles.statusTitleWrap}>
          <View style={[styles.statusIconWrap, { backgroundColor: toneStyle.backgroundColor }]}>
            <IconSymbol name={icon} size={18} color={toneStyle.textColor} />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>{title}</Text>
            <Text style={styles.statusMessage}>{message}</Text>
          </View>
        </View>
        {badgeLabel ? <Badge label={badgeLabel} tone={tone} /> : null}
      </View>

      {actionLabel ? (
        <PrimaryButton label={actionLabel} tone="ghost" onPress={onPressAction} style={styles.statusAction} />
      ) : null}
    </AppCard>
  );
}

export function EmptyState({
  title,
  message,
  icon = 'empty',
  actionLabel,
  onPressAction,
  style,
}: EmptyStateProps) {
  return (
    <AppCard style={[styles.centeredState, style]}>
      <View style={styles.stateIconShell}>
        <IconSymbol name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {actionLabel ? (
        <PrimaryButton label={actionLabel} tone="secondary" onPress={onPressAction} style={styles.stateButton} />
      ) : null}
    </AppCard>
  );
}

export function LoadingState({ title, message, style }: LoadingStateProps) {
  return (
    <AppCard style={[styles.centeredState, style]}>
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {message ? <Text style={styles.stateMessage}>{message}</Text> : null}
    </AppCard>
  );
}

export function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled,
  style,
}: ToggleRowProps) {
  return (
    <View style={[styles.rowCard, style]}>
      <View style={styles.rowContent}>
        {icon ? (
          <View style={styles.rowIconWrap}>
            <IconSymbol name={icon} size={20} color={colors.primary} />
          </View>
        ) : null}
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowLabel}>{label}</Text>
          {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        thumbColor={colors.white}
        trackColor={{ false: colors.surfaceSoft, true: colors.primary }}
      />
    </View>
  );
}

export function MetricPill({ icon, label, tone = 'secondary', style }: MetricPillProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View
      style={[
        styles.metricPill,
        {
          backgroundColor: toneStyle.softBackgroundColor,
          borderColor: toneStyle.borderColor,
        },
        style,
      ]}
    >
      {icon ? <IconSymbol name={icon} size={15} color={toneStyle.textColor} /> : null}
      <Text style={[styles.metricPillText, { color: toneStyle.textColor }]}>{label}</Text>
    </View>
  );
}

export const uiStyles = styles;

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.cardOverlay,
    ...shadows.card,
  },
  cardPadded: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: typography.micro.fontSize,
    lineHeight: typography.micro.lineHeight,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.title2.fontSize,
    lineHeight: typography.title2.lineHeight,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  sectionAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  sectionActionText: {
    color: colors.primary,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: '700',
  },
  buttonBase: {
    minHeight: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadows.floating,
  },
  buttonFlat: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    fontSize: typography.bodyStrong.fontSize,
    lineHeight: typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  iconButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.micro.fontSize,
    lineHeight: typography.micro.lineHeight,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusHeader: {
    gap: spacing.md,
  },
  statusTitleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  statusIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  statusTitle: {
    color: colors.text,
    fontSize: typography.title3.fontSize,
    lineHeight: typography.title3.lineHeight,
    fontWeight: '700',
  },
  statusMessage: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  statusAction: {
    marginTop: spacing.md,
  },
  centeredState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  stateIconShell: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  loaderWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.title2.fontSize,
    lineHeight: typography.title2.lineHeight,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stateMessage: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
  },
  stateButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  rowCard: {
    minHeight: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  rowTextWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  rowLabel: {
    color: colors.text,
    fontSize: typography.bodyStrong.fontSize,
    lineHeight: typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  rowDescription: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  metricPillText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: '700',
  },
});
