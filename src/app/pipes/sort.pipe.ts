import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash-es';
import { Item } from '../models/item.model';

export type SortField = 'title' | 'priority' | 'createdAt' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

@Pipe({ name: 'sortItems', standalone: true })
export class SortPipe implements PipeTransform {
  transform(items: Item[] | null, field: SortField, direction: SortDirection = 'asc'): Item[] {
    if (!items?.length) return items ?? [];

    if (field === 'priority') {
      const sorted = [...items].sort((a, b) => {
        const aVal = PRIORITY_ORDER[a.priority] ?? 1;
        const bVal = PRIORITY_ORDER[b.priority] ?? 1;
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
      return sorted;
    }

    return orderBy(items, [field], [direction]) as Item[];
  }
}
