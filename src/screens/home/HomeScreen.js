import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, FutureFeatureCard, Metric, ProgressBar, ScreenBackdrop } from '../../components/UIComponents';
import { useDisasterBuddy } from '../../logic/appLogic';
import styles from '../../styles/styles';
import { useAuth } from '../../hooks/useAuth';
import { useRewards } from '../../hooks/useRewards';

export default function HomeScreen({ navigation }) {
  const { ready, metrics, resetPrototype, syncState } = useDisasterBuddy();
  const { user } = useAuth();
  const { totalPoints, earnedBadges, level } = useRewards();
  const currentTierProgress = metrics.tierProgress[metrics.currentTier];
  const username = user?.displayName || 'Prepared Household';
  const hasEarnedBadges = earnedBadges.length > 0;
  const badgeIcon = hasEarnedBadges ? '★' : '✦';
  const badgeLabel = hasEarnedBadges
    ? `${earnedBadges.length} earned`
    : 'New user';
  const nextLevelMessage = level.next
    ? `${level.next.points - totalPoints} points to ${level.next.title}`
    : 'Highest rank reached';

  function confirmPrototypeReset() {
    Alert.alert(
      'Reset prototype?',
      'All progress and reminders will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetPrototype },
      ],
    );
  }

  if (!ready) {
    return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><View style={styles.centered}><Text>Loading DisasterBuddy…</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScreenBackdrop variant="green" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.dashboardHeader}>
          <View style={styles.dashboardHeaderText}>
            <Text style={styles.brand}>DisasterBuddy</Text>
            <Text style={styles.welcomeText}>Welcome, {username}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Rewards')} style={[styles.badgeSlot, styles.badgeNewUser, hasEarnedBadges && styles.badgeUnlocked]}>
            <Text style={styles.badgeIcon}>{badgeIcon}</Text>
            <Text style={[styles.badgeText, styles.badgeTextUnlocked]}>
              {badgeLabel}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.eyebrow}>DASHBOARD</Text>
        <Text style={styles.title}>Your preparedness journey</Text>

        <Pressable onPress={() => navigation.navigate('Rewards')} style={styles.homeRewardCard}><View style={styles.homeRewardHeader}><View><Text style={styles.homeRewardRank}>Level {level.current.level} · {level.current.title}</Text><Text style={styles.homeRewardPoints}>{totalPoints.toLocaleString()} Preparedness Points</Text></View><Text style={styles.homeRewardChevron}>›</Text></View><ProgressBar value={level.percentage} /><Text style={styles.homeRewardHint}>{nextLevelMessage} · View rewards</Text></Pressable>

        <Pressable onPress={() => navigation.navigate('KitTab')} style={[styles.featureCard, styles.featureCardPrimary]}>
          <View style={styles.featureCardHeader}>
            <View style={styles.featureIcon}><Text style={styles.featureIconText}>Tier {metrics.currentTier}</Text></View>
            <View style={styles.progressCircle}><Text style={styles.progressCircleText}>{currentTierProgress.percentage}%</Text></View>
          </View>
          <Text style={styles.featureTitle}>Preparedness tasks</Text>
          <Text style={styles.featureDescription}>{currentTierProgress.completed} of {currentTierProgress.total} Tier {metrics.currentTier} tasks completed</Text>
          <ProgressBar value={currentTierProgress.percentage} />
          <View style={styles.metricRowCompact}>
            <Metric label="Expiring" value={`${metrics.expiringCount}`} />
            <Metric label="Expired" value={`${metrics.expiredCount}`} />
            <Metric label="Current tier" value={`${metrics.currentTier}`} />
          </View>
          <Text style={styles.openHint}>Open checklist ›</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommended next action</Text>
          <Text style={styles.body}>{metrics.nextTask?.title ?? 'Review expiring items and maintain your kit.'}</Text>
        </View>

        <View style={styles.featureGrid}>
          <FutureFeatureCard title="Short Quiz" subtitle="Five-question knowledge check" icon="https://cdn-icons-png.flaticon.com/512/3407/3407038.png" onPress={() => navigation.navigate('LearnTab', { screen: 'QuizCategories' })} />
          <FutureFeatureCard title="Alerts" subtitle="Expiry and future hazard alerts" icon="!" onPress={() => navigation.navigate('AlertsTab')} />
          <FutureFeatureCard title="Resource Hub" subtitle="Offline safety procedures" icon="https://cdn-icons-png.flaticon.com/512/2232/2232688.png" onPress={() => navigation.navigate('LearnTab', { screen: 'ResourceLibrary' })} />
          <FutureFeatureCard title="Profile" subtitle="Account and achievements" icon="P" onPress={() => navigation.navigate('ProfileTab')} />
        </View>

        <AppButton
          label="Reset prototype"
          secondary
          onPress={confirmPrototypeReset}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
