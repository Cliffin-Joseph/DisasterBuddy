import { calculateOverallProgress, calculateTierProgress, calculateUnlockedTier, getRecommendedNextTask } from '../src/utils/progressUtils';

const task = (id, tier, completed = false) => ({ id, tier, completed, status: completed ? 'current_reviewed' : 'not_started' });
describe('progress utilities', () => {
  test('empty catalogues return zero progress', () => expect(calculateOverallProgress([])).toEqual({ completed: 0, total: 0, percentage: 0 }));
  test('calculates partial and complete tier percentages', () => { const result = calculateTierProgress([task('a', 1, true), task('b', 1), task('c', 2, true)]); expect(result[1]).toEqual({ completed: 1, total: 2, percentage: 50 }); expect(result[2].percentage).toBe(100); expect(result[3].percentage).toBe(0); });
  test('unlocks tiers sequentially and preserves earned access', () => { expect(calculateUnlockedTier({ 1: { percentage: 100 }, 2: { percentage: 0 } }, 1)).toBe(2); expect(calculateUnlockedTier({ 1: { percentage: 0 }, 2: { percentage: 0 } }, 3)).toBe(3); });
  test('returns the first incomplete task in the active tier', () => expect(getRecommendedNextTask([task('a', 1, true), task('b', 1), task('c', 2)], 1).id).toBe('b'));
});
