import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ActivityEntry {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private activitiesSubject = new BehaviorSubject<ActivityEntry[]>([]);

  readonly activities$: Observable<ActivityEntry[]> = this.activitiesSubject.asObservable();

  get activities(): ActivityEntry[] {
    return this.activitiesSubject.value;
  }

  logActivity(
    userId: string,
    username: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown> = {},
  ): ActivityEntry {
    const entry: ActivityEntry = {
      id: crypto.randomUUID(),
      userId,
      username,
      action,
      entityType,
      entityId,
      timestamp: new Date(),
      metadata,
    };
    this.activitiesSubject.next([...this.activitiesSubject.value, entry]);
    return entry;
  }

  addComment(
    entityType: string,
    entityId: string,
    userId: string,
    username: string,
    comment: string,
  ): ActivityEntry {
    return this.logActivity(userId, username, 'COMMENT', entityType, entityId, { comment });
  }

  getActivitiesForEntity(entityType: string, entityId: string): ActivityEntry[] {
    return this.activitiesSubject.value.filter(
      (a) => a.entityType === entityType && a.entityId === entityId,
    );
  }

  getActivitiesByUser(userId: string): ActivityEntry[] {
    return this.activitiesSubject.value.filter((a) => a.userId === userId);
  }

  getRecentActivities(limit: number): ActivityEntry[] {
    return [...this.activitiesSubject.value].reverse().slice(0, limit);
  }

  clearOldActivities(olderThan: Date): number {
    const before = this.activitiesSubject.value.length;
    this.activitiesSubject.next(
      this.activitiesSubject.value.filter((a) => a.timestamp >= olderThan),
    );
    return before - this.activitiesSubject.value.length;
  }
}
