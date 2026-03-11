import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { appTheme, colors, radius, spacing, typography } from '../constants/theme';
import { Icon } from '../components/Icon';
import { SectionCard } from '../components/SectionCard';
import { SliderBar } from '../components/SliderBar';
import { StatusBanner } from '../components/StatusBanner';
import { milestone2MockData } from '../data/mockData';

type SettingsScreenProps = {
  onBack?: () => void;
};

const settings = milestone2MockData.settings;
const actions = milestone2MockData.systemActions;

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={styles.headerIconButton}
          >
            <Icon icon="back" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>VisionEdge</Text>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Configure voice, alerts, privacy, and system placeholders for the
              milestone 2 UI shell.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search settings"
            style={styles.headerIconButton}
          >
            <Icon icon="search" size={20} color={colors.text} />
          </Pressable>
        </View>

        <StatusBanner banner={milestone2MockData.statusBanner} />

        <SectionCard title="Audio & Voice" icon="voice">
          <View style={styles.settingBlock}>
            <View style={styles.settingHeaderRow}>
              <View style={styles.settingIconWrap}>
                <Icon icon="latency" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Speech rate</Text>
                <Text style={styles.settingDescription}>
                  Adjust how quickly the assistant reads scene summaries.
                </Text>
              </View>
              <Text style={styles.settingValue}>{settings.speechRate.toFixed(2)}x</Text>
            </View>
            <SliderBar value={settings.speechRate} max={1.2} min={0.5} />
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.rowButton}>
            <View style={styles.rowLeading}>
              <View style={styles.settingIconWrap}>
                <Icon icon="voice" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Assistant voice</Text>
                <Text style={styles.settingDescription}>
                  Select the preferred synthesized voice profile.
                </Text>
              </View>
            </View>
            <View style={styles.rowTrailing}>
              <Text style={styles.rowValue}>{settings.voice}</Text>
              <Icon icon="explore" size={16} color={colors.textSoft} />
            </View>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.settingBlock}>
            <View style={styles.settingHeaderRow}>
              <View style={styles.settingIconWrap}>
                <Icon icon="narration" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Narration verbosity</Text>
                <Text style={styles.settingDescription}>
                  Choose how detailed spoken descriptions should be.
                </Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              {['concise', 'balanced', 'detailed'].map((item) => {
                const active = item === settings.verbosity;

                return (
                  <Pressable
                    key={item}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.rowButton}>
            <View style={styles.rowLeading}>
              <View style={styles.settingIconWrap}>
                <Icon icon="repeat" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Audio output</Text>
                <Text style={styles.settingDescription}>
                  Choose where narration would play when hardware support is added.
                </Text>
              </View>
            </View>
            <View style={styles.rowTrailing}>
              <Text style={styles.rowValue}>
                {settings.audioOutputMode.charAt(0).toUpperCase() +
                  settings.audioOutputMode.slice(1)}
              </Text>
              <Icon icon="explore" size={16} color={colors.textSoft} />
            </View>
          </Pressable>
        </SectionCard>

        <SectionCard title="Vision Alerts" icon="warning">
          <View style={styles.settingBlock}>
            <View style={styles.settingHeaderRow}>
              <View style={styles.settingIconWrap}>
                <Icon icon="warning" size={18} color={colors.primary} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Confidence threshold</Text>
                <Text style={styles.settingDescription}>
                  Minimum confidence before detections are announced with full emphasis.
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {Math.round(settings.confidenceThreshold * 100)}%
              </Text>
            </View>
            <SliderBar value={settings.confidenceThreshold} max={1} min={0} />
          </View>

          <View style={styles.divider} />

          <ToggleRow
            icon="live"
            title="Vibration feedback"
            description="Enable haptic alerts for nearby objects and higher priority warnings."
            value={settings.vibrationEnabled}
          />

          <View style={styles.divider} />

          <ToggleRow
            icon="warning"
            title="Low-light alerts"
            description="Warn when dim environments may reduce scene quality and confidence."
            value={settings.lowLightAlertsEnabled}
          />

          <View style={styles.divider} />

          <ToggleRow
            icon="translation"
            title="Real-time translation"
            description="Placeholder toggle for future multilingual scene assistance."
            value={settings.translationEnabled}
          />
        </SectionCard>

        <SectionCard title="Privacy & Model Info" icon="privacy">
          <View style={styles.infoCard}>
            <LinearGradient
              colors={appTheme.gradients.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoGradient}
            >
              <View style={styles.infoHeader}>
                <View style={styles.infoIconWrap}>
                  <Icon icon="privacy" size={18} color={colors.primary} />
                </View>
                <Text style={styles.infoTitle}>Offline-first mode</Text>
              </View>
              <Text style={styles.infoText}>{settings.offlineModeLabel}</Text>
            </LinearGradient>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoListItem}>
            <Text style={styles.settingLabel}>Privacy summary</Text>
            <Text style={styles.settingDescription}>{settings.privacySummary}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoListItem}>
            <Text style={styles.settingLabel}>Model runtime</Text>
            <Text style={styles.settingDescription}>{settings.modelInfoLabel}</Text>
          </View>
        </SectionCard>

        <SectionCard title="System" icon="devices">
          {actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <Pressable style={styles.systemCard}>
                <View style={styles.systemLeading}>
                  <View style={styles.systemIconWrap}>
                    <Icon icon={action.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={styles.systemCopy}>
                    <Text style={styles.settingLabel}>{action.label}</Text>
                    <Text style={styles.settingDescription}>{action.description}</Text>
                  </View>
                </View>

                <View style={styles.systemTrailing}>
                  {action.value ? (
                    <Text style={styles.systemValue}>{action.value}</Text>
                  ) : null}
                  {action.type === 'toggle' ? (
                    <Switch
                      value={Boolean(action.enabled)}
                      thumbColor={colors.white}
                      trackColor={{
                        false: colors.surfaceSoft,
                        true: colors.primary,
                      }}
                    />
                  ) : (
                    <Icon icon="explore" size={16} color={colors.textSoft} />
                  )}
                </View>
              </Pressable>

              {index < actions.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </SectionCard>

        <Pressable style={styles.resetButton}>
          <Icon icon="reset" size={18} color={colors.danger} />
          <Text style={styles.resetButtonText}>Reset all settings</Text>
        </Pressable>

        <Text style={styles.versionText}>VisionEdge UI Shell · Milestone 2</Text>
      </ScrollView>
    </View>
  );
}

type ToggleRowProps = {
  icon: React.ComponentProps<typeof Icon>['icon'];
  title: string;
  description: string;
  value: boolean;
};

function ToggleRow({ icon, title, description, value }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.rowLeading}>
        <View style={styles.settingIconWrap}>
          <Icon icon={icon} size={18} color={colors.primary} />
        </View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingLabel}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>

      <Switch
        value={value}
        thumbColor={colors.white}
        trackColor={{
          false: colors.surfaceSoft,
          true: colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    ...typography.micro,
  },
  title: {
    color: colors.text,
    ...typography.title1,
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.body,
  },
  settingBlock: {
    gap: spacing.md,
  },
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingCopy: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    color: colors.text,
    ...typography.bodyStrong,
  },
  settingDescription: {
    color: colors.textMuted,
    ...typography.caption,
  },
  settingValue: {
    color: colors.primary,
    ...typography.bodyStrong,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowValue: {
    color: colors.primary,
    ...typography.caption,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  chipTextActive: {
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  infoCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  infoGradient: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    color: colors.text,
    ...typography.bodyStrong,
  },
  infoText: {
    color: colors.textMuted,
    ...typography.body,
  },
  infoListItem: {
    gap: spacing.xs,
  },
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  systemLeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  systemCopy: {
    flex: 1,
    gap: 4,
  },
  systemIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  systemValue: {
    color: colors.primary,
    ...typography.caption,
  },
  resetButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.35)',
    backgroundColor: 'rgba(251, 113, 133, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resetButtonText: {
    color: colors.danger,
    ...typography.bodyStrong,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textSoft,
    ...typography.caption,
  },
});

export default SettingsScreen;
