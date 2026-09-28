import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import logger from './logger';

const REMINDER_IDS_KEY = 'disasterbuddy.notification.ids.v1';

async function readReminderIds() {
  try {
    const storedIds = await AsyncStorage.getItem(REMINDER_IDS_KEY);
    return JSON.parse(storedIds) ?? {};
  } catch (error) {
    logger.warn('notification_ids_load_failed', error);
    return {};
  }
}

async function writeReminderIds(reminderIds) {
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(reminderIds));
}

function getItemReminderKey(taskId, itemId) {
  return `${taskId}:${itemId}`;
}

async function cancelNotifications(notificationIds) {
  for (const notificationId of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      logger.warn('scheduled_notification_cancel_failed', error, { notificationId });
    }
  }
}

export async function configureNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expiry-reminders', {
      name: 'Expiry reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function getReminderPermission() {
  const permission = await Notifications.getPermissionsAsync();
  return permission.status;
}

export async function requestReminderPermission() {
  const permission = await Notifications.requestPermissionsAsync();
  return permission.status;
}

export async function cancelItemReminders(taskId, itemId) {
  const reminderIds = await readReminderIds();
  const reminderKey = getItemReminderKey(taskId, itemId);

  await cancelNotifications(reminderIds[reminderKey] ?? []);
  delete reminderIds[reminderKey];
  await writeReminderIds(reminderIds);
}

export async function syncTaskReminders(task) {
  const permission = await getReminderPermission();
  if (permission !== 'granted') {
    return;
  }

  const reminderIds = await readReminderIds();
  const activeReminderKeys = new Set();

  for (const item of task.items ?? []) {
    const reminderKey = getItemReminderKey(task.id, item.id);
    activeReminderKeys.add(reminderKey);
    await cancelNotifications(reminderIds[reminderKey] ?? []);
    reminderIds[reminderKey] = [];

    if (!item.expiryDate) {
      continue;
    }

    const expiryDate = new Date(`${item.expiryDate}T09:00:00`);
    if (Number.isNaN(expiryDate.getTime())) {
      continue;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const sevenDaysBefore = new Date(expiryDate.getTime() - (7 * millisecondsPerDay));
    const reminderTimes = [
      { type: 'seven-day', date: sevenDaysBefore },
      { type: 'expiry-day', date: expiryDate },
    ];

    for (const reminder of reminderTimes) {
      if (reminder.date.getTime() <= Date.now()) {
        continue;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.type === 'seven-day'
            ? 'Emergency item expiring soon'
            : 'Emergency item expires today',
          body: `${item.name} in ${task.shortTitle} expires on ${item.expiryDate}. Review or replace it.`,
          data: {
            taskId: task.id,
            itemId: item.id,
            reminderType: reminder.type,
          },
        },
        trigger: reminder.date,
      });
      reminderIds[reminderKey].push(notificationId);
    }
  }

  for (const [reminderKey, scheduledIds] of Object.entries(reminderIds)) {
    const reminderBelongsToTask = reminderKey.startsWith(`${task.id}:`);
    const itemStillExists = activeReminderKeys.has(reminderKey);

    if (!reminderBelongsToTask || itemStillExists) {
      continue;
    }

    await cancelNotifications(scheduledIds);
    delete reminderIds[reminderKey];
  }

  await writeReminderIds(reminderIds);
}

export async function cancelAllPreparednessReminders() {
  const reminderIds = await readReminderIds();

  for (const scheduledIds of Object.values(reminderIds)) {
    await cancelNotifications(scheduledIds);
  }

  await writeReminderIds({});
}
