import { TestBed } from '@angular/core/testing';
import { FuzzySearchService } from './fuzzy-search.service';
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
    tags: ['frontend'],
  },
  {
    id: '2',
    title: 'Docker Containers',
    description: 'Containerize everything',
    category: 'devops',
    priority: 'medium',
    createdAt: new Date(),
    completed: false,
    tags: ['infra', 'docker'],
  },
  {
    id: '3',
    title: 'Testing Best Practices',
    description: 'Write better tests',
    category: 'quality',
    priority: 'low',
    createdAt: new Date(),
    completed: true,
  },
];

describe('FuzzySearchService', () => {
  let service: FuzzySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FuzzySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all items when query is empty', () => {
    expect(service.search(ITEMS, '')).toEqual(ITEMS);
  });

  it('should return all items when query is whitespace only', () => {
    expect(service.search(ITEMS, '   ')).toEqual(ITEMS);
  });

  it('should find items by exact title match', () => {
    const result = service.search(ITEMS, 'Angular Guide');
    expect(result.some((i) => i.id === '1')).toBe(true);
  });

  it('should perform fuzzy matching on title', () => {
    const result = service.search(ITEMS, 'Angulr');
    expect(result.some((i) => i.id === '1')).toBe(true);
  });

  it('should match by category', () => {
    const result = service.search(ITEMS, 'devops');
    expect(result.some((i) => i.id === '2')).toBe(true);
  });

  it('should match by tags', () => {
    const result = service.search(ITEMS, 'docker');
    expect(result.some((i) => i.id === '2')).toBe(true);
  });

  it('should return empty array for no matches', () => {
    expect(service.search(ITEMS, 'xyzabcnotfound12345')).toHaveLength(0);
  });

  it('should work on an empty items array', () => {
    expect(service.search([], 'anything')).toHaveLength(0);
  });
});
