import { SortPipe } from './sort.pipe';
import { Item } from '../models/item.model';

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: '1',
  title: 'Default',
  description: '',
  category: 'general',
  priority: 'medium',
  createdAt: new Date('2024-01-01'),
  completed: false,
  ...overrides,
});

const ITEMS: Item[] = [
  makeItem({ id: '1', title: 'Banana', priority: 'low', createdAt: new Date('2024-03-01') }),
  makeItem({ id: '2', title: 'Apple', priority: 'high', createdAt: new Date('2024-01-01') }),
  makeItem({ id: '3', title: 'Cherry', priority: 'medium', createdAt: new Date('2024-02-01') }),
];

describe('SortPipe', () => {
  let pipe: SortPipe;

  beforeEach(() => {
    pipe = new SortPipe();
  });

  it('should return empty array for null input', () => {
    expect(pipe.transform(null, 'title')).toEqual([]);
  });

  it('should return empty array for empty input', () => {
    expect(pipe.transform([], 'title')).toEqual([]);
  });

  it('should sort by title ascending', () => {
    const result = pipe.transform(ITEMS, 'title', 'asc');
    expect(result.map((i) => i.title)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('should sort by title descending', () => {
    const result = pipe.transform(ITEMS, 'title', 'desc');
    expect(result.map((i) => i.title)).toEqual(['Cherry', 'Banana', 'Apple']);
  });

  it('should sort by createdAt ascending', () => {
    const result = pipe.transform(ITEMS, 'createdAt', 'asc');
    expect(result[0].id).toBe('2'); // Jan
    expect(result[2].id).toBe('1'); // Mar
  });

  it('should sort by createdAt descending', () => {
    const result = pipe.transform(ITEMS, 'createdAt', 'desc');
    expect(result[0].id).toBe('1'); // Mar
    expect(result[2].id).toBe('2'); // Jan
  });

  it('should sort by priority ascending (high first)', () => {
    const result = pipe.transform(ITEMS, 'priority', 'asc');
    expect(result[0].priority).toBe('high');
    expect(result[2].priority).toBe('low');
  });

  it('should sort by priority descending (low first)', () => {
    const result = pipe.transform(ITEMS, 'priority', 'desc');
    expect(result[0].priority).toBe('low');
    expect(result[2].priority).toBe('high');
  });

  it('should default direction to asc', () => {
    const result = pipe.transform(ITEMS, 'title');
    expect(result[0].title).toBe('Apple');
  });

  it('should not mutate the original array', () => {
    const original = [...ITEMS];
    pipe.transform(ITEMS, 'title', 'desc');
    expect(ITEMS).toEqual(original);
  });
});
