import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

function timestampToDateString(value) {
  if (!value?.toDate) {
    return '';
  }

  const date = value.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateStringToTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
}

function convertStoredItem(item) {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    quantity: item.quantity,
    expiryDate: timestampToDateString(item.expiryDate),
  };
}

function convertItemForStorage(item) {
  return {
    id: item.id,
    category: item.category,
    name: item.name.trim(),
    quantity: Number(item.quantity),
    expiryDate: item.expiryDate
      ? dateStringToTimestamp(item.expiryDate)
      : null,
  };
}

export async function loadChecklistRecords(uid) {
  if (!db || !uid) {
    return [];
  }

  const snapshot = await getDocs(collection(db, 'users', uid, 'checklistItems'));

  return snapshot.docs.map((itemDocument) => {
    const data = itemDocument.data();
    return {
      itemId: itemDocument.id,
      completed: data.completed === true,
      quantity: typeof data.quantity === 'number' ? data.quantity : null,
      expiryDate: timestampToDateString(data.expiryDate),
      items: Array.isArray(data.items) ? data.items.map(convertStoredItem) : [],
      progressStep: Number.isInteger(data.progressStep) ? data.progressStep : 0,
      knowledgePassed: data.knowledgePassed === true,
    };
  });
}

export async function saveChecklistRecord(uid, task) {
  if (!db || !uid) {
    return;
  }

  const numericQuantity = task.quantity === '' || task.quantity == null
    ? 0
    : Number(task.quantity);

  if (!Number.isFinite(numericQuantity) || numericQuantity < 0) {
    throw new Error('Quantity must be a zero or positive number.');
  }

  const checklistDocument = doc(db, 'users', uid, 'checklistItems', task.id);
  const storedItems = Array.isArray(task.items)
    ? task.items.map(convertItemForStorage)
    : [];
  const storedRecord = {
    itemId: task.id,
    completed: task.status === 'current_reviewed' || task.completed === true,
    quantity: numericQuantity,
    expiryDate: task.requiresExpiry ? dateStringToTimestamp(task.expiryDate) : null,
    items: storedItems,
    progressStep: Number.isInteger(task.progressStep) ? task.progressStep : 0,
    knowledgePassed: task.knowledgePassed === true,
    updatedAt: serverTimestamp(),
  };

  await setDoc(checklistDocument, storedRecord);
}
