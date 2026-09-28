import { buildBadges, getLevelProgress } from '../src/data/rewardDefinitions';

describe('reward progression', () => {
  test('badge identifiers remain unique', () => { const badges = buildBadges([]); expect(new Set(badges.map((badge) => badge.id)).size).toBe(badges.length); });
  test('badge progress is capped at its target', () => { const events = Array.from({ length: 8 }, (_, index) => ({ id: `item-${index}`, type: 'item_added', points: 3 })); const badge = buildBadges(events).find((item) => item.id === 'kit-builder'); expect(badge.progress).toBe(5); expect(badge.earned).toBe(true); });
  test('level progress finds the current and next rank', () => { const progress = getLevelProgress(350); expect(progress.current.title).toBe('Safety Scout'); expect(progress.next.title).toBe('Ready Responder'); expect(progress.percentage).toBeGreaterThan(0); });
});
