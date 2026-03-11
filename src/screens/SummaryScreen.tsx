import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { homeScenarios, milestone2MockData } from '../data/mockData';
import { colors, radius, shadows, spacing, typography } from '../constants/theme';

const metricToneMap = {
  up: colors.success,
  down: colors.warning,
  stable: colors.textSoft,
} as const;

export function SummaryScreen() {
  const { summary } = milestone2MockData;
  const scene = homeScenarios[1] ?? milestone2MockData.scene;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>VisionEdge Debug</Text>
          <Text style={styles.title}>Session Summary</Text>
          <Text style={styles.subtitle}>
            Mock diagnostics for milestone 2 validation.
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>ENGINE_V2.0.4_STABLE</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {summary.metrics.map((metric) => (
          <View key={metric.id} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text
                style={[
                  styles.metricDelta,
                  { color: metricToneMap[metric.trend] },
                ]}
              >
                {metric.delta}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${metric.progress * 100}%` }]}
              />
            </View>
          </View>
        ))}
      </View>

      <LinearGradient
        colors={['rgba(255,138,112,0.14)', 'rgba(255,138,112,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.previewCard}
      >
        <View style={styles.previewTopRow}>
          <Text style={styles.previewBadge}>Raw Capture: Active</Text>
          <View style={styles.coordinateBlock}>
            <Text style={styles.coordinateText}>X: {summary.coordinates.x}</Text>
            <Text style={styles.coordinateText}>Y: {summary.coordinates.y}</Text>
            <Text style={styles.coordinateText}>Z: {summary.coordinates.z}</Text>
          </View>
        </View>

        <View style={styles.previewCenter}>
          <View style={styles.previewReticleOuter}>
            <View style={styles.previewReticleInner} />
          </View>
        </View>

        <View style={styles.previewFooter}>
          <Text style={styles.previewFooterText}>{summary.frameBufferLabel}</Text>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>System State</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Engine Status</Text>
          <Text style={styles.rowValue}>{summary.engineStatus}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Scene Hash</Text>
          <Text style={styles.rowCode}>{summary.sceneHash}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>VRAM Usage</Text>
          <Text style={styles.rowValue}>{summary.vramUsageLabel}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Shaders Loaded</Text>
          <Text style={styles.rowValue}>{summary.shaderCountLabel}</Text>
        </View>

        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.rowLabel}>Active Scene</Text>
          <Text style={styles.rowValue}>{scene.title}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Last Spoken Phrase</Text>
        <Text style={styles.spokenPhrase}>{summary.lastSpokenPhrase}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Active Settings</Text>
        <View style={styles.chipsWrap}>
          {summary.activeSettings.map((item) => (
            <View
              key={item.id}
              style={[
                styles.chip,
                item.enabled ? styles.chipEnabled : styles.chipMuted,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  item.enabled ? styles.chipTextEnabled : styles.chipTextMuted,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Capability Placeholders</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Camera pipeline placeholder</Text>
          <Text style={styles.listItem}>• On-device model placeholder</Text>
          <Text style={styles.listItem}>• Offline TTS placeholder</Text>
          <Text style={styles.listItem}>• Battery-aware runtime placeholder</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default SummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.micro,
    color: colors.primary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerBadgeText: {
    ...typography.micro,
    color: colors.primary,
    letterSpacing: 1,
  },
  metricsGrid: {
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    ...shadows.card,
  },
  metricLabel: {
    ...typography.micro,
    color: colors.textSoft,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metricValue: {
    ...typography.title1,
    color: colors.text,
  },
  metricDelta: {
    ...typography.caption,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  previewCard: {
    minHeight: 240,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    overflow: 'hidden',
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  previewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  previewBadge: {
    ...typography.micro,
    color: colors.primary,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  coordinateBlock: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  coordinateText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  previewCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  previewReticleOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewReticleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  previewFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  previewFooterText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  rowValue: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  rowCode: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  spokenPhrase: {
    ...typography.title3,
    color: colors.text,
    lineHeight: 30,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  chipEnabled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipMuted: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
  },
  chipTextEnabled: {
    color: colors.background,
  },
  chipTextMuted: {
    color: colors.primary,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    ...typography.body,
    color: colors.textMuted,
  },
});
