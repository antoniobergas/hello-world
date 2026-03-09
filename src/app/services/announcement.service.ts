import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  targetAudience: 'all' | 'admins' | string;
  active: boolean;
  startAt: Date;
  endAt?: Date;
  createdBy: string;
}

const past = (d: number) => new Date(Date.now() - d * 86400000);
const future = (d: number) => new Date(Date.now() + d * 86400000);

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: 'System Maintenance',
    body: 'Scheduled maintenance window on Sunday',
    type: 'maintenance',
    targetAudience: 'all',
    active: true,
    startAt: past(1),
    endAt: future(2),
    createdBy: 'admin',
  },
  {
    id: 'ann2',
    title: 'New Feature: Dark Mode',
    body: 'Dark mode is now available!',
    type: 'feature',
    targetAudience: 'all',
    active: true,
    startAt: past(5),
    createdBy: 'admin',
  },
  {
    id: 'ann3',
    title: 'Security Update Required',
    body: 'Please rotate your API keys',
    type: 'warning',
    targetAudience: 'admins',
    active: true,
    startAt: past(2),
    endAt: future(5),
    createdBy: 'security-team',
  },
  {
    id: 'ann4',
    title: 'Old Notice',
    body: 'This notice has expired',
    type: 'info',
    targetAudience: 'all',
    active: false,
    startAt: past(30),
    endAt: past(10),
    createdBy: 'admin',
  },
  {
    id: 'ann5',
    title: 'Tenant Specific Notice',
    body: 'Something specific to t1',
    type: 'info',
    targetAudience: 't1',
    active: true,
    startAt: past(1),
    createdBy: 'admin',
  },
  {
    id: 'ann6',
    title: 'Beta Features Available',
    body: 'Opt in to beta features',
    type: 'feature',
    targetAudience: 'admins',
    active: true,
    startAt: past(3),
    createdBy: 'product-team',
  },
  {
    id: 'ann7',
    title: 'Upcoming Price Change',
    body: 'Prices change next quarter',
    type: 'warning',
    targetAudience: 'all',
    active: false,
    startAt: future(10),
    createdBy: 'billing-team',
  },
  {
    id: 'ann8',
    title: 'Platform Status Update',
    body: 'All systems operational',
    type: 'info',
    targetAudience: 'all',
    active: true,
    startAt: past(0),
    createdBy: 'ops-team',
  },
];

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private announcementsSubject = new BehaviorSubject<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  private dismissedSubject = new BehaviorSubject<Map<string, Set<string>>>(new Map());

  readonly announcements$: Observable<Announcement[]> = this.announcementsSubject.asObservable();

  readonly activeAnnouncements$: Observable<Announcement[]> = this.announcements$.pipe(
    map((announcements) => announcements.filter((a) => a.active)),
  );

  get announcements(): Announcement[] {
    return this.announcementsSubject.value;
  }

  create(announcement: Omit<Announcement, 'id'>): Announcement {
    const newAnn: Announcement = { ...announcement, id: crypto.randomUUID() };
    this.announcementsSubject.next([...this.announcementsSubject.value, newAnn]);
    return newAnn;
  }

  publish(id: string): void {
    this.announcementsSubject.next(
      this.announcementsSubject.value.map((a) => (a.id === id ? { ...a, active: true } : a)),
    );
  }

  deactivate(id: string): void {
    this.announcementsSubject.next(
      this.announcementsSubject.value.map((a) => (a.id === id ? { ...a, active: false } : a)),
    );
  }

  getActive(): Announcement[] {
    return this.announcementsSubject.value.filter((a) => a.active);
  }

  getForAudience(audience: string): Announcement[] {
    return this.announcementsSubject.value.filter(
      (a) => a.active && (a.targetAudience === 'all' || a.targetAudience === audience),
    );
  }

  dismiss(id: string, userId: string): void {
    const current = new Map(this.dismissedSubject.value);
    const userDismissed = new Set(current.get(userId) ?? []);
    userDismissed.add(id);
    current.set(userId, userDismissed);
    this.dismissedSubject.next(current);
  }

  isDismissed(id: string, userId: string): boolean {
    return this.dismissedSubject.value.get(userId)?.has(id) ?? false;
  }

  getForUser(userId: string, audience: string): Announcement[] {
    const dismissed = this.dismissedSubject.value.get(userId) ?? new Set();
    return this.getForAudience(audience).filter((a) => !dismissed.has(a.id));
  }

  getAll(): Announcement[] {
    return this.announcementsSubject.value;
  }
}
