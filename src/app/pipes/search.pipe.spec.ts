import { SearchPipe } from './search.pipe';
import { Item } from '../models/item.model';

const ITEMS: Item[] = [
  {
    id: '1',
    title: 'Angular Guide',
    description: 'Learn Angular deeply',
    category: 'dev',
    priority: 'high',
    createdAt: new Date(),
    completed: false,
  },
  {
    id: '2',
    title: 'Testing Basics',
    description: 'Write better tests',
    category: 'quality',
    priority: 'medium',
    createdAt: new Date(),
    completed: true,
  },
  {
    id: '3',
    title: 'Docker Intro',
    description: 'Containers made easy',
    category: 'devops',
    priority: 'low',
    createdAt: new Date(),
    completed: false,
  },
];

describe('SearchPipe', () => {
  let pipe: SearchPipe;

  beforeEach(() => {
    pipe = new SearchPipe();
  });

  it('should return all items when query is empty', () => {
    expect(pipe.transform(ITEMS, '')).toEqual(ITEMS);
  });

  it('should return all items when query is whitespace only', () => {
    expect(pipe.transform(ITEMS, '   ')).toEqual(ITEMS);
  });

  it('should return empty array for null input', () => {
    expect(pipe.transform(null, 'test')).toEqual([]);
  });

  it('should filter by title (case-insensitive)', () => {
    const result = pipe.transform(ITEMS, 'angular');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by title with mixed case', () => {
    const result = pipe.transform(ITEMS, 'DOCKER');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should filter by description', () => {
    const result = pipe.transform(ITEMS, 'containers');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should filter by category', () => {
    const result = pipe.transform(ITEMS, 'quality');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should return multiple matching items', () => {
    // Both 'dev' and 'devops' categories contain 'dev'
    const result = pipe.transform(ITEMS, 'dev');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should return empty array when no items match', () => {
    expect(pipe.transform(ITEMS, 'xyznotfound')).toHaveLength(0);
  });
});
