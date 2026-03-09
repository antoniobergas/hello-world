import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { groupBy } from 'lodash-es';
import { Item, Priority } from '../models/item.model';
import { formatDate } from '../utils/format';

const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    title: 'Design system setup',
    description: 'Set up base design tokens and styles',
    category: 'design',
    priority: 'high',
    createdAt: new Date('2024-01-10'),
    completed: true,
  },
  {
    id: '2',
    title: 'API integration',
    description: 'Connect frontend with REST endpoints',
    category: 'development',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    completed: false,
  },
  {
    id: '3',
    title: 'Unit test coverage',
    description: 'Increase test coverage to 80%',
    category: 'quality',
    priority: 'medium',
    createdAt: new Date('2024-01-20'),
    completed: false,
  },
  {
    id: '4',
    title: 'Performance audit',
    description: 'Run Lighthouse audit and fix issues',
    category: 'performance',
    priority: 'low',
    createdAt: new Date('2024-02-01'),
    completed: false,
  },
];

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private itemsSubject = new BehaviorSubject<Item[]>(INITIAL_ITEMS);

  readonly items$: Observable<Item[]> = this.itemsSubject.asObservable();

  readonly completedCount$: Observable<number> = this.items$.pipe(
    map((items) => items.filter((i) => i.completed).length),
  );

  readonly pendingCount$: Observable<number> = this.items$.pipe(
    map((items) => items.filter((i) => !i.completed).length),
  );

  get items(): Item[] {
    return this.itemsSubject.value;
  }

  add(item: Omit<Item, 'id' | 'createdAt'>): void {
    const newItem: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.itemsSubject.next([...this.itemsSubject.value, newItem]);
  }

  toggle(id: string): void {
    const updated = this.itemsSubject.value.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    this.itemsSubject.next(updated);
  }

  remove(id: string): void {
    this.itemsSubject.next(this.itemsSubject.value.filter((item) => item.id !== id));
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
}
