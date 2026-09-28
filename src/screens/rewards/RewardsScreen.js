import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/UIComponents';
import { useRewards } from '../../hooks/useRewards';
import styles from '../../styles/styles';

function getMasterySubtitle(topic) {
  if (topic.bestScore > 0) {
    return `Best score ${topic.bestScore}%`;
  }

  return 'Take this quiz to begin';
}

function getRewardDateLabel(event) {
  if (!event.awardedAt) {
    return 'Recently earned';
  }

  return new Date(event.awardedAt).toLocaleDateString();
}

export default function RewardsScreen({ navigation }) {
  const { totalPoints, badges, earnedBadges, missions, mastery, level, events, loading } = useRewards();
  const [filter, setFilter] = useState('all');
  const showingEarnedOnly = filter === 'earned';
  const visibleBadges = showingEarnedOnly ? earnedBadges : badges;
  const pointsUntilNextLevel = level.next
    ? level.next.points - totalPoints
    : 0;
  const recentEvents = events.slice(0, 10);

  let recentActivityContent;
  if (loading && events.length === 0) {
    recentActivityContent = <Text style={styles.muted}>Loading rewards…</Text>;
  } else if (events.length === 0) {
    recentActivityContent = (
      <View style={styles.emptyInventory}>
        <Text style={styles.muted}>
          Complete a mission or preparedness action to begin earning points.
        </Text>
      </View>
    );
  } else {
    recentActivityContent = recentEvents.map((event) => (
      <View key={event.id} style={styles.rewardEvent}>
        <View style={styles.rewardEventDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{event.label}</Text>
          <Text style={styles.muted}>{getRewardDateLabel(event)}</Text>
        </View>
        <Text style={styles.rewardEventPoints}>+{event.points}</Text>
      </View>
    ));
  }

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}>
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Home</Text></Pressable>
    <Text style={styles.eyebrow}>YOUR PROGRESS</Text><Text style={styles.title}>Rewards and achievements</Text>
    <View style={styles.rewardHero}><View style={styles.rewardLevelOrb}><Text style={styles.rewardLevelNumber}>{level.current.level}</Text><Text style={styles.rewardLevelLabel}>LEVEL</Text></View><View style={{ flex: 1 }}><Text style={styles.rewardRank}>{level.current.title}</Text><Text style={styles.rewardPoints}>{totalPoints.toLocaleString()} Preparedness Points</Text><ProgressBar value={level.percentage} />{level.next ? <Text style={styles.rewardNext}>{pointsUntilNextLevel} points to {level.next.title}</Text> : <Text style={styles.rewardNext}>Highest rank reached</Text>}</View></View>

    <Text style={styles.sectionTitle}>Active missions</Text>
    {missions.map((mission) => {
      const missionPercentage = (mission.progress / mission.target) * 100;
      return <View key={mission.id} style={[styles.missionCard, mission.completed && styles.missionCardDone]}><View style={[styles.missionCheck, mission.completed && styles.missionCheckDone]}><Text style={[styles.missionCheckText, !mission.completed && { color: '#607068' }]}>{mission.completed ? '✓' : mission.progress}</Text></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{mission.title}</Text><Text style={styles.muted}>{mission.description}</Text><ProgressBar value={missionPercentage} /></View><Text style={styles.missionCount}>{mission.progress}/{mission.target}</Text></View>;
    })}

    <Text style={styles.sectionTitle}>Knowledge mastery</Text>
    <View style={styles.masteryPanel}>{mastery.map((topic) => <View key={topic.quizId} style={styles.masteryRow}><View style={{ flex: 1 }}><Text style={styles.masteryTitle}>{topic.title}</Text><Text style={styles.muted}>{getMasterySubtitle(topic)}</Text></View><Text style={[styles.masteryLevel, topic.level === 'Mastered' && styles.masteryLevelDone]}>{topic.level}</Text></View>)}</View>

    <View style={styles.profileCompletionRow}><Text style={styles.sectionTitle}>Badges</Text><Text style={styles.rewardBadgeCount}>{earnedBadges.length}/{badges.length} earned</Text></View>
    <View style={styles.rewardFilter}><Pressable onPress={() => setFilter('all')} style={[styles.rewardFilterButton, !showingEarnedOnly && styles.rewardFilterActive]}><Text style={[styles.rewardFilterText, !showingEarnedOnly && styles.rewardFilterTextActive]}>All</Text></Pressable><Pressable onPress={() => setFilter('earned')} style={[styles.rewardFilterButton, showingEarnedOnly && styles.rewardFilterActive]}><Text style={[styles.rewardFilterText, showingEarnedOnly && styles.rewardFilterTextActive]}>Earned</Text></Pressable></View>
    <View style={styles.badgeGrid}>{visibleBadges.map((badge) => <View key={badge.id} style={[styles.rewardBadge, badge.earned && styles.rewardBadgeEarned]}><View style={[styles.rewardBadgeIcon, badge.earned && styles.rewardBadgeIconEarned]}><Text style={[styles.rewardBadgeIconText, badge.earned && styles.rewardBadgeIconTextEarned]}>{badge.icon}</Text></View><Text style={styles.rewardBadgeTitle}>{badge.title}</Text><Text style={styles.rewardBadgeDescription}>{badge.description}</Text><Text style={[styles.rewardBadgeProgress, badge.earned && styles.rewardBadgeProgressEarned]}>{badge.earned ? 'Earned' : `${badge.progress}/${badge.target}`}</Text></View>)}</View>

    <Text style={styles.sectionTitle}>Recent point activity</Text>
    {recentActivityContent}
    <View style={styles.notice}><Text style={styles.noticeText}>Rewards recognise preparedness activity only. They do not represent emergency-response certification.</Text></View>
  </ScrollView></SafeAreaView>;
}
