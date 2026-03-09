import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS' | 'EXPORT' | 'CONFIG_CHANGE';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  username: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  success: boolean;
}

const MAX_ENTRIES = 500;

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private entriesSubject = new BehaviorSubject<AuditEntry[]>([]);

  readonly entries$: Observable<AuditEntry[]> = this.entriesSubject.asObservable();

  readonly recentEntries$: Observable<AuditEntry[]> = this.entries$.pipe(
    map((entries) => entries.slice(-50).reverse()),
  );

  get entries(): AuditEntry[] {
    return this.entriesSubject.value;
  }

  log(
    userId: string,
    username: string,
    action: AuditAction,
    resource: string,
    details: string,
    options: { resourceId?: string; severity?: AuditEntry['severity']; success?: boolean } = {},
  ): AuditEntry {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId,
      username,
      action,
      resource,
      resourceId: options.resourceId,
      details,
      severity: options.severity ?? 'low',
      success: options.success ?? true,
    };
    const updated = [...this.entriesSubject.value, entry];
    if (updated.length > MAX_ENTRIES) updated.splice(0, updated.length - MAX_ENTRIES);
    this.entriesSubject.next(updated);
    return entry;
  }

  getByUser(userId: string): AuditEntry[] {
    return this.entriesSubject.value.filter((e) => e.userId === userId);
  }

  getByAction(action: AuditAction): AuditEntry[] {
    return this.entriesSubject.value.filter((e) => e.action === action);
  }

  getByResource(resource: string): AuditEntry[] {
    return this.entriesSubject.value.filter((e) => e.resource === resource);
  }

  getSince(since: Date): AuditEntry[] {
    return this.entriesSubject.value.filter((e) => e.timestamp >= since);
  }

  clearOlderThan(date: Date): number {
    const before = this.entriesSubject.value.length;
    this.entriesSubject.next(this.entriesSubject.value.filter((e) => e.timestamp >= date));
    return before - this.entriesSubject.value.length;
  }

  clear(): void {
    this.entriesSubject.next([]);
  }

  getStats(): { total: number; byAction: Record<string, number>; failureCount: number } {
    const entries = this.entriesSubject.value;
    const byAction: Record<string, number> = {};
    for (const e of entries) {
      byAction[e.action] = (byAction[e.action] ?? 0) + 1;
    }
    return {
      total: entries.length,
      byAction,
      failureCount: entries.filter((e) => !e.success).length,
    };
  }
}
