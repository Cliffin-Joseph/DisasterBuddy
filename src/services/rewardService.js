import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

function getStorageKey(uid) {
  return `disasterbuddy.rewards.v1.${uid || 'preview'}`;
}

const listeners = new Set();
const awardQueues = new Map();

function notifyRewardListeners(uid, events) {
  listeners.forEach((listener) => listener(uid, events));
}

export function subscribeToRewards(listener) {
  listeners.add(listener);

  return function unsubscribe() {
    listeners.delete(listener);
  };
}

async function loadLocalRewardEvents(uid) {
  try {
    const storedEvents = await AsyncStorage.getItem(getStorageKey(uid));
    return JSON.parse(storedEvents) ?? [];
  } catch {
    return [];
  }
}

async function cacheRewardEvents(uid, events) {
  await AsyncStorage.setItem(getStorageKey(uid), JSON.stringify(events));
}

function convertCloudRewardEvent(documentSnapshot) {
  const data = documentSnapshot.data();
  const cloudAwardedAt = data.awardedAt?.toDate?.()?.toISOString() ?? data.awardedAt;

  return {
    id: documentSnapshot.id,
    ...data,
    awardedAt: cloudAwardedAt,
  };
}

function mergeRewardEvents(cachedEvents, cloudEvents) {
  const eventsById = new Map();

  cachedEvents.forEach((event) => eventsById.set(event.id, event));
  cloudEvents.forEach((event) => eventsById.set(event.id, event));

  return [...eventsById.values()].sort((firstEvent, secondEvent) => {
    const firstDate = firstEvent.awardedAt ?? '';
    const secondDate = secondEvent.awardedAt ?? '';
    return secondDate.localeCompare(firstDate);
  });
}

export async function loadRewardEvents(uid, onCached) {
  const cachedEvents = await loadLocalRewardEvents(uid);

  if (cachedEvents.length > 0 && onCached) {
    onCached(cachedEvents);
  }

  if (!db || !uid) {
    return cachedEvents;
  }

  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'rewardEvents'));
    const cloudEvents = snapshot.docs.map(convertCloudRewardEvent);
    const mergedEvents = mergeRewardEvents(cachedEvents, cloudEvents);

    await cacheRewardEvents(uid, mergedEvents);
    return mergedEvents;
  } catch {
    return cachedEvents;
  }
}

async function performAward(uid, event, options = {}) {
  if (!uid || !event?.id) {
    return false;
  }

  const existingEvents = await loadLocalRewardEvents(uid);
  const eventWasAlreadyAwarded = existingEvents.some((existingEvent) => (
    existingEvent.id === event.id
  ));

  if (eventWasAlreadyAwarded) {
    return false;
  }

  if (options.dailyLimit) {
    const today = new Date().toISOString().slice(0, 10);
    const eventsAwardedToday = existingEvents.filter((existingEvent) => (
      existingEvent.type === event.type
        && existingEvent.awardedAt?.startsWith(today)
    ));

    if (eventsAwardedToday.length >= options.dailyLimit) {
      return false;
    }
  }

  const localEvent = {
    ...event,
    points: Math.max(0, event.points ?? 0),
    awardedAt: new Date().toISOString(),
  };
  const updatedEvents = [localEvent, ...existingEvents];

  await cacheRewardEvents(uid, updatedEvents);
  notifyRewardListeners(uid, updatedEvents);

  if (db) {
    const rewardDocument = doc(db, 'users', uid, 'rewardEvents', event.id);
    const cloudEvent = {
      type: event.type,
      points: localEvent.points,
      label: event.label,
      metadata: event.metadata ?? {},
      awardedAt: serverTimestamp(),
    };

    // The local award should remain available even when the cloud write is offline.
    setDoc(rewardDocument, cloudEvent, { merge: false }).catch(() => undefined);
  }

  return true;
}

export function awardRewardEvent(uid, event, options = {}) {
  // Queue awards per user so two simultaneous actions cannot grant the same
  // reward before either action has finished saving it.
  const previousAward = awardQueues.get(uid) ?? Promise.resolve();
  const nextAward = previousAward
    .catch(() => undefined)
    .then(() => performAward(uid, event, options));

  const trackedAward = nextAward.finally(() => {
    if (awardQueues.get(uid) === trackedAward) {
      awardQueues.delete(uid);
    }
  });

  awardQueues.set(uid, trackedAward);
  return nextAward;
}
