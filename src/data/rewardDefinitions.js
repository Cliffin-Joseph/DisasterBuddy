export const LEVELS = [
  { level: 1, title: 'New Recruit', points: 0 },
  { level: 2, title: 'Preparedness Starter', points: 100 },
  { level: 3, title: 'Safety Scout', points: 300 },
  { level: 4, title: 'Ready Responder', points: 600 },
  { level: 5, title: 'Household Guardian', points: 1000 },
  { level: 6, title: 'Preparedness Champion', points: 1500 },
  { level: 7, title: 'Resilience Leader', points: 2200 },
];

function createBadge(id, title, description, icon, target, progress) {
  return { id, title, description, icon, target, progress };
}

function countEventsOfType(events, eventType) {
  return events.filter((event) => event.type === eventType).length;
}

function countUniqueMetadataValues(events, eventType, metadataField) {
  const uniqueValues = new Set();

  events.forEach((event) => {
    const value = event.metadata?.[metadataField];
    if (event.type === eventType && value) {
      uniqueValues.add(value);
    }
  });

  return uniqueValues.size;
}

function getLargestContactCount(events) {
  let largestCount = 0;

  events.forEach((event) => {
    if (event.type === 'contacts_updated') {
      largestCount = Math.max(largestCount, event.metadata?.count ?? 0);
    }
  });

  return largestCount;
}

function calculateTotalPoints(events) {
  let totalPoints = 0;

  events.forEach((event) => {
    totalPoints += event.points ?? 0;
  });

  return totalPoints;
}

export function buildBadges(events) {
  const completedTierCount = countEventsOfType(events, 'tier_complete');
  const passedQuizCategoryCount = countUniqueMetadataValues(events, 'quiz_pass', 'quizId');
  const emergencyContactCount = getLargestContactCount(events);
  const hasCompletedTierOne = events.some((event) => event.id === 'tier-complete:1');
  const hasCompletedTierTwo = events.some((event) => event.id === 'tier-complete:2');
  const hasCompletedMixedQuiz = events.some((event) => (
    event.type === 'quiz_complete' && event.metadata?.quizId === 'mixed'
  ));

  const badges = [
    createBadge('first-step', 'First Step', 'Start a preparedness task.', '✓', 1, countEventsOfType(events, 'task_started')),
    createBadge('kit-builder', 'Kit Builder', 'Record five individual kit items.', '▣', 5, countEventsOfType(events, 'item_added')),
    createBadge('detail-oriented', 'Detail-Oriented', 'Record details for ten kit items.', '✎', 10, countEventsOfType(events, 'item_added')),
    createBadge('expiry-tracker', 'Expiry Tracker', 'Add five useful expiry dates.', '◷', 5, countEventsOfType(events, 'expiry_added')),
    createBadge('essential-kit', 'Essential Kit Complete', 'Complete preparedness Tier 1.', '1', 1, hasCompletedTierOne ? 1 : 0),
    createBadge('household-planner', 'Household Planner', 'Complete preparedness Tier 2.', '2', 1, hasCompletedTierTwo ? 1 : 0),
    createBadge('fully-prepared', 'Fully Prepared', 'Complete every preparedness tier.', '★', 3, completedTierCount),
    createBadge('curious-learner', 'Curious Learner', 'Finish your first short quiz.', '?', 1, countEventsOfType(events, 'quiz_complete')),
    createBadge('perfect-score', 'Perfect Score', 'Achieve 100% on a quiz.', '100', 1, countEventsOfType(events, 'quiz_perfect')),
    createBadge('quiz-explorer', 'Quiz Explorer', 'Complete a mixed-topic quiz.', '∞', 1, hasCompletedMixedQuiz ? 1 : 0),
    createBadge('knowledge-builder', 'Knowledge Builder', 'Pass three different topic quizzes.', '3', 3, passedQuizCategoryCount),
    createBadge('all-round-learner', 'All-Round Learner', 'Pass all seven topic categories.', '7', 7, passedQuizCategoryCount),
    createBadge('introductions', 'Introductions Complete', 'Complete your personal profile.', 'P', 1, countEventsOfType(events, 'profile_personal')),
    createBadge('household-ready', 'Household Ready', 'Record useful household information.', 'H', 1, countEventsOfType(events, 'profile_household')),
    createBadge('support-network', 'Support Network', 'Add your first emergency contact.', 'SOS', 1, emergencyContactCount),
    createBadge('connected-household', 'Connected Household', 'Maintain three emergency contacts.', '3', 3, emergencyContactCount),
    createBadge('profile-complete', 'Profile Complete', 'Complete all core profile areas.', '✓', 1, countEventsOfType(events, 'profile_complete')),
    createBadge('monthly-reviewer', 'Monthly Reviewer', 'Review a completed kit task this month.', '↻', 1, countEventsOfType(events, 'maintenance_review')),
    createBadge('maintenance-streak', 'Maintenance Streak', 'Review preparedness across three different months.', '3M', 3, countUniqueMetadataValues(events, 'maintenance_review', 'month')),
    createBadge('preparedness-champion', 'Preparedness Champion', 'Earn 1,500 Preparedness Points.', '◆', 1500, calculateTotalPoints(events)),
  ];

  return badges.map((badgeItem) => {
    const cappedProgress = Math.min(badgeItem.target, badgeItem.progress);
    return {
      ...badgeItem,
      progress: cappedProgress,
      earned: badgeItem.progress >= badgeItem.target,
    };
  });
}

