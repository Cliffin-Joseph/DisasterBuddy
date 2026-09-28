import { createDefaultChecklistState, mergeChecklistDefinitions } from '../src/data/checklistDefinitions';

const definitions = [{ id: 'water', tier: 1, title: 'Water' }, { id: 'food', tier: 1, title: 'Food' }];
describe('checklist definition/state merge', () => {
  test('creates safe defaults when records are missing', () => expect(createDefaultChecklistState(definitions[0])).toMatchObject({ completed: false, quantity: '', items: [], status: 'not_started' }));
  test('ignores unknown cloud IDs and preserves catalogue order', () => expect(mergeChecklistDefinitions(definitions, [{ itemId: 'unknown', completed: true }]).map((item) => item.id)).toEqual(['water', 'food']));
  test('restores completed records', () => expect(mergeChecklistDefinitions(definitions, [{ itemId: 'water', completed: true, quantity: 12 }])[0]).toMatchObject({ completed: true, quantity: '12', status: 'current_reviewed' }));
  test('marks partially entered records in progress', () => expect(mergeChecklistDefinitions(definitions, [{ itemId: 'food', completed: false, items: [{ id: 'rice' }], progressStep: 2 }])[1].status).toBe('in_progress'));
  test('clamps malformed carousel progress', () => expect(mergeChecklistDefinitions(definitions, [{ itemId: 'water', progressStep: 99 }])[0].progressStep).toBe(3));
});
