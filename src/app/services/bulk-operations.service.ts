import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BulkOperation {
  id: string;
  type: 'delete' | 'update' | 'tag' | 'export';
  targetIds: string[];
  status: 'pending' | 'running' | 'complete' | 'failed';
  affectedCount: number;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class BulkOperationsService {
  private selectedIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  private operationsSubject = new BehaviorSubject<BulkOperation[]>([]);

  readonly selectedIds$: Observable<Set<string>> = this.selectedIdsSubject.asObservable();
  readonly operations$: Observable<BulkOperation[]> = this.operationsSubject.asObservable();

  get selectedIds(): Set<string> {
    return this.selectedIdsSubject.value;
  }

  get operations(): BulkOperation[] {
    return this.operationsSubject.value;
  }

  selectItem(id: string): void {
    const updated = new Set(this.selectedIdsSubject.value);
    updated.add(id);
    this.selectedIdsSubject.next(updated);
  }

  deselectItem(id: string): void {
    const updated = new Set(this.selectedIdsSubject.value);
    updated.delete(id);
    this.selectedIdsSubject.next(updated);
  }

  selectAll(ids: string[]): void {
    this.selectedIdsSubject.next(new Set(ids));
  }

  clearSelection(): void {
    this.selectedIdsSubject.next(new Set());
  }

  getSelectedCount(): number {
    return this.selectedIdsSubject.value.size;
  }

  executeDelete(ids: string[]): BulkOperation {
    return this.recordOperation('delete', ids);
  }

  executeUpdate(ids: string[], _updates: Record<string, unknown>): BulkOperation {
    return this.recordOperation('update', ids);
  }

  executeTag(ids: string[], _tag: string): BulkOperation {
    return this.recordOperation('tag', ids);
  }

  getOperationHistory(): BulkOperation[] {
    return this.operationsSubject.value;
  }

  private recordOperation(type: BulkOperation['type'], ids: string[]): BulkOperation {
    const op: BulkOperation = {
      id: crypto.randomUUID(),
      type,
      targetIds: [...ids],
      status: 'complete',
      affectedCount: ids.length,
      createdAt: new Date(),
    };
    this.operationsSubject.next([...this.operationsSubject.value, op]);
    return op;
  }
}
