import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { IconKey, colors, gradients, iconMap, radius, shadows, spacing, typography } from '../constants/theme';
import { milestone2MockData } from '../data/mockData';
import { OnboardingFeature } from '../types/app';
import { AppIcon } from '../components/AppIcon';

type OnboardingScreenProps = {
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

function FeatureRow({ feature }: { feature: OnboardingFeature }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconWrap}>
        <AppIcon icon={feature.icon as IconKey} size={24} color={colors.primary} />
      </View>

      <View style={styles.featureTextWrap}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );
}

export function OnboardingScreen({
  onPrimaryAction,
  onSecondaryAction,
}: OnboardingScreenProps) {
  const { appName, heroTitle, heroSubtitle, onboardingFeatures, permissionCard } =
    milestone2MockData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <AppIcon icon="vision" size={28} color={colors.primary} />
          <Text style={styles.brandName}>{appName}</Text>
        </View>
        <View style={styles.liveDot} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow} />

          <View style={styles.heroRing}>
            <View style={styles.heroCore}>
              <AppIcon icon="narration" size={76} color={colors.primary} />
            </View>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.heroTitle}>
            {heroTitle.split(' ').slice(0, -1).join(' ')}
            {'\n'}
            <Text style={styles.heroTitleAccent}>
              {heroTitle.split(' ').slice(-1)[0]}
            </Text>
          </Text>

          <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
        </View>

        <View style={styles.featuresList}>
          {onboardingFeatures.map((feature) => (
            <FeatureRow key={feature.id} feature={feature} />
          ))}
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>{permissionCard.title}</Text>
          <Text style={styles.permissionDescription}>{permissionCard.description}</Text>
          <Text style={styles.privacyNote}>{permissionCard.privacyNote}</Text>
        </View>

        <View style={styles.actionArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={permissionCard.ctaLabel}
            onPress={onPrimaryAction}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <LinearGradient
              colors={[...gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <AppIcon icon="camera" size={22} color={colors.background} />
              <Text style={styles.primaryButtonText}>{permissionCard.ctaLabel}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View privacy policy"
            onPress={onSecondaryAction}
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.secondaryActionPressed,
            ]}
          >
            <Text style={styles.secondaryActionText}>View Privacy Policy</Text>
          </Pressable>

          <Text style={styles.footerNote}>Your privacy is our priority</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressActive} />
        <View style={styles.progressInactive} />
        <View style={styles.progressInactive} />
      </View>
    </View>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandName: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingTop: spacing.xxxl,
  },
  heroWrap: {
    alignSelf: 'center',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: colors.primaryMuted,
    opacity: 0.55,
  },
  heroRing: {
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.cardOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCore: {
    width: 144,
    height: 144,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  copyBlock: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: spacing.md,
  },
  heroTitleAccent: {
    color: colors.primary,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    color: colors.textMuted,
    ...typography.body,
    textAlign: 'center',
    maxWidth: 320,
  },
  featuresList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  featureTitle: {
    color: colors.text,
    ...typography.bodyStrong,
  },
  featureDescription: {
    color: colors.textSoft,
    ...typography.caption,
  },
  permissionCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.xxl,
    ...shadows.card,
  },
  permissionTitle: {
    color: colors.text,
    ...typography.title3,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    color: colors.textMuted,
    ...typography.body,
    marginBottom: spacing.sm,
  },
  privacyNote: {
    color: colors.primary,
    ...typography.caption,
  },
  actionArea: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.floating,
  },
  primaryButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonGradient: {
    minHeight: 64,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  secondaryAction: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  secondaryActionPressed: {
    opacity: 0.7,
  },
  secondaryActionText: {
    color: colors.primary,
    ...typography.bodyStrong,
  },
  footerNote: {
    marginTop: spacing.sm,
    color: colors.textSoft,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
  },
  progressActive: {
    width: 32,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  progressInactive: {
    width: 8,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryMuted,
  },
});
