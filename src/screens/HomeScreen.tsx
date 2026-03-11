import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { appTheme } from '../constants/theme';
import { homeScenarios, milestone2MockData } from '../data/mockData';

const { colors, radius, spacing, typography, shadows } = appTheme;

type HomeScreenProps = {
  onOpenSettings?: () => void;
};

const formatDistance = (distanceMeters: number) => `${distanceMeters.toFixed(1)}m`;

const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}% confidence`;

export default function HomeScreen({ onOpenSettings }: HomeScreenProps) {
  const activeScene = homeScenarios[0];
  const secondaryScenes = homeScenarios.slice(1);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View style={styles.latencyPill}>
          <Text style={styles.latencyDot}>●</Text>
          <Text style={styles.latencyText}>Latency {activeScene.latencyMs}ms</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={onOpenSettings}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={['rgba(255,138,112,0.18)', 'rgba(255,138,112,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>

        <View style={styles.heroVisual}>
          <View style={styles.heroRingOuter}>
            <View style={styles.heroRingInner}>
              <Text style={styles.heroEye}>◉</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heroEyebrow}>{activeScene.updatedAtLabel}</Text>
        <Text style={styles.heroTitle}>{activeScene.title}</Text>
        <Text style={styles.heroSubtitle}>{activeScene.summary}</Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaChip}>
            <Text style={styles.heroMetaLabel}>{activeScene.visibleCount} visible</Text>
          </View>
          <View style={styles.heroMetaChip}>
            <Text style={styles.heroMetaLabel}>{activeScene.confidenceLabel}</Text>
          </View>
          <View style={styles.heroMetaChip}>
            <Text style={styles.heroMetaLabel}>{activeScene.motionLevel} motion</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.bannerCard}>
        <Text style={styles.bannerTitle}>{milestone2MockData.statusBanner.title}</Text>
        <Text style={styles.bannerMessage}>{milestone2MockData.statusBanner.message}</Text>
      </View>

      <LinearGradient
        colors={['rgba(255,138,112,0.14)', 'rgba(255,138,112,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.narrationCard}
      >
        <Text style={styles.sectionEyebrow}>Live Narration</Text>
        <Text style={styles.narrationText}>"{activeScene.summary}"</Text>
      </LinearGradient>

      <View style={styles.actionsGrid}>
        {milestone2MockData.quickActions.map((action) => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={[
              styles.actionButton,
              action.emphasized && styles.actionButtonPrimary,
            ]}
          >
            <Text
              style={[
                styles.actionIcon,
                action.emphasized && styles.actionIconPrimary,
              ]}
            >
              {action.id === 'pause' ? '⏸' : action.id === 'repeat' ? '🔊' : '🔇'}
            </Text>
            <Text
              style={[
                styles.actionLabel,
                action.emphasized && styles.actionLabelPrimary,
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Detected Objects</Text>
        <View style={styles.visibleBadge}>
          <Text style={styles.visibleBadgeText}>{activeScene.visibleCount} visible</Text>
        </View>
      </View>

      <View style={styles.objectList}>
        {activeScene.objects.map((item) => (
          <View key={item.id} style={styles.objectCard}>
            <View style={styles.objectLeft}>
              <View style={styles.objectIconWrap}>
                <Text style={styles.objectIcon}>
                  {item.icon === 'table'
                    ? '▦'
                    : item.icon === 'chair'
                    ? '♿'
                    : item.icon === 'laptop'
                    ? '▭'
                    : '•'}
                </Text>
              </View>

              <View style={styles.objectTextWrap}>
                <Text style={styles.objectTitle}>
                  {item.label}
                  {item.quantity ? ` ×${item.quantity}` : ''}
                </Text>
                <Text style={styles.objectSubtitle}>{item.position}</Text>
                <Text style={styles.objectConfidence}>
                  {formatConfidence(item.confidence)}
                </Text>
              </View>
            </View>

            <View style={styles.objectRight}>
              <Text style={styles.objectDistance}>{formatDistance(item.distanceMeters)}</Text>
              <Text style={styles.objectDistanceLabel}>distance</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Other Demo Scenes</Text>

      <View style={styles.sceneStack}>
        {secondaryScenes.map((scene) => (
          <View key={scene.id} style={styles.sceneCard}>
            <View style={styles.sceneCardHeader}>
              <Text style={styles.sceneTitle}>{scene.title}</Text>
              <Text style={styles.sceneLatency}>{scene.latencyMs}ms</Text>
            </View>
            <Text style={styles.sceneSummary}>{scene.summary}</Text>
            <View style={styles.sceneFooter}>
              <Text style={styles.sceneFooterText}>{scene.confidenceLabel}</Text>
              <Text style={styles.sceneFooterText}>{scene.visibleCount} objects</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  topBar: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  latencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  latencyDot: {
    color: colors.primary,
    fontSize: 12,
  },
  latencyText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  settingsIcon: {
    color: colors.text,
    fontSize: 18,
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    ...shadows.card,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  liveBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroRingOuter: {
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,138,112,0.05)',
  },
  heroRingInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  heroEye: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '700',
  },
  heroEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroMetaChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  heroMetaLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  bannerTitle: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  bannerMessage: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  narrationCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  narrationText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 96,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionIcon: {
    color: colors.primary,
    fontSize: 24,
  },
  actionIconPrimary: {
    color: colors.background,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actionLabelPrimary: {
    color: colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  visibleBadge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  visibleBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  objectList: {
    gap: spacing.sm,
  },
  objectCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  objectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  objectIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  objectIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  objectTextWrap: {
    flex: 1,
    gap: 2,
  },
  objectTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  objectSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  objectConfidence: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  objectRight: {
    alignItems: 'flex-end',
  },
  objectDistance: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  objectDistanceLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sceneStack: {
    gap: spacing.sm,
  },
  sceneCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sceneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sceneTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sceneLatency: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sceneSummary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  sceneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sceneFooterText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600',
  },
});
