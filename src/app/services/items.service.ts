import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { groupBy } from 'lodash-es';
import { Item, Priority } from '../models/item.model';
import { formatDate } from '../utils/format';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'appbench_items';

const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    title: 'Design system setup',
    description: 'Set up base design tokens and styles',
    category: 'design',
    priority: 'high',
    createdAt: new Date('2024-01-10'),
    completed: true,
    tags: ['ui', 'tokens'],
  },
  {
    id: '2',
    title: 'API integration',
    description: 'Connect frontend with REST endpoints',
    category: 'development',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    completed: false,
    dueDate: new Date('2024-03-01'),
    tags: ['backend', 'rest'],
  },
  {
    id: '3',
    title: 'Unit test coverage',
    description: 'Increase test coverage to 80%',
    category: 'quality',
    priority: 'medium',
    createdAt: new Date('2024-01-20'),
    completed: false,
    dueDate: new Date('2024-04-15'),
    tags: ['testing'],
  },
  {
    id: '4',
    title: 'Performance audit',
    description: 'Run Lighthouse audit and fix issues',
    category: 'performance',
    priority: 'low',
    createdAt: new Date('2024-02-01'),
    completed: false,
    tags: ['lighthouse', 'perf'],
  },
];

function reviveDates(items: Item[]): Item[] {
  return items.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
  }));
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private storageService = inject(StorageService);

  private loadInitial(): Item[] {
    const stored = this.storageService.get<Item[]>(STORAGE_KEY, []);
    if (stored.length > 0) return reviveDates(stored);
    return INITIAL_ITEMS;
  }

  private itemsSubject = new BehaviorSubject<Item[]>(this.loadInitial());

  readonly items$: Observable<Item[]> = this.itemsSubject.asObservable();

  readonly completedCount$: Observable<number> = this.items$.pipe(
    map((items) => items.filter((i) => i.completed).length),
  );

  readonly pendingCount$: Observable<number> = this.items$.pipe(
    map((items) => items.filter((i) => !i.completed).length),
  );

  readonly overdueItems$: Observable<Item[]> = this.items$.pipe(
    map((items) => {
      const now = new Date();
      return items.filter((i) => !i.completed && i.dueDate !== undefined && i.dueDate < now);
    }),
  );

  get items(): Item[] {
    return this.itemsSubject.value;
  }

  private persist(): void {
    this.storageService.set(STORAGE_KEY, this.itemsSubject.value);
  }

  add(item: Omit<Item, 'id' | 'createdAt'>): void {
    const newItem: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.itemsSubject.next([...this.itemsSubject.value, newItem]);
    this.persist();
  }

  toggle(id: string): void {
    const updated = this.itemsSubject.value.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    this.itemsSubject.next(updated);
    this.persist();
  }

  remove(id: string): void {
    this.itemsSubject.next(this.itemsSubject.value.filter((item) => item.id !== id));
    this.persist();
  }

  removeMany(ids: string[]): void {
    const idSet = new Set(ids);
    this.itemsSubject.next(this.itemsSubject.value.filter((item) => !idSet.has(item.id)));
    this.persist();
  }

  update(id: string, changes: Partial<Omit<Item, 'id' | 'createdAt'>>): void {
    const updated = this.itemsSubject.value.map((item) =>
      item.id === id ? { ...item, ...changes } : item,
    );
    this.itemsSubject.next(updated);
    this.persist();
  }

  completeMany(ids: string[]): void {
    const idSet = new Set(ids);
    const updated = this.itemsSubject.value.map((item) =>
      idSet.has(item.id) ? { ...item, completed: true } : item,
    );
    this.itemsSubject.next(updated);
    this.persist();
  }

  groupedByCategory(): Record<string, Item[]> {
    return groupBy(this.itemsSubject.value, 'category');
  }

  groupedByPriority(): Record<Priority, Item[]> {
    return groupBy(this.itemsSubject.value, 'priority') as Record<Priority, Item[]>;
  }

  getFormattedDate(item: Item): string {
    return formatDate(item.createdAt);
  }

  clearStorage(): void {
    this.storageService.remove(STORAGE_KEY);
  }
}
