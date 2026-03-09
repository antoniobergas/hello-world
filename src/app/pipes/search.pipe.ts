import { Pipe, PipeTransform } from '@angular/core';
import { Item } from '../models/item.model';

@Pipe({ name: 'search', standalone: true })
export class SearchPipe implements PipeTransform {
  transform(items: Item[] | null, query: string): Item[] {
    if (!items) return [];
    if (!query?.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower),
    );
  }
}
