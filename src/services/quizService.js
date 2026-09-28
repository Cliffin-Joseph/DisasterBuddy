import { addDoc, collection, getDocs, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { awardRewardEvent } from './rewardService';
import logger from './logger';

const LOCAL_ATTEMPTS_KEY = 'disasterbuddy.quiz.attempts.v2';

function getAttemptsStorageKey(uid) {
  return `${LOCAL_ATTEMPTS_KEY}.${uid || 'preview'}`;
}

async function loadLocalAttempts(uid) {
  try {
    const storedAttempts = await AsyncStorage.getItem(getAttemptsStorageKey(uid));
    return JSON.parse(storedAttempts) ?? [];
  } catch (error) {
    logger.warn('local_quiz_attempts_load_failed', error, { uid });
    return [];
  }
}

async function cacheAttempts(uid, attempts) {
  await AsyncStorage.setItem(
    getAttemptsStorageKey(uid),
    JSON.stringify(attempts),
  );
}

function convertCloudAttempt(attemptDocument) {
  const data = attemptDocument.data();
  const completedAt = data.completedAt?.toDate?.()?.toISOString() ?? null;

  return {
    id: attemptDocument.id,
    ...data,
    completedAt,
  };
}

function getAttemptSignature(attempt) {
  const completionMinute = attempt.completedAt?.slice(0, 16);
  return `${attempt.quizId}:${attempt.score}:${completionMinute}`;
}

function mergeQuizAttempts(cloudAttempts, localAttempts) {
  const cloudSignatures = new Set(cloudAttempts.map(getAttemptSignature));
  const unsyncedLocalAttempts = localAttempts.filter((attempt) => (
    !cloudSignatures.has(getAttemptSignature(attempt))
  ));

  return [...cloudAttempts, ...unsyncedLocalAttempts].sort((first, second) => {
    const firstDate = first.completedAt ?? '';
    const secondDate = second.completedAt ?? '';
    return secondDate.localeCompare(firstDate);
  });
}

export async function saveQuizAttempt(uid, result) {
  const localAttempt = {
    id: `local-${Date.now()}`,
    ...result,
    completedAt: new Date().toISOString(),
  };
  const localAttempts = await loadLocalAttempts(uid);
  await cacheAttempts(uid, [localAttempt, ...localAttempts]);

  if (uid) {
    const rewardMetadata = {
      quizId: result.quizId,
      percentage: result.percentage,
    };
    await awardRewardEvent(uid, {
      id: `quiz-complete:${localAttempt.id}`,
      type: 'quiz_complete',
      points: 5,
      label: `Completed ${result.quizId} quiz`,
      metadata: rewardMetadata,
    }, { dailyLimit: 3 });

    if (result.passed) {
      await awardRewardEvent(uid, {
        id: `quiz-pass:${localAttempt.id}`,
        type: 'quiz_pass',
        points: 10,
        label: `Passed ${result.quizId} quiz`,
        metadata: rewardMetadata,
      }, { dailyLimit: 3 });
    }

    if (result.percentage === 100) {
      await awardRewardEvent(uid, {
        id: `quiz-perfect:${localAttempt.id}`,
        type: 'quiz_perfect',
        points: 10,
        label: 'Achieved a perfect quiz score',
        metadata: { quizId: result.quizId },
      }, { dailyLimit: 1 });
    }
  }

  if (!db || !uid) {
    return localAttempt.id;
  }

  let attemptRef;

  try {
    attemptRef = await addDoc(collection(db, 'users', uid, 'quizAttempts'), {
      quizId: result.quizId,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      passed: result.passed,
      answers: result.answers,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    logger.warn('quiz_attempt_cloud_save_failed', error, { uid, quizId: result.quizId });
    return localAttempt.id;
  }

  const snapshot = await getDocs(collection(db, 'users', uid, 'quizAttempts'));
  const passedTopicIds = new Set();

  snapshot.docs.forEach((attemptDocument) => {
    const attempt = attemptDocument.data();
    if (attempt.passed && attempt.quizId !== 'mixed') {
      passedTopicIds.add(attempt.quizId);
    }
  });

  if (passedTopicIds.size >= 3) {
    await setDoc(doc(db, 'users', uid, 'achievements', 'knowledge-builder'), {
      achievementId: 'knowledge-builder',
      label: 'Knowledge Builder',
      criterion: 'Pass three topic quizzes',
      earnedAt: serverTimestamp(),
    }, { merge: true });
  }

  return attemptRef.id;
}

export async function loadQuizAttempts(uid, onCached) {
  const localAttempts = await loadLocalAttempts(uid);

  if (localAttempts.length > 0 && onCached) {
    onCached(localAttempts);
  }

  if (!db || !uid) {
    return localAttempts;
  }

  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'quizAttempts'));
    const cloudAttempts = snapshot.docs.map(convertCloudAttempt);
    const mergedAttempts = mergeQuizAttempts(cloudAttempts, localAttempts);
    await cacheAttempts(uid, mergedAttempts);

    const firstAttempt = mergedAttempts[mergedAttempts.length - 1];
    if (firstAttempt) {
      await awardRewardEvent(uid, {
        id: 'quiz-history:first',
        type: 'quiz_complete',
        points: 5,
        label: 'Completed first short quiz',
        metadata: { quizId: firstAttempt.quizId },
      });
    }

    const passedAttempts = mergedAttempts.filter((attempt) => attempt.passed);
    for (const attempt of passedAttempts) {
      await awardRewardEvent(uid, {
        id: `quiz-category-pass:${attempt.quizId}`,
        type: 'quiz_pass',
        points: 10,
        label: `Mastered ${attempt.quizId} basics`,
        metadata: {
          quizId: attempt.quizId,
          percentage: attempt.percentage,
        },
      });
    }

    const hasPerfectScore = mergedAttempts.some((attempt) => (
      attempt.percentage === 100
    ));
    if (hasPerfectScore) {
      await awardRewardEvent(uid, {
        id: 'quiz-history:perfect',
        type: 'quiz_perfect',
        points: 10,
        label: 'Achieved a perfect quiz score',
      });
    }

    return mergedAttempts;
  } catch (error) {
    logger.warn('quiz_history_cloud_load_failed', error, { uid });
    return localAttempts;
  }
}