export function getLevelProgress(totalPoints) {
  const levelsFromHighestToLowest = [...LEVELS].reverse();
  const currentLevel = levelsFromHighestToLowest.find((level) => (
    totalPoints >= level.points
  )) ?? LEVELS[0];

  const nextLevel = LEVELS.find((level) => (
    level.level === currentLevel.level + 1
  )) ?? null;

  let percentage = 100;
  if (nextLevel) {
    const pointsEarnedInCurrentLevel = totalPoints - currentLevel.points;
    const pointsNeededForNextLevel = nextLevel.points - currentLevel.points;
    percentage = Math.round((pointsEarnedInCurrentLevel / pointsNeededForNextLevel) * 100);
  }

  return {
    current: currentLevel,
    next: nextLevel,
    percentage: Math.max(0, Math.min(100, percentage)),
  };
}

export function buildMissions(events) {
  const hasEventOfType = (eventType) => events.some((event) => event.type === eventType);
  const emergencyContactCount = getLargestContactCount(events);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const missions = [
    { id: 'starter-task', title: 'Begin your plan', description: 'Start one preparedness task.', progress: hasEventOfType('task_started') ? 1 : 0, target: 1 },
    { id: 'starter-quiz', title: 'Test your knowledge', description: 'Complete one short quiz.', progress: hasEventOfType('quiz_complete') ? 1 : 0, target: 1 },
    { id: 'starter-contact', title: 'Build your support network', description: 'Add an emergency contact.', progress: Math.min(1, emergencyContactCount), target: 1 },
    { id: 'monthly-review', title: 'Monthly readiness check', description: 'Review one completed preparedness task this month.', progress: events.some((event) => event.type === 'maintenance_review' && event.metadata?.month === currentMonth) ? 1 : 0, target: 1 },
  ];

  return missions.map((mission) => ({
    ...mission,
    completed: mission.progress >= mission.target,
  }));
}

const masteryTopics = ['fire', 'flood', 'haze', 'power-outage', 'evacuation', 'kit-maintenance', 'emergency-contacts'];
export function buildMastery(events) {
  return masteryTopics.map((quizId) => {
    const relevantEvents = events.filter((event) => {
      const isQuizResult = event.type === 'quiz_complete' || event.type === 'quiz_pass';
      return isQuizResult && event.metadata?.quizId === quizId;
    });

    const percentages = relevantEvents.map((event) => event.metadata?.percentage ?? 0);
    const bestScore = Math.max(0, ...percentages);
    const completedAttempts = relevantEvents.filter((event) => event.type === 'quiz_complete');
    const successfulPasses = relevantEvents.filter((event) => (
      event.type === 'quiz_pass' && event.id.startsWith('quiz-pass:')
    ));
    const hasPassed = relevantEvents.some((event) => event.type === 'quiz_pass');

    let masteryLevel = 'Unexplored';
    if (successfulPasses.length >= 2 && bestScore >= 80) {
      masteryLevel = 'Mastered';
    } else if (hasPassed) {
      masteryLevel = 'Proficient';
    } else if (bestScore >= 50) {
      masteryLevel = 'Learning';
    }

    return {
      quizId,
      title: quizId.replaceAll('-', ' '),
      bestScore,
      attempts: completedAttempts.length,
      level: masteryLevel,
    };
  });
}
