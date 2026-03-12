import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DeletedItem {
  id: string;
  type: string;
  data: unknown;
  deletedAt: Date;
  deletedBy: string;
  expiresAt: Date;
}

const DEFAULT_RETENTION_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class SoftDeleteService {
  private deletedItemsSubject = new BehaviorSubject<DeletedItem[]>([]);

  readonly deletedItems$: Observable<DeletedItem[]> = this.deletedItemsSubject.asObservable();

  readonly expiredItems$: Observable<DeletedItem[]> = this.deletedItems$.pipe(
    map((items) => items.filter((i) => i.expiresAt <= new Date())),
  );

  get deletedItems(): DeletedItem[] {
    return this.deletedItemsSubject.value;
  }

  softDelete(
    id: string,
    type: string,
    data: unknown,
    deletedBy: string,
    retentionDays = DEFAULT_RETENTION_DAYS,
  ): DeletedItem {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + retentionDays * 86400000);
    const item: DeletedItem = { id, type, data, deletedAt: now, deletedBy, expiresAt };
    this.deletedItemsSubject.next([...this.deletedItemsSubject.value, item]);
    return item;
  }

  restore(id: string): DeletedItem | undefined {
    const item = this.deletedItemsSubject.value.find((i) => i.id === id);
    if (item) {
      this.deletedItemsSubject.next(this.deletedItemsSubject.value.filter((i) => i.id !== id));
    }
    return item;
  }

  permanentDelete(id: string): void {
    this.deletedItemsSubject.next(this.deletedItemsSubject.value.filter((i) => i.id !== id));
  }

  getDeletedByType(type: string): DeletedItem[] {
    return this.deletedItemsSubject.value.filter((i) => i.type === type);
  }

  getExpiredItems(): DeletedItem[] {
    const now = new Date();
    return this.deletedItemsSubject.value.filter((i) => i.expiresAt <= now);
  }

  purgeExpired(): number {
    const before = this.deletedItemsSubject.value.length;
    const now = new Date();
    this.deletedItemsSubject.next(this.deletedItemsSubject.value.filter((i) => i.expiresAt > now));
    return before - this.deletedItemsSubject.value.length;
  }

  getItemCount(): number {
    return this.deletedItemsSubject.value.length;
  }
}
