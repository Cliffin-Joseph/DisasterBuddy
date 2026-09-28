import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { updateAccountDisplayName } from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { awardRewardEvent } from './rewardService';
import * as FileSystem from 'expo-file-system/legacy';

function getProfileCacheKey(uid) {
  return `disasterbuddy.profile.v1.${uid}`;
}

function getProfilePhotoKey(uid) {
  return `disasterbuddy.profile.photo.v1.${uid}`;
}

async function cacheProfile(uid, profileData) {
  await AsyncStorage.setItem(
    getProfileCacheKey(uid),
    JSON.stringify(profileData),
  );
}

export async function loadCachedProfile(uid) {
  try {
    const cachedProfile = await AsyncStorage.getItem(getProfileCacheKey(uid));
    return JSON.parse(cachedProfile);
  } catch {
    return null;
  }
}

export async function loadProfilePhoto(uid) {
  return AsyncStorage.getItem(getProfilePhotoKey(uid));
}

export async function saveProfilePhoto(uid, uri) {
  const photoStorageKey = getProfilePhotoKey(uid);

  if (!uri) {
    await AsyncStorage.removeItem(photoStorageKey);
    return null;
  }

  const photoIsAlreadyPersistent = !FileSystem.documentDirectory
    || uri.startsWith(FileSystem.documentDirectory);

  if (photoIsAlreadyPersistent) {
    await AsyncStorage.setItem(photoStorageKey, uri);
    return uri;
  }

  const destination = `${FileSystem.documentDirectory}profile-${uid}.jpg`;
  await FileSystem.deleteAsync(destination, { idempotent: true });
  await FileSystem.copyAsync({ from: uri, to: destination });
  await AsyncStorage.setItem(photoStorageKey, destination);
  return destination;
}

async function awardProfileProgress(uid, profile, contacts) {
  const personalDetailsAreComplete = Boolean(
    profile.displayName?.trim() && profile.phone?.trim(),
  );
  const hasHouseholdContext = Boolean(
    profile.homeArea?.trim()
      || profile.accessibilityNeeds?.trim()
      || profile.pets?.trim()
      || profile.householdNotes?.trim(),
  );
  const householdDetailsAreComplete = Boolean(
    profile.householdSize && hasHouseholdContext,
  );
  const profileIsComplete = Boolean(
    personalDetailsAreComplete && profile.householdSize && contacts.length > 0,
  );

  if (personalDetailsAreComplete) {
    await awardRewardEvent(uid, {
      id: 'profile:personal',
      type: 'profile_personal',
      points: 20,
      label: 'Completed personal profile',
    });
  }

  if (householdDetailsAreComplete) {
    await awardRewardEvent(uid, {
      id: 'profile:household',
      type: 'profile_household',
      points: 20,
      label: 'Completed household profile',
    });
  }

  if (contacts.length > 0) {
    await awardRewardEvent(uid, {
      id: `contacts-count:${contacts.length}`,
      type: 'contacts_updated',
      points: contacts.length === 1 ? 15 : 0,
      label: 'Emergency contact network recorded',
      metadata: { count: contacts.length },
    });
  }

  if (profileIsComplete) {
    await awardRewardEvent(uid, {
      id: 'profile:complete',
      type: 'profile_complete',
      points: 25,
      label: 'Completed preparedness profile',
    });
  }
}

export async function loadProfile(uid, onCached) {
  const cachedProfile = await loadCachedProfile(uid);
  if (cachedProfile && onCached) {
    onCached(cachedProfile);
  }

  const [profileSnapshot, contactsSnapshot] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDocs(collection(db, 'users', uid, 'emergencyContacts')),
  ]);

  const profileData = {
    profile: profileSnapshot.exists() ? profileSnapshot.data() : {},
    contacts: contactsSnapshot.docs.map((contactDocument) => ({
      id: contactDocument.id,
      ...contactDocument.data(),
    })),
  };

  await cacheProfile(uid, profileData);
  await awardProfileProgress(uid, profileData.profile, profileData.contacts);
  return profileData;
}

export async function saveProfile(uid, profile) {
  const householdSize = profile.householdSize === '' ? null : Number(profile.householdSize);
  const validHouseholdSize = Number.isFinite(householdSize) ? householdSize : null;
  const storedProfile = {
    ...profile,
    householdSize: validHouseholdSize,
    updatedAt: serverTimestamp(),
  };

  await Promise.all([
    setDoc(doc(db, 'users', uid), storedProfile, { merge: true }),
    updateAccountDisplayName(profile.displayName),
  ]);

  const cachedProfile = await loadCachedProfile(uid);
  const contacts = cachedProfile?.contacts ?? [];
  const updatedProfile = {
    ...(cachedProfile?.profile ?? {}),
    ...profile,
    householdSize: validHouseholdSize,
  };

  await cacheProfile(uid, { profile: updatedProfile, contacts });
  await awardProfileProgress(uid, updatedProfile, contacts);
}

export async function saveEmergencyContact(uid, contact) {
  const storedContact = {
    name: contact.name.trim(),
    relationship: contact.relationship.trim(),
    phone: contact.phone.trim(),
    email: contact.email.trim(),
    notes: contact.notes.trim(),
    updatedAt: serverTimestamp(),
  };

  if (contact.id) {
    const contactDocument = doc(db, 'users', uid, 'emergencyContacts', contact.id);
    await setDoc(contactDocument, storedContact, { merge: true });

    const cachedProfile = await loadCachedProfile(uid);
    const updatedContacts = (cachedProfile?.contacts ?? []).map((cachedContact) => (
      cachedContact.id === contact.id
        ? { ...cachedContact, ...storedContact }
        : cachedContact
    ));
    await cacheProfile(uid, {
      profile: cachedProfile?.profile ?? {},
      contacts: updatedContacts,
    });
    return contact.id;
  }

  const contactsCollection = collection(db, 'users', uid, 'emergencyContacts');
  const createdContact = await addDoc(contactsCollection, {
    ...storedContact,
    createdAt: serverTimestamp(),
  });
  const cachedProfile = await loadCachedProfile(uid);
  const updatedContacts = [
    { id: createdContact.id, ...storedContact },
    ...(cachedProfile?.contacts ?? []),
  ];

  await cacheProfile(uid, {
    profile: cachedProfile?.profile ?? {},
    contacts: updatedContacts,
  });
  await awardRewardEvent(uid, {
    id: `contact-added:${createdContact.id}`,
    type: 'contact_added',
    points: 5,
    label: `Added emergency contact ${storedContact.name}`,
  });
  await awardProfileProgress(uid, cachedProfile?.profile ?? {}, updatedContacts);
  return createdContact.id;
}

export async function removeEmergencyContact(uid, contactId) {
  await deleteDoc(doc(db, 'users', uid, 'emergencyContacts', contactId));
  const cachedProfile = await loadCachedProfile(uid);
  const remainingContacts = (cachedProfile?.contacts ?? []).filter((contact) => (
    contact.id !== contactId
  ));

  await cacheProfile(uid, {
    profile: cachedProfile?.profile ?? {},
    contacts: remainingContacts,
  });
}
