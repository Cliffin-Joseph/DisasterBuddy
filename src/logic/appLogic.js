import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CHECKLIST_DEFINITIONS, mergeChecklistDefinitions } from '../data/checklistDefinitions';
import { loadChecklistRecords, saveChecklistRecord } from '../services/checklistService';
import { loadProgressProfile, persistTierAchievement } from '../services/progressService';
import { cancelAllPreparednessReminders, configureNotificationChannel, getReminderPermission, requestReminderPermission, syncTaskReminders } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { awardRewardEvent } from '../services/rewardService';
import logger from '../services/logger';
import { EXPIRY_WARNING_DAYS, getDaysUntilExpiry, getExpiryState, parseExpiryDate } from '../utils/expiryUtils';
import { calculateOverallProgress, calculateTierProgress, calculateUnlockedTier, getRecommendedNextTask } from '../utils/progressUtils';

export { EXPIRY_WARNING_DAYS, getDaysUntilExpiry, getExpiryState, parseExpiryDate } from '../utils/expiryUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const STORAGE_KEY = 'disasterbuddy.prototype.tasks.modular.v1';
export const REMINDER_DAYS_BEFORE_EXPIRY = 7;

export const INITIAL_TASKS = mergeChecklistDefinitions(CHECKLIST_DEFINITIONS);

export const STATUS_SCORE = {
  not_started: 0,
  in_progress: 0,
  self_reported: 0,
  details_added: 0,
  knowledge_checked: 0,
  current_reviewed: 100,
};

function isTaskComplete(task) {
  return task.completed === true || task.status === 'current_reviewed';
}

function mergeCachedTasks(cachedTasks) {
  return CHECKLIST_DEFINITIONS.map((definition) => {
    const initialTask = mergeChecklistDefinitions([definition])[0];
    const cachedTask = cachedTasks.find((task) => task.id === definition.id);

    return {
      ...initialTask,
      ...cachedTask,
      ...definition,
    };
  });
}

function getCompletedTier(tasks) {
  let highestCompletedTier = 0;

  for (const tier of [1, 2, 3]) {
    const tierTasks = tasks.filter((task) => task.tier === tier);
    const tierIsComplete = tierTasks.length > 0 && tierTasks.every(isTaskComplete);

    if (tierIsComplete) {
      highestCompletedTier = tier;
    } else {
      break;
    }
  }

  return highestCompletedTier;
}

function itemsHaveChanged(previousItems = [], updatedItems = []) {
  return JSON.stringify(previousItems) !== JSON.stringify(updatedItems);
}


