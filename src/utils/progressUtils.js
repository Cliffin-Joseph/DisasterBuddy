export function isTaskComplete(task) {
  return task?.completed === true || task?.status === 'current_reviewed';
}

export function calculateTierProgress(tasks = [], tiers = [1, 2, 3]) {
  const progressByTier = {};

  for (const tier of tiers) {
    let total = 0;
    let completed = 0;

    for (const task of tasks) {
      if (task?.tier !== tier) {
        continue;
      }

      total += 1;
      if (isTaskComplete(task)) {
        completed += 1;
      }
    }

    const percentage = total > 0
      ? Math.round((completed / total) * 100)
      : 0;

    progressByTier[tier] = {
      completed,
      total,
      percentage,
    };
  }

  return progressByTier;
}

export function calculateOverallProgress(tasks = []) {
  if (!tasks.length) return { completed: 0, total: 0, percentage: 0 };
  let completed = 0;

  for (const task of tasks) {
    if (isTaskComplete(task)) {
      completed += 1;
    }
  }

  return {
    completed,
    total: tasks.length,
    percentage: Math.round((completed / tasks.length) * 100),
  };
}

export function calculateUnlockedTier(tierProgress, previouslyUnlocked = 1) {
  let unlockedFromProgress = 1;

  if (tierProgress?.[1]?.percentage === 100) {
    unlockedFromProgress = 2;
  }

  if (tierProgress?.[2]?.percentage === 100) {
    unlockedFromProgress = 3;
  }

  const validPreviousTier = Math.max(1, Math.min(previouslyUnlocked, 3));
  return Math.max(validPreviousTier, unlockedFromProgress);
}

export function getRecommendedNextTask(tasks = [], tier = 1) {
  return tasks.find((task) => task?.tier === tier && !isTaskComplete(task)) ?? null;
}
