import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/UIComponents';
import { getExpiryState, useDisasterBuddy } from '../../logic/appLogic';
import styles from '../../styles/styles';

const TIER_TITLES = {
  1: 'Basic essentials',
  2: 'Advanced readiness',
  3: 'Extended resilience',
};

function taskHasProgress(task) {
  const hasVisitedLaterStep = (task.progressStep ?? 0) > 0;
  const hasSavedItems = (task.items?.length ?? 0) > 0;
  return !task.completed
    && (hasVisitedLaterStep || hasSavedItems || task.knowledgePassed);
}

function getTaskStatusLabel(task, isInProgress) {
  if (task.completed) {
    return 'Completed';
  }

  if (isInProgress) {
    const currentStep = (task.progressStep ?? 0) + 1;
    return `In progress · step ${currentStep} of 4`;
  }

  return 'Not started';
}

export default function TierChecklistScreen({ route, navigation }) {
  const { tier } = route.params;
  const { tasks, metrics } = useDisasterBuddy();
  const tierTasks = tasks.filter((task) => task.tier === tier);
  const progress = metrics.tierProgress[tier];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ All tiers</Text>
        </Pressable>
        <Text style={styles.eyebrow}>TIER {tier}</Text>
        <Text style={styles.title}>{TIER_TITLES[tier]}</Text>
        <ProgressBar value={progress.percentage} />
        <Text style={styles.muted}>
          {progress.completed} of {progress.total} completed · {progress.percentage}%
        </Text>

        {tierTasks.map((task) => {
          const expiryState = getExpiryState(task.expiryDate);
          const isInProgress = taskHasProgress(task);
          const statusLabel = getTaskStatusLabel(task, isInProgress);

          return (
            <Pressable
              key={task.id}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              style={styles.taskCard}
            >
              <View style={[
                styles.taskStateIcon,
                task.completed && styles.taskStateIconComplete,
              ]}>
                <Text style={[
                  styles.taskStateIconText,
                  task.completed && styles.taskStateIconTextComplete,
                ]}>
                  {task.completed ? '✓' : '○'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{task.shortTitle}</Text>
                <Text style={styles.muted}>{task.description}</Text>
                <View style={styles.tagRow}>
                  <Text style={[styles.tag, isInProgress && styles.tagInProgress]}>
                    {statusLabel}
                  </Text>
                  {task.requiresExpiry && expiryState !== 'none' ? (
                    <Text style={[
                      styles.tag,
                      expiryState === 'expired' && styles.tagDanger,
                      expiryState === 'soon' && styles.tagWarning,
                    ]}>
                      {expiryState}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