export function formatFriendlyDate(expiryDate) {
  const date = parseExpiryDate(expiryDate);

  if (!date) {
    return expiryDate;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getStatusLabel(status) {
  const labels = {
    not_started: 'No option selected',
    in_progress: 'In progress',
    self_reported: 'I have this',
    details_added: 'I have this — details added',
    knowledge_checked: 'I have this — knowledge checked',
    current_reviewed: 'Current and reviewed',
  };
  return labels[status] ?? 'No option selected';
}

async function configureNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expiry-reminders', {
      name: 'Expiry reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

const DisasterBuddyContext = createContext(null);

export function DisasterBuddyProvider({ children }) {
  const { user, isFirebaseConfigured } = useAuth();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [ready, setReady] = useState(false);
  const [syncState, setSyncState] = useState({ status: 'loading', message: 'Loading checklist…' });
  const [earnedTier, setEarnedTier] = useState(1);
  const [achievements, setAchievements] = useState([]);
  const [reminderPermission, setReminderPermission] = useState('undetermined');

  useEffect(() => {
    let providerIsActive = true;

    async function initialiseApplicationData() {
      try {
        const savedTasksJson = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasksJson && providerIsActive) {
          const cachedTasks = JSON.parse(savedTasksJson);
          setTasks(mergeCachedTasks(cachedTasks));
        }

        if (isFirebaseConfigured && user) {
          const [checklistRecords, progressProfile] = await Promise.all([
            loadChecklistRecords(user.uid),
            loadProgressProfile(user.uid),
          ]);

          if (providerIsActive) {
            setTasks(mergeChecklistDefinitions(CHECKLIST_DEFINITIONS, checklistRecords));
            setEarnedTier(progressProfile.highestUnlockedTier);
            setAchievements(progressProfile.achievements);
            setSyncState({ status: 'saved', message: 'Checklist synced' });
          }
        } else if (providerIsActive) {
          setSyncState({ status: 'preview', message: 'Saved on this device' });
        }
      } catch (error) {
        logger.error('application_data_initialisation_failed', error, { uid: user?.uid });

        if (providerIsActive) {
          setSyncState({
            status: 'error',
            message: 'Using saved device data. Cloud reload failed.',
          });
        }
      }

      await configureNotifications();
      await configureNotificationChannel();
      const permission = await getReminderPermission();

      if (providerIsActive) {
        setReminderPermission(permission);
        setReady(true);
      }
    }

    initialiseApplicationData().catch((error) => {
      logger.error('application_startup_failed', error, { uid: user?.uid });
      if (providerIsActive) {
        setReady(true);
      }
    });

    return () => {
      providerIsActive = false;
    };
  }, [isFirebaseConfigured, user]);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch((error) => {
        logger.warn('local_checklist_cache_save_failed', error);
      });
    }
  }, [tasks, ready]);

  useEffect(() => {
    if (!ready || reminderPermission !== 'granted') {
      return;
    }

    const reminderUpdates = tasks.map((task) => syncTaskReminders(task));
    Promise.all(reminderUpdates).catch((error) => {
      logger.warn('expiry_reminder_resync_failed', error);
    });
  }, [ready, reminderPermission]);

  useEffect(() => {
    if (!ready || !user) return;
    for (const task of tasks) {
      if (task.status !== 'not_started') awardRewardEvent(user.uid, { id: `task-started:${task.id}`, type: 'task_started', points: 5, label: `Started ${task.shortTitle}` });
      if (task.completed || task.status === 'current_reviewed') awardRewardEvent(user.uid, { id: `task-complete:${task.id}`, type: 'task_complete', points: 20, label: `Completed ${task.shortTitle}`, metadata: { tier: task.tier } });
      for (const item of task.items ?? []) {
        awardRewardEvent(user.uid, { id: `item-added:${task.id}:${item.id}`, type: 'item_added', points: 3, label: `Added ${item.name}`, metadata: { taskId: task.id, itemId: item.id } });
        if (item.expiryDate) awardRewardEvent(user.uid, { id: `expiry-added:${task.id}:${item.id}:${item.expiryDate}`, type: 'expiry_added', points: 2, label: `Tracked expiry for ${item.name}`, metadata: { taskId: task.id, itemId: item.id } });
      }
    }
    for (const tier of [1, 2, 3]) {
      const tierTasks = tasks.filter((task) => task.tier === tier);
      if (tierTasks.length && tierTasks.every((task) => task.completed || task.status === 'current_reviewed')) awardRewardEvent(user.uid, { id: `tier-complete:${tier}`, type: 'tier_complete', points: 100, label: `Completed Tier ${tier}`, metadata: { tier } });
    }
  }, [tasks, ready, user]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const completedTier = getCompletedTier(tasks);
    const newlyUnlockedTier = Math.min(3, completedTier + 1);

    if (newlyUnlockedTier <= earnedTier) {
      return;
    }

    const achievementId = `tier-${completedTier}`;
    setEarnedTier(newlyUnlockedTier);
    setAchievements((currentAchievements) => {
      const achievementAlreadyExists = currentAchievements.some((achievement) => (
        achievement.id === achievementId
      ));

      if (achievementAlreadyExists) {
        return currentAchievements;
      }

      return [
        ...currentAchievements,
        {
          id: achievementId,
          tier: completedTier,
          label: `Tier ${completedTier} complete`,
        },
      ];
    });

    if (user) {
      awardRewardEvent(user.uid, {
        id: `tier-complete:${completedTier}`,
        type: 'tier_complete',
        points: 100,
        label: `Completed Tier ${completedTier}`,
        metadata: { tier: completedTier },
      });
    }

    if (isFirebaseConfigured && user) {
      persistTierAchievement(user.uid, completedTier, newlyUnlockedTier)
        .catch((error) => {
          logger.error('tier_achievement_save_failed', error, {
            uid: user.uid,
            completedTier,
          });
          setSyncState({
            status: 'error',
            message: error.message || 'Achievement save failed.',
          });
        });
    }
  }, [tasks, ready, earnedTier, isFirebaseConfigured, user]);

  const updateTask = (taskId, patch) => {
    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      logger.warn('checklist_task_not_found', null, { taskId });
      return;
    }

    const completed = patch.status
      ? patch.status === 'current_reviewed'
      : (patch.completed ?? currentTask.completed);

    const updatedTask = {
      ...currentTask,
      ...patch,
      completed,
    };

    setTasks((current) => current.map((task) => (
      task.id === taskId ? updatedTask : task
    )));

    if (isFirebaseConfigured && user) {
      setSyncState({ status: 'saving', message: 'Saving…' });
      saveChecklistRecord(user.uid, updatedTask)
        .then(() => setSyncState({ status: 'saved', message: 'Saved to cloud' }))
        .catch((error) => {
          logger.error('checklist_save_failed', error, { uid: user.uid, taskId });
          setSyncState({
            status: 'error',
            message: error.message || 'Save failed. Try again.',
          });
        });
    }

    if (user) {
      const taskWasStarted = currentTask.status === 'not_started'
        && updatedTask.status !== 'not_started';
      const taskWasCompleted = !currentTask.completed && updatedTask.completed;
      const completedTaskWasEdited = currentTask.completed
        && updatedTask.completed
        && itemsHaveChanged(currentTask.items, updatedTask.items);

      if (taskWasStarted) {
        awardRewardEvent(user.uid, {
          id: `task-started:${taskId}`,
          type: 'task_started',
          points: 5,
          label: `Started ${updatedTask.shortTitle}`,
        });
      }

      if (taskWasCompleted) {
        awardRewardEvent(user.uid, {
          id: `task-complete:${taskId}`,
          type: 'task_complete',
          points: 20,
          label: `Completed ${updatedTask.shortTitle}`,
          metadata: { tier: updatedTask.tier },
        });
      }

      if (completedTaskWasEdited) {
        const month = new Date().toISOString().slice(0, 7);
        awardRewardEvent(user.uid, {
          id: `maintenance-review:${taskId}:${month}`,
          type: 'maintenance_review',
          points: 8,
          label: `Reviewed ${updatedTask.shortTitle}`,
          metadata: { taskId, month },
        });
      }

      const previousItems = new Map((currentTask.items ?? []).map((item) => [item.id, item]));

      for (const item of updatedTask.items ?? []) {
        const itemIsNew = !previousItems.has(item.id);
        const expiryDateWasAddedOrChanged = item.expiryDate
          && previousItems.get(item.id)?.expiryDate !== item.expiryDate;

        if (itemIsNew) {
          awardRewardEvent(user.uid, {
            id: `item-added:${taskId}:${item.id}`,
            type: 'item_added',
            points: 3,
            label: `Added ${item.name}`,
            metadata: { taskId, itemId: item.id },
          });
        }

        if (expiryDateWasAddedOrChanged) {
          awardRewardEvent(user.uid, {
            id: `expiry-added:${taskId}:${item.id}:${item.expiryDate}`,
            type: 'expiry_added',
            points: 2,
            label: `Tracked expiry for ${item.name}`,
            metadata: { taskId, itemId: item.id },
          });
        }
      }
    }

    syncTaskReminders(updatedTask).catch((error) => {
      logger.warn('expiry_reminder_update_failed', error, { taskId });
    });
  };

  const getTaskById = (taskId) => tasks.find((task) => task.id === taskId);

  const resetPrototype = async () => {
    for (const task of tasks) {
      if (task.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(task.notificationId);
        } catch (error) {
          logger.warn('legacy_notification_cancel_failed', error, {
            taskId: task.id,
          });
        }
      }
    }

    setTasks(INITIAL_TASKS);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.warn('local_checklist_reset_failed', error);
    }

    await cancelAllPreparednessReminders();
  };

  const enableExpiryReminders = async () => {
    const status = await requestReminderPermission();
    setReminderPermission(status);

    if (status === 'granted') {
      for (const task of tasks) {
        await syncTaskReminders(task);
      }
    }

    return status;
  };

  const scheduleExpiryReminder = async (task, expiryDate) => {
    if (!task.requiresExpiry) {
      return false;
    }

    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    const expiry = parseExpiryDate(expiryDate);

    if (!expiry || daysUntilExpiry === null) {
      Alert.alert('Valid expiry date required', 'Enter an expiry date in YYYY-MM-DD format.');
      return false;
    }
    if (daysUntilExpiry < 0) {
      Alert.alert('Item already expired', `${task.title} expired on ${formatFriendlyDate(expiryDate)}.`);
      return false;
    }
    if (daysUntilExpiry > EXPIRY_WARNING_DAYS) {
      Alert.alert(
        'Reminder not required yet',
        `${task.title} expires on ${formatFriendlyDate(expiryDate)}, more than ${EXPIRY_WARNING_DAYS} days away.`
      );
      return false;
    }

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Notifications disabled', 'Enable notifications in device settings to receive expiry reminders.');
      return false;
    }

    if (task.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
      } catch (error) {
        logger.warn('existing_expiry_notification_cancel_failed', error, {
          taskId: task.id,
        });
      }
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const reminderTime = expiry.getTime()
      - (REMINDER_DAYS_BEFORE_EXPIRY * millisecondsPerDay);
    const reminderDate = new Date(reminderTime);
    reminderDate.setHours(9, 0, 0, 0);

    const isFutureReminder = reminderDate.getTime() > Date.now() + 5000;
    const trigger = isFutureReminder
      ? reminderDate
      : {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
          channelId: 'expiry-reminders',
        };

    let timingText = `in ${daysUntilExpiry} days`;
    if (daysUntilExpiry === 0) {
      timingText = 'today';
    } else if (daysUntilExpiry === 1) {
      timingText = 'tomorrow';
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Emergency kit item expiring soon',
        body: `${task.title} expires ${timingText}, on ${formatFriendlyDate(expiryDate)}. Replace it to keep Tier 1 current.`,
        data: { taskId: task.id, expiryDate },
      },
      trigger,
    });

    updateTask(task.id, { notificationId, expiryDate });
    Alert.alert(
      'Expiry reminder scheduled',
      isFutureReminder
        ? `Reminder scheduled for ${reminderDate.toLocaleString()}.`
        : `The item is already inside the reminder window, so a prototype notification will appear in about 10 seconds.`
    );
    return true;
  };

  const metrics = useMemo(() => {
    const overallProgress = calculateOverallProgress(tasks);
    const tierProgress = calculateTierProgress(tasks);
    const tier2Unlocked = tierProgress[1].percentage === 100;
    const tier3Unlocked = tier2Unlocked && tierProgress[2].percentage === 100;
    const highestUnlockedTier = calculateUnlockedTier(tierProgress, earnedTier);
    const expiringTasks = tasks.filter((task) => (
      getExpiryState(task.expiryDate) === 'soon'
    ));
    const expiredTasks = tasks.filter((task) => (
      getExpiryState(task.expiryDate) === 'expired'
    ));
    const nextTask = getRecommendedNextTask(tasks, highestUnlockedTier);

    return {
      tierScore: overallProgress.percentage,
      completedCount: overallProgress.completed,
      expiringCount: expiringTasks.length,
      expiredCount: expiredTasks.length,
      tier2Unlocked,
      tier3Unlocked,
      highestUnlockedTier,
      tierProgress,
      currentTier: highestUnlockedTier,
      nextTask,
      achievements,
    };
  }, [tasks, earnedTier, achievements]);

  const value = {
    tasks,
    ready,
    metrics,
    updateTask,
    getTaskById,
    resetPrototype,
    scheduleExpiryReminder,
    syncState,
    reminderPermission,
    enableExpiryReminders,
  };

  return (
    <DisasterBuddyContext.Provider value={value}>
      {children}
    </DisasterBuddyContext.Provider>
  );
}

export function useDisasterBuddy() {
  const context = useContext(DisasterBuddyContext);

  if (!context) {
    throw new Error('useDisasterBuddy must be used inside DisasterBuddyProvider');
  }

  return context;
}
