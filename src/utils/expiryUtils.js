export const EXPIRY_WARNING_DAYS = 30;

export function parseExpiryDate(expiryDate, endOfDay = true) {
  if (!expiryDate || typeof expiryDate !== 'string') {
    return null;
  }

  const time = endOfDay ? '23:59:59' : '00:00:00';
  const parsedDate = new Date(`${expiryDate}T${time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function getDaysUntilExpiry(expiryDate, now = new Date()) {
  const expiry = parseExpiryDate(expiryDate, false);
  if (!expiry) {
    return null;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceInMilliseconds = expiry.getTime() - today.getTime();
  return Math.round(differenceInMilliseconds / millisecondsPerDay);
}

export function getExpiryState(expiryDate, now = new Date(), warningDays = EXPIRY_WARNING_DAYS) {
  const days = getDaysUntilExpiry(expiryDate, now);
  if (days === null) {
    return 'none';
  }

  if (days < 0) {
    return 'expired';
  }

  if (days <= warningDays) {
    return 'soon';
  }

  return 'current';
}
