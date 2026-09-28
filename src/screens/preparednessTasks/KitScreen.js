import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar, ScreenBackdrop } from '../../components/UIComponents';
import { useDisasterBuddy } from '../../logic/appLogic';
import styles from '../../styles/styles';

const TIER_COPY = {
  1: { title: 'Basic essentials', description: 'Immediate household supplies and first-response basics.' },
  2: { title: 'Advanced readiness', description: 'Communication, continuity, and protected information.' },
  3: { title: 'Extended resilience', description: 'Longer disruption, evacuation, and additional support needs.' },
};

export default function KitScreen({ navigation }) {
  const { metrics } = useDisasterBuddy();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScreenBackdrop variant="orange" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.kitHero}><Text style={styles.kitHeroEyebrow}>YOUR READINESS PLAN</Text><Text style={styles.kitHeroTitle}>Build confidence, one tier at a time</Text><Text style={styles.kitHeroText}>Progress from everyday essentials to longer-term household resilience.</Text><View style={styles.kitHeroStats}><View><Text style={styles.kitHeroStatValue}>{metrics.completedCount}</Text><Text style={styles.kitHeroStatLabel}>Tasks complete</Text></View><View style={styles.kitHeroStatDivider} /><View><Text style={styles.kitHeroStatValue}>{metrics.currentTier}</Text><Text style={styles.kitHeroStatLabel}>Current tier</Text></View><View style={styles.kitHeroStatDivider} /><View><Text style={styles.kitHeroStatValue}>{metrics.tierProgress[metrics.currentTier].percentage}%</Text><Text style={styles.kitHeroStatLabel}>Tier progress</Text></View></View></View>
        <View><Text style={styles.sectionTitle}>Your preparedness path</Text><Text style={styles.muted}>Complete each stage to unlock the next.</Text></View>

        {[1, 2, 3].map((tier) => {
          const progress = metrics.tierProgress[tier];
          const unlocked = tier <= metrics.highestUnlockedTier;
          return (
            <Pressable
              key={tier}
              accessibilityRole="button"
              accessibilityState={{ disabled: !unlocked }}
              disabled={!unlocked}
              onPress={() => navigation.navigate('TierChecklist', { tier })}
              style={[styles.tierOverviewCard, styles[`tierOverviewCard${tier}`], !unlocked && styles.tierOverviewLocked]}
            >
              <View style={styles.tierOverviewHeader}>
                <View style={[styles.tierNumberBadge, progress.percentage === 100 && styles.tierNumberBadgeComplete]}><Text style={styles.tierNumberBadgeText}>{progress.percentage === 100 ? '✓' : tier}</Text></View>
                <View style={styles.tierOverviewCopy}><Text style={styles.tierOverviewLabel}>TIER {tier}</Text><Text style={styles.tierOverviewTitle}>{TIER_COPY[tier].title}</Text></View>
                <Text style={styles.tierOverviewStatus}>{unlocked ? `${progress.percentage}%` : 'Locked'}</Text>
              </View>
              <Text style={styles.muted}>{TIER_COPY[tier].description}</Text>
              {unlocked && <><ProgressBar value={progress.percentage} /><Text style={styles.tierOverviewCount}>{progress.completed} of {progress.total} tasks completed</Text></>}
              {!unlocked && <Text style={styles.lockRequirement}>Complete Tier {tier - 1} to unlock</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
