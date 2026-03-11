import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { PropsWithChildren } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  appTheme,
  colors,
  gradients,
  IconKey,
  iconMap,
  radius,
  shadows,
  spacing,
  typography,
} from '../constants/theme';
import {
  AppScreen,
  AppTab,
  BannerTone,
  DetectedObject,
  Milestone2MockData,
  SettingCardAction,
  SummaryMetric,
} from '../types/app';

type AppShellProps = {
  screen: AppScreen;
  activeTab?: AppTab;
  data: Milestone2MockData;
  selectedScenarioIndex?: number;
  onNavigate?: (screen: AppScreen) => void;
  onTabPress?: (tab: AppTab) => void;
  onScenarioChange?: (index: number) => void;
};

type HeaderProps = {
  title?: string;
  subtitle?: string;
  leftIcon?: IconKey;
  rightIcon?: IconKey;
  rightSecondaryIcon?: IconKey;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  onRightSecondaryPress?: () => void;
};

type StatusBannerProps = {
  tone: BannerTone;
  icon: IconKey;
  title: string;
  message: string;
};

type QuickActionCardProps = {
  label: string;
  icon: IconKey;
  emphasized?: boolean;
  active?: boolean;
  onPress?: () => void;
};

type DetectionRowProps = {
  item: DetectedObject;
};

type MetricCardProps = {
  metric: SummaryMetric;
};

type SettingActionRowProps = {
  action: SettingCardAction;
};

const toneStyles: Record<BannerTone, { bg: string; border: string; icon: string }> = {
  neutral: {
    bg: colors.primarySoft,
    border: colors.primaryBorder,
    icon: colors.primary,
  },
  success: {
    bg: 'rgba(163, 230, 53, 0.12)',
    border: 'rgba(163, 230, 53, 0.28)',
    icon: colors.success,
  },
  warning: {
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.28)',
    icon: colors.warning,
  },
  danger: {
    bg: 'rgba(251, 113, 133, 0.12)',
    border: 'rgba(251, 113, 133, 0.28)',
    icon: colors.danger,
  },
};

function AppIcon({
  name,
  size = 22,
  color = colors.text,
}: {
  name: IconKey;
  size?: number;
  color?: string;
}) {
  const icon = iconMap[name];

  if (icon.family === 'Ionicons') {
    return <Ionicons name={icon.name} size={size} color={color} />;
  }

  if (icon.family === 'MaterialIcons') {
    return <MaterialIcons name={icon.name} size={size} color={color} />;
  }

  return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
}

function SurfaceCard({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.surfaceCard, style]}>{children}</View>;
}

