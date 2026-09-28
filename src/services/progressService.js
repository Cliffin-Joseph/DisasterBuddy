import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function loadProgressProfile(uid) {
  if (!db || !uid) {
    return { highestUnlockedTier: 1, achievements: [] };
  }

  const [userSnapshot, achievementsSnapshot] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDocs(collection(db, 'users', uid, 'achievements')),
  ]);

  const storedTier = userSnapshot.data()?.highestUnlockedTier ?? 1;
  const highestUnlockedTier = Math.max(1, Math.min(3, storedTier));
  const achievements = achievementsSnapshot.docs.map((achievementDocument) => ({
    id: achievementDocument.id,
    ...achievementDocument.data(),
  }));

  return { highestUnlockedTier, achievements };
}

export async function persistTierAchievement(uid, completedTier, highestUnlockedTier) {
  if (!db || !uid) {
    return;
  }

  const userDocument = doc(db, 'users', uid);
  const achievementRef = doc(db, 'users', uid, 'achievements', `tier-${completedTier}`);
  const achievementSnapshot = await getDoc(achievementRef);

  await updateDoc(userDocument, { highestUnlockedTier });

  if (!achievementSnapshot.exists()) {
    await setDoc(achievementRef, {
      achievementId: `tier-${completedTier}`,
      tier: completedTier,
      label: `Tier ${completedTier} complete`,
      earnedAt: serverTimestamp(),
    });
  }
}
