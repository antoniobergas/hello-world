import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RetentionPolicy {
  id: string;
  name: string;
  entityType: string;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  enabled: boolean;
}

export interface RetentionRecord {
  id: string;
  policyId: string;
  entityId: string;
  scheduledDeleteAt: Date;
  archived: boolean;
}

@Injectable({ providedIn: 'root' })
export class DataRetentionService {
  private policiesSubject = new BehaviorSubject<RetentionPolicy[]>([]);
  private recordsSubject = new BehaviorSubject<RetentionRecord[]>([]);

  readonly policies$: Observable<RetentionPolicy[]> = this.policiesSubject.asObservable();
  readonly records$: Observable<RetentionRecord[]> = this.recordsSubject.asObservable();

  readonly enabledPolicies$: Observable<RetentionPolicy[]> = this.policies$.pipe(
    map((policies) => policies.filter((p) => p.enabled)),
  );

  get policies(): RetentionPolicy[] {
    return this.policiesSubject.value;
  }

  get records(): RetentionRecord[] {
    return this.recordsSubject.value;
  }

  addPolicy(policy: RetentionPolicy): void {
    this.policiesSubject.next([...this.policiesSubject.value, policy]);
  }

  updatePolicy(id: string, updates: Partial<RetentionPolicy>): void {
    this.policiesSubject.next(
      this.policiesSubject.value.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  }

  removePolicy(id: string): void {
    this.policiesSubject.next(this.policiesSubject.value.filter((p) => p.id !== id));
  }

  scheduleForDeletion(policyId: string, entityId: string): RetentionRecord | undefined {
    const policy = this.policiesSubject.value.find((p) => p.id === policyId);
    if (!policy) return undefined;
    const scheduledDeleteAt = new Date(Date.now() + policy.retentionDays * 86400000);
    const record: RetentionRecord = {
      id: crypto.randomUUID(),
      policyId,
      entityId,
      scheduledDeleteAt,
      archived: false,
    };
    this.recordsSubject.next([...this.recordsSubject.value, record]);
    return record;
  }

  archiveRecord(recordId: string): void {
    this.recordsSubject.next(
      this.recordsSubject.value.map((r) => (r.id === recordId ? { ...r, archived: true } : r)),
    );
  }

  getExpiredRecords(): RetentionRecord[] {
    const now = new Date();
    return this.recordsSubject.value.filter((r) => r.scheduledDeleteAt <= now);
  }

  applyPolicy(policyId: string): RetentionRecord[] {
    return this.recordsSubject.value.filter((r) => r.policyId === policyId);
  }

  getRecordsByPolicy(policyId: string): RetentionRecord[] {
    return this.recordsSubject.value.filter((r) => r.policyId === policyId);
  }
}