function GlassCard({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

function SectionTitle({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {trailing}
    </View>
  );
}

function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightSecondaryIcon,
  onLeftPress,
  onRightPress,
  onRightSecondaryPress,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {leftIcon ? (
          <Pressable onPress={onLeftPress} style={styles.iconButton}>
            <AppIcon name={leftIcon} size={20} />
          </Pressable>
        ) : (
          <View style={styles.iconButtonPlaceholder} />
        )}
      </View>

      <View style={styles.headerCenter}>
        {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.headerActions}>
        {rightSecondaryIcon ? (
          <Pressable onPress={onRightSecondaryPress} style={styles.iconButton}>
            <AppIcon name={rightSecondaryIcon} size={20} />
          </Pressable>
        ) : null}
        {rightIcon ? (
          <Pressable onPress={onRightPress} style={styles.iconButton}>
            <AppIcon name={rightIcon} size={20} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function StatusBanner({ tone, icon, title, message }: StatusBannerProps) {
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.statusBanner,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={[styles.statusBannerIcon, { backgroundColor: palette.bg }]}>
        <AppIcon name={icon} size={18} color={palette.icon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statusBannerTitle}>{title}</Text>
        <Text style={styles.statusBannerMessage}>{message}</Text>
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  icon,
  subtle,
  onPress,
}: {
  label: string;
  icon?: IconKey;
  subtle?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.primaryButton, subtle && styles.secondaryButton]}
    >
      {icon ? (
        <View style={styles.primaryButtonIcon}>
          <AppIcon name={icon} size={20} color={subtle ? colors.primary : colors.background} />
        </View>
      ) : null}
      <Text style={[styles.primaryButtonLabel, subtle && styles.secondaryButtonLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

function QuickActionCard({
  label,
  icon,
  emphasized,
  active,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickActionCard,
        emphasized && styles.quickActionCardEmphasized,
        active && styles.quickActionCardActive,
      ]}
    >
      <View
        style={[
          styles.quickActionIconWrap,
          emphasized && styles.quickActionIconWrapEmphasized,
        ]}
      >
        <AppIcon
          name={icon}
          size={28}
          color={emphasized ? colors.background : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.quickActionLabel,
          emphasized && { color: colors.background },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ConfidencePill({
  label,
  lowLight,
  lowConfidence,
}: {
  label: string;
  lowLight?: boolean;
  lowConfidence?: boolean;
}) {
  const tone = lowConfidence ? colors.warning : lowLight ? colors.warning : colors.primary;

  return (
    <View style={[styles.confidencePill, { borderColor: tone, backgroundColor: colors.primarySoft }]}>
      <Text style={[styles.confidencePillText, { color: tone }]}>{label}</Text>
    </View>
  );
}

function DetectionRow({ item }: DetectionRowProps) {
  const label = item.quantity ? `${item.label} x${item.quantity}` : item.label;

  return (
    <SurfaceCard style={styles.detectionRow}>
      <View style={styles.detectionLeft}>
        <View style={styles.detectionIcon}>
          <AppIcon name={item.icon as IconKey} size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.detectionTitle}>{label}</Text>
          <Text style={styles.detectionSubtitle}>{item.position}</Text>
        </View>
      </View>
      <View style={styles.detectionRight}>
        <Text style={styles.detectionDistance}>{item.distanceMeters.toFixed(1)}m</Text>
        <Text style={styles.detectionMeta}>
          {Math.round(item.confidence * 100)}% confidence
        </Text>
      </View>
    </SurfaceCard>
  );
}

function MetricCard({ metric }: MetricCardProps) {
  const deltaColor =
    metric.trend === 'up'
      ? colors.success
      : metric.trend === 'down'
      ? colors.danger
      : colors.textMuted;

  return (
    <SurfaceCard style={styles.metricCard}>
      <View style={styles.metricIconRow}>
        <Text style={styles.metricLabel}>{metric.label}</Text>
        <AppIcon name={metric.icon as IconKey} size={20} color={colors.primary} />
      </View>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{metric.value}</Text>
        <Text style={[styles.metricDelta, { color: deltaColor }]}>{metric.delta}</Text>
      </View>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${metric.progress * 100}%` }]} />
      </View>
    </SurfaceCard>
  );
}

function SettingActionRow({ action }: SettingActionRowProps) {
  const isToggle = action.type === 'toggle';

  return (
    <SurfaceCard style={styles.settingRow}>
      <View style={styles.settingRowLeft}>
        <View style={styles.settingIcon}>
          <AppIcon name={action.icon as IconKey} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>{action.label}</Text>
          <Text style={styles.settingDescription}>{action.description}</Text>
        </View>
      </View>

      {isToggle ? (
        <Switch
          value={Boolean(action.enabled)}
          trackColor={{ false: colors.surfaceSoft, true: colors.primary }}
          thumbColor={colors.white}
        />
      ) : action.value ? (
        <View style={styles.settingValueWrap}>
          <Text style={styles.settingValue}>{action.value}</Text>
          <AppIcon name="explore" size={16} color={colors.textSoft} />
        </View>
      ) : (
        <AppIcon name="explore" size={16} color={colors.textSoft} />
      )}
    </SurfaceCard>
  );
}

function EmptyStateCard({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: IconKey;
}) {
  return (
    <GlassCard style={styles.emptyStateCard}>
      <View style={styles.emptyStateIcon}>
        <AppIcon name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateMessage}>{message}</Text>
    </GlassCard>
  );
}

function BottomNav({
  activeTab = 'home',
  onPress,
}: {
  activeTab?: AppTab;
  onPress?: (tab: AppTab) => void;
}) {
  const items: Array<{ key: AppTab; label: string; icon: IconKey }> = [
    { key: 'home', label: 'Vision', icon: 'vision' },
    { key: 'summary', label: 'Debug', icon: 'dashboard' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={styles.bottomNavWrap}>
      <View style={styles.bottomNav}>
        {items.map((item) => {
          const active = item.key === activeTab;

          return (
            <Pressable
              key={item.key}
              onPress={() => onPress?.(item.key)}
              style={styles.bottomNavItem}
            >
              <AppIcon
                name={item.icon}
                size={24}
                color={active ? colors.primary : colors.textSoft}
              />
              <Text style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ScenarioDots({
  count,
  activeIndex = 0,
}: {
  count: number;
  activeIndex?: number;
}) {
  return (
    <View style={styles.scenarioDots}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.scenarioDot, index === activeIndex && styles.scenarioDotActive]}
        />
      ))}
    </View>
  );
}

function HomeScreen({ data }: { data: Milestone2MockData }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Header
        title={data.appName}
        subtitle={`Latency ${data.scene.latencyMs}ms`}
        rightSecondaryIcon="settings"
        rightIcon="profile"
      />

      <StatusBanner
        tone={data.statusBanner.tone}
        icon={data.statusBanner.icon as IconKey}
        title={data.statusBanner.title}
        message={data.statusBanner.message}
      />

      <View style={styles.heroCard}>
        <LinearGradient colors={[...gradients.hero]} style={styles.heroGradient}>
          <View style={styles.heroLivePill}>
            <View style={styles.liveDot} />
            <Text style={styles.heroLiveText}>Live</Text>
          </View>

          <View style={styles.heroOverlayGrid} />

          <View style={styles.heroFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>Current Scene</Text>
              <Text style={styles.heroTitle}>{data.scene.title}</Text>
              <Text style={styles.heroMeta}>{data.scene.updatedAtLabel}</Text>
            </View>

            <Pressable style={styles.heroRefresh}>
              <AppIcon name="refresh" size={22} color={colors.background} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <GlassCard style={styles.narrationCard}>
        <View style={styles.narrationIconBackdrop}>
          <AppIcon name="narration" size={46} color={colors.primary} />
        </View>
        <Text style={styles.eyebrow}>Live Narration</Text>
        <Text style={styles.narrationText}>{`"${data.scene.summary}"`}</Text>
      </GlassCard>

      <View style={styles.quickActionsRow}>
        {data.quickActions.map((action) => (
          <QuickActionCard
            key={action.id}
            label={action.label}
            icon={action.icon as IconKey}
            emphasized={action.emphasized}
            active={action.active}
          />
        ))}
      </View>

      <SectionTitle
        eyebrow="Scene Confidence"
        title="Detected Objects"
        trailing={
          <ConfidencePill
            label={`${data.scene.visibleCount} visible`}
            lowLight={data.scene.lowLight}
            lowConfidence={data.scene.lowConfidence}
          />
        }
      />

      <View style={styles.objectList}>
        {data.scene.objects.map((item) => (
          <DetectionRow key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

function SummaryScreen({ data }: { data: Milestone2MockData }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Header
        title={`${data.appName} Debug`}
        subtitle="ENGINE_V2.0.4_STABLE"
        rightSecondaryIcon="terminal"
        rightIcon="debug"
      />

      <View style={styles.metricGrid}>
        {data.summary.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <View style={styles.summaryPreview}>
        <View style={styles.summaryPreviewGrid} />
        <View style={styles.summaryHudTop}>
          <Text style={styles.summaryHudText}>Raw Capture: Active</Text>
          <View>
            <Text style={styles.summaryHudText}>X: {data.summary.coordinates.x}</Text>
            <Text style={styles.summaryHudText}>Y: {data.summary.coordinates.y}</Text>
            <Text style={styles.summaryHudText}>Z: {data.summary.coordinates.z}</Text>
          </View>
        </View>
        <View style={styles.summaryCrosshairOuter}>
          <View style={styles.summaryCrosshairInner} />
        </View>
        <Text style={styles.summaryFrameBuffer}>{data.summary.frameBufferLabel}</Text>
      </View>

      <SurfaceCard style={styles.systemStateCard}>
        <SectionTitle eyebrow="Diagnostics" title="System State" />
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Engine Status</Text>
          <Text style={styles.stateValue}>{data.summary.engineStatus}</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Scene Hash</Text>
          <Text style={styles.stateBadge}>{data.summary.sceneHash}</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>VRAM Usage</Text>
          <Text style={styles.stateValue}>{data.summary.vramUsageLabel}</Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Shaders Loaded</Text>
          <Text style={styles.stateValue}>{data.summary.shaderCountLabel}</Text>
        </View>
        <View style={[styles.stateRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.stateLabel}>Last Spoken</Text>
          <Text style={[styles.stateValue, styles.lastSpoken]}>{data.summary.lastSpokenPhrase}</Text>
        </View>
      </SurfaceCard>

      <SectionTitle eyebrow="Active Settings" title="Runtime Toggles" />
      <View style={styles.chipWrap}>
        {data.summary.activeSettings.map((item) => (
          <View
            key={item.id}
            style={[styles.activeChip, item.enabled ? styles.activeChipEnabled : styles.activeChipMuted]}
          >
            <AppIcon
              name={item.icon as IconKey}
              size={14}
              color={item.enabled ? colors.background : colors.primary}
            />
            <Text
              style={[
                styles.activeChipText,
                { color: item.enabled ? colors.background : colors.primary },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SettingsScreen({ data }: { data: Milestone2MockData }) {
  const settings = data.settings;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Header title="Settings" subtitle="Configure your immersive experience" leftIcon="back" />

      <SectionTitle eyebrow="Vision Alerts" title="Scene Awareness" />
      <SurfaceCard style={styles.settingsFeatureCard}>
        <View style={styles.settingsFeatureTop}>
          <View style={styles.settingsFeatureLeft}>
            <View style={styles.settingsFeatureIcon}>
              <AppIcon name="proximity" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingLabel}>Proximity Detection</Text>
              <Text style={styles.settingDescription}>
                Haptic feedback for nearby objects
              </Text>
            </View>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            trackColor={{ false: colors.surfaceSoft, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.sliderBlock}>
          <View style={styles.sliderHeader}>
            <Text style={styles.settingLabel}>Detection Sensitivity</Text>
            <Text style={styles.sliderValue}>{Math.round(settings.confidenceThreshold * 100)}%</Text>
          </View>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${settings.confidenceThreshold * 100}%` }]} />
            <View
              style={[
                styles.sliderThumb,
                { left: `${Math.max(settings.confidenceThreshold * 100 - 6, 0)}%` },
              ]}
            />
          </View>
        </View>
      </SurfaceCard>

      <SectionTitle eyebrow="Audio & Voice" title="Speech Controls" />
      <SurfaceCard style={styles.audioCard}>
        <View style={styles.audioHero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Voice Volume</Text>
            <Text style={styles.settingDescription}>
              Adjust the volume of the synthetic voice assistant
            </Text>

            <View style={[styles.sliderTrack, { marginTop: spacing.lg }]}>
              <View style={[styles.sliderFill, { width: `${settings.speechRate * 68}%` }]} />
              <View
                style={[
                  styles.sliderThumb,
                  { left: `${Math.max(settings.speechRate * 68 - 6, 0)}%` },
                ]}
              />
            </View>
          </View>

          <LinearGradient colors={[...gradients.card]} style={styles.audioArtwork}>
            <AppIcon name="narration" size={34} color={colors.primary} />
          </LinearGradient>
        </View>

        <View style={styles.settingList}>
          <SettingActionRow
            action={{
              id: 'voice',
              label: 'Assistant Voice',
              description: 'Natural voice preset for narration output.',
              icon: 'voice',
              value: settings.voice,
              type: 'navigation',
            }}
          />
          <SettingActionRow
            action={{
              id: 'translation',
              label: 'Real-time Translation',
              description: 'Placeholder toggle for future language assistance.',
              icon: 'translation',
              type: 'toggle',
              enabled: settings.translationEnabled,
            }}
          />
        </View>
      </SurfaceCard>

      <SectionTitle eyebrow="System" title="Connectivity & Privacy" />
      <View style={styles.settingList}>
        {data.systemActions.map((action) => (
          <SettingActionRow key={action.id} action={action} />
        ))}
      </View>

      <GlassCard style={styles.privacyCard}>
        <Text style={styles.privacyLabel}>Offline-first mode</Text>
        <Text style={styles.privacyValue}>{settings.offlineModeLabel}</Text>
        <Text style={styles.privacyDescription}>{settings.privacySummary}</Text>
        <Text style={styles.privacyMeta}>{settings.modelInfoLabel}</Text>
      </GlassCard>
    </ScrollView>
  );
}

function OnboardingScreen({
  data,
  selectedScenarioIndex = 0,
}: {
  data: Milestone2MockData;
  selectedScenarioIndex?: number;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Header title={data.appName} subtitle="Milestone 2 UI Shell" />

      <View style={styles.onboardingHeroWrap}>
        <View style={styles.onboardingGlow} />
        <View style={styles.onboardingCircleOuter}>
          <View style={styles.onboardingCircleInner}>
            <AppIcon name="vision" size={78} color={colors.primary} />
          </View>
        </View>
      </View>

      <Text style={styles.onboardingTitle}>
        {data.heroTitle}
      </Text>
      <Text style={styles.onboardingSubtitle}>{data.heroSubtitle}</Text>

      <View style={styles.featureList}>
        {data.onboardingFeatures.map((feature) => (
          <SurfaceCard key={feature.id} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <AppIcon name={feature.icon as IconKey} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </SurfaceCard>
        ))}
      </View>

      <GlassCard style={styles.permissionCard}>
        <Text style={styles.eyebrow}>Permissions</Text>
        <Text style={styles.permissionTitle}>{data.permissionCard.title}</Text>
        <Text style={styles.permissionDescription}>{data.permissionCard.description}</Text>
        <Text style={styles.permissionPrivacy}>{data.permissionCard.privacyNote}</Text>
        <PrimaryButton label={data.permissionCard.ctaLabel} icon="camera" />
      </GlassCard>

      <ScenarioDots count={3} activeIndex={selectedScenarioIndex} />
    </ScrollView>
  );
}

export default function AppShell({
  screen,
  activeTab = 'home',
  data,
  selectedScenarioIndex = 0,
  onNavigate,
  onTabPress,
}: AppShellProps) {
  const content =
    screen === 'onboarding' ? (
      <OnboardingScreen data={data} selectedScenarioIndex={selectedScenarioIndex} />
    ) : screen === 'summary' ? (
      <SummaryScreen data={data} />
    ) : screen === 'settings' ? (
      <SettingsScreen data={data} />
    ) : (
      <HomeScreen data={data} />
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {content}

        {screen !== 'onboarding' ? (
          <BottomNav
            activeTab={activeTab}
            onPress={(tab) => {
              onTabPress?.(tab);
              onNavigate?.(tab);
            }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export function LoadingStateCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return <EmptyStateCard title={title} message={message} icon="narration" />;
}

export function ErrorStateCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return <EmptyStateCard title={title} message={message} icon="error" />;
}

export function EmptyStateView({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return <EmptyStateCard title={title} message={message} icon="empty" />;
}

const textBase: TextStyle = {
  color: colors.text,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  headerSide: {
    width: 48,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerActions: {
    width: 72,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  headerTitle: {
    ...textBase,
    ...typography.title3,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.textSoft,
    ...typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.primary,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...textBase,
    ...typography.title3,
  },
  surfaceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    ...shadows.card,
  },
  glassCard: {
    backgroundColor: colors.cardOverlay,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  statusBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBannerTitle: {
    ...textBase,
    ...typography.bodyStrong,
    marginBottom: 2,
  },
  statusBannerMessage: {
    color: colors.textMuted,
    ...typography.caption,
  },
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  heroGradient: {
    minHeight: 250,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  heroLivePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  heroLiveText: {
    color: colors.white,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroOverlayGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  heroEyebrow: {
    color: colors.primary,
    ...typography.micro,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  heroTitle: {
    ...textBase,
    ...typography.title1,
  },
  heroMeta: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  heroRefresh: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  narrationCard: {
    position: 'relative',
  },
  narrationIconBackdrop: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.12,
  },
  narrationText: {
    ...textBase,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    minHeight: 110,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  quickActionCardEmphasized: {
    backgroundColor: colors.primary,
  },
  quickActionCardActive: {
    borderColor: colors.primary,
  },
  quickActionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconWrapEmphasized: {
    backgroundColor: 'rgba(18, 9, 7, 0.16)',
  },
  quickActionLabel: {
    color: colors.primary,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  confidencePill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  confidencePillText: {
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  objectList: {
    gap: spacing.sm,
  },
  detectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  detectionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionTitle: {
    ...textBase,
    ...typography.bodyStrong,
  },
  detectionSubtitle: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  detectionRight: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  detectionDistance: {
    color: colors.primary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  detectionMeta: {
    color: colors.textSoft,
    ...typography.caption,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
  },
  metricIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: colors.textSoft,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValueRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  metricValue: {
    ...textBase,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
  },
  metricDelta: {
    ...typography.caption,
    fontWeight: '700',
    marginBottom: 3,
  },
  metricTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  summaryPreview: {
    minHeight: 260,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.black,
    overflow: 'hidden',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  summaryPreviewGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
    backgroundColor: 'transparent',
  },
  summaryHudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryHudText: {
    color: colors.primary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
  },
  summaryCrosshairOuter: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCrosshairInner: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  summaryFrameBuffer: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
  systemStateCard: {
    gap: spacing.sm,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stateLabel: {
    color: colors.textMuted,
    ...typography.body,
    flex: 1,
  },
  stateValue: {
    ...textBase,
    ...typography.bodyStrong,
    flex: 1,
    textAlign: 'right',
  },
  stateBadge: {
    color: colors.primary,
    ...typography.caption,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  lastSpoken: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeChipEnabled: {
    backgroundColor: colors.primary,
  },
  activeChipMuted: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  activeChipText: {
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsFeatureCard: {
    gap: spacing.lg,
  },
  settingsFeatureTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  settingsFeatureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingsFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderBlock: {
    gap: spacing.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    overflow: 'visible',
    position: 'relative',
  },
  sliderFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  sliderValue: {
    color: colors.primary,
    ...typography.bodyStrong,
  },
  audioCard: {
    gap: spacing.lg,
  },
  audioHero: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'stretch',
  },
  audioArtwork: {
    width: 92,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingList: {
    gap: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    ...textBase,
    ...typography.bodyStrong,
  },
  settingDescription: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  settingValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  settingValue: {
    color: colors.primary,
    ...typography.caption,
    fontWeight: '700',
  },
  privacyCard: {
    gap: spacing.xs,
  },
  privacyLabel: {
    color: colors.primary,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  privacyValue: {
    ...textBase,
    ...typography.title3,
  },
  privacyDescription: {
    color: colors.textMuted,
    ...typography.body,
  },
  privacyMeta: {
    color: colors.textSoft,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  onboardingHeroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    minHeight: 260,
  },
  onboardingGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primarySoft,
  },
  onboardingCircleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
  onboardingTitle: {
    ...textBase,
    ...typography.display,
    textAlign: 'center',
  },
  onboardingSubtitle: {
    color: colors.textMuted,
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    ...textBase,
    ...typography.bodyStrong,
  },
  featureDescription: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  permissionCard: {
    gap: spacing.sm,
  },
  permissionTitle: {
    ...textBase,
    ...typography.title2,
  },
  permissionDescription: {
    color: colors.textMuted,
    ...typography.body,
  },
  permissionPrivacy: {
    color: colors.textSoft,
    ...typography.caption,
  },
  primaryButton: {
    marginTop: spacing.sm,
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  primaryButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: colors.background,
    ...typography.bodyStrong,
  },
  secondaryButtonLabel: {
    color: colors.primary,
  },
  scenarioDots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  scenarioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  scenarioDotActive: {
    width: 30,
    backgroundColor: colors.primary,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  bottomNav: {
    backgroundColor: 'rgba(18, 9, 7, 0.94)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...shadows.floating,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bottomNavLabel: {
    color: colors.textSoft,
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomNavLabelActive: {
    color: colors.primary,
  },
  emptyStateCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    ...textBase,
    ...typography.title3,
    textAlign: 'center',
  },
  emptyStateMessage: {
    color: colors.textMuted,
    ...typography.body,
    textAlign: 'center',
  },
});

export { appTheme };
