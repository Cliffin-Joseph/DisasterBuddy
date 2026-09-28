import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildBadges, buildMastery, buildMissions, getLevelProgress } from '../data/rewardDefinitions';
import { loadRewardEvents, subscribeToRewards } from '../services/rewardService';
import logger from '../services/logger';
import { useAuth } from './useAuth';

const RewardsContext = createContext(null);

export function RewardsProvider({ children }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshRewards = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return [];
    }

    try {
      const loadedEvents = await loadRewardEvents(user.uid, setEvents);
      setEvents(loadedEvents);
      return loadedEvents;
    } catch (error) {
      logger.warn('reward_events_load_failed', error, { uid: user.uid });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    setLoading(true);
    refreshRewards();

    const unsubscribe = subscribeToRewards((changedUserId, updatedEvents) => {
      if (changedUserId === user?.uid) {
        setEvents(updatedEvents);
      }
    });

    return unsubscribe;
  }, [refreshRewards, user?.uid]);

  const contextValue = useMemo(() => {
    let totalPoints = 0;
    events.forEach((event) => {
      totalPoints += event.points ?? 0;
    });

    const badges = buildBadges(events);
    const earnedBadges = badges.filter((badge) => badge.earned);

    return {
      events,
      totalPoints,
      badges,
      earnedBadges,
      missions: buildMissions(events),
      mastery: buildMastery(events),
      level: getLevelProgress(totalPoints),
      loading,
      refresh: refreshRewards,
    };
  }, [events, loading, refreshRewards]);

  return (
    <RewardsContext.Provider value={contextValue}>
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);

  if (!context) {
    throw new Error('useRewards must be used inside RewardsProvider');
  }

  return context;
}
