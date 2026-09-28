import { getDaysUntilExpiry, getExpiryState, parseExpiryDate } from '../src/utils/expiryUtils';

describe('expiry utilities', () => {
  const now = new Date('2026-08-18T12:00:00');
  test('handles missing and malformed dates safely', () => { expect(parseExpiryDate('')).toBeNull(); expect(parseExpiryDate('not-a-date')).toBeNull(); expect(getExpiryState(null, now)).toBe('none'); });
  test('classifies a past date as expired', () => expect(getExpiryState('2026-08-17', now)).toBe('expired'));
  test('classifies today and warning boundary as soon', () => { expect(getExpiryState('2026-08-18', now)).toBe('soon'); expect(getExpiryState('2026-09-17', now, 30)).toBe('soon'); });
  test('classifies dates beyond the threshold as current', () => expect(getExpiryState('2026-09-18', now, 30)).toBe('current'));
  test('returns whole remaining calendar-day coverage', () => expect(getDaysUntilExpiry('2026-08-19', now)).toBe(1));
});
