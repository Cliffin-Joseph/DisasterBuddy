import { updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import logger from './logger';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadProfileImage(uid, asset) {
  if (!uid || !storage) throw new Error('Profile-image storage is unavailable.');
  const contentType = asset.mimeType || 'image/jpeg';
  if (!allowedTypes.has(contentType)) throw new Error('Choose a JPEG, PNG, or WebP image.');
  if (asset.fileSize && asset.fileSize >= MAX_PROFILE_IMAGE_BYTES) throw new Error('Profile pictures must be smaller than 5 MB.');

  try {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error('The selected image could not be read.');
    const blob = await response.blob();
    if (blob.size >= MAX_PROFILE_IMAGE_BYTES) throw new Error('Profile pictures must be smaller than 5 MB.');
    const imageRef = ref(storage, `users/${uid}/profile/avatar.jpg`);
    await uploadBytes(imageRef, blob, { contentType, cacheControl: 'public,max-age=3600' });
    const downloadURL = await getDownloadURL(imageRef);
    await Promise.all([
      setDoc(doc(db, 'users', uid), { photoURL: downloadURL, profileImageUpdatedAt: serverTimestamp() }, { merge: true }),
      auth.currentUser?.uid === uid ? updateProfile(auth.currentUser, { photoURL: downloadURL }) : Promise.resolve(),
    ]);
    logger.info('profile_image_uploaded', { uid });
    return downloadURL;
  } catch (error) {
    logger.error('profile_image_upload_failed', error, { uid });
    throw error;
  }
}

export async function deleteProfileImage(uid, photoURL) {
  if (!uid || !storage) return;
  try {
    if (photoURL?.includes('/o/')) await deleteObject(ref(storage, decodeURIComponent(photoURL.split('/o/')[1].split('?')[0]))).catch(() => undefined);
    await setDoc(doc(db, 'users', uid), { photoURL: null, profileImageUpdatedAt: serverTimestamp() }, { merge: true });
    if (auth.currentUser?.uid === uid) await updateProfile(auth.currentUser, { photoURL: null });
    logger.info('profile_image_deleted', { uid });
  } catch (error) {
    logger.error('profile_image_delete_failed', error, { uid });
    throw error;
  }
}
