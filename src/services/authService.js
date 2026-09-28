import {
  EmailAuthProvider, createUserWithEmailAndPassword, linkWithCredential, onAuthStateChanged,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import logger from './logger';

async function ensureUserDocument(user, extra = {}) {
  const userDocument = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userDocument);
  const accountFields = {
    email: user.email ?? extra.email ?? '',
    displayName: user.displayName ?? extra.displayName ?? '',
    authProvider: user.isAnonymous ? 'anonymous' : 'password',
    lastActiveAt: serverTimestamp(),
  };

  if (snapshot.exists()) {
    await setDoc(userDocument, accountFields, { merge: true });
    return;
  }

  await setDoc(userDocument, {
    ...accountFields,
    createdAt: serverTimestamp(),
    highestUnlockedTier: 1,
    schemaVersion: 2,
  });
}

export function observeSession(onChange, onError) {
  if (!auth || !db) {
    return () => undefined;
  }

  async function handleSessionChange(currentUser) {
    // Navigation should respond immediately. The Firestore profile can sync
    // afterward without leaving a signed-in user on the login screen.
    onChange(currentUser);

    if (!currentUser || currentUser.isAnonymous) {
      return;
    }

    try {
      await ensureUserDocument(currentUser);
    } catch (error) {
      logger.warn('auth_profile_sync_failed', error, { uid: currentUser.uid });
    }
  }

  function handleSessionError(error) {
    onError(error.message);
  }

  return onAuthStateChanged(auth, handleSessionChange, handleSessionError);
}

export async function logInWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

  try {
    await ensureUserDocument(credential.user);
  } catch (error) {
    logger.warn('login_profile_sync_failed', error, { uid: credential.user.uid });
  }

  return credential.user;
}

export async function signUpWithEmail(displayName, email, password) {
  const trimmedDisplayName = displayName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  let credential;

  if (auth.currentUser?.isAnonymous) {
    const emailCredential = EmailAuthProvider.credential(normalizedEmail, password);
    credential = await linkWithCredential(auth.currentUser, emailCredential);
  } else {
    credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  }

  await updateProfile(credential.user, { displayName: trimmedDisplayName });

  try {
    await ensureUserDocument(credential.user, {
      displayName: trimmedDisplayName,
      email: normalizedEmail,
    });
  } catch (error) {
    logger.warn('signup_profile_sync_failed', error, { uid: credential.user.uid });
  }

  return credential.user;
}

export function requestPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export function logOut() {
  return signOut(auth);
}

export async function updateAccountDisplayName(displayName) {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: displayName.trim() });
  }
}
