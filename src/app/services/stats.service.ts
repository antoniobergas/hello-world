import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemsService } from './items.service';

export interface CategoryStat {
  category: string;
  total: number;
  completed: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private itemsService = inject(ItemsService);

  /** Completion rate as a 0–100 number (rounded). */
  readonly completionRate$: Observable<number> = this.itemsService.items$.pipe(
    map((items) => {
      if (!items.length) return 0;
      return Math.round((items.filter((i) => i.completed).length / items.length) * 100);
    }),
  );

  /** Number of items that are past their due date and not yet completed. */
  readonly overdueCount$: Observable<number> = this.itemsService.items$.pipe(
    map((items) => {
      const now = new Date();
      return items.filter((i) => !i.completed && i.dueDate !== undefined && i.dueDate < now).length;
    }),
  );

  /** Per-category statistics. */
  readonly categoryStats$: Observable<CategoryStat[]> = this.itemsService.items$.pipe(
    map((items) => {
      const map = new Map<string, CategoryStat>();
      for (const item of items) {
        const existing = map.get(item.category) ?? {
          category: item.category,
          total: 0,
          completed: 0,
        };
        existing.total++;
        if (item.completed) existing.completed++;
        map.set(item.category, existing);
      }
      return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }),
  );

  /** Distinct categories derived from current items. */
  readonly categories$: Observable<string[]> = this.itemsService.items$.pipe(
    map((items) => [...new Set(items.map((i) => i.category))].sort()),
  );
}
