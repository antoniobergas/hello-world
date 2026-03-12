import { Injectable } from '@angular/core';
import Fuse, { IFuseOptions } from 'fuse.js';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class FuzzySearchService {
  private readonly fuseOptions: IFuseOptions<Item> = {
    keys: ['title', 'description', 'category', 'tags'],
    threshold: 0.35,
    minMatchCharLength: 1,
    includeScore: false,
  };

  search(items: Item[], query: string): Item[] {
    if (!query?.trim()) return items;
    const fuse = new Fuse(items, this.fuseOptions);
    return fuse.search(query).map((r) => r.item);
  }
}
