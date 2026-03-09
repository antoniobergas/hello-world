import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    key: 'bulk-operations',
    name: 'Bulk Operations',
    description: 'Enable bulk select and batch operations on items',
    enabled: true,
    rolloutPercentage: 100,
    tags: ['ui', 'items'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    key: 'advanced-search',
    name: 'Advanced Search',
    description: 'Enable fuzzy search and advanced filters',
    enabled: true,
    rolloutPercentage: 100,
    tags: ['search', 'ui'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    key: 'export-csv',
    name: 'CSV Export',
    description: 'Allow users to export items to CSV format',
    enabled: false,
    rolloutPercentage: 0,
    tags: ['export', 'data'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    key: 'dark-mode',
    name: 'Dark Mode',
    description: 'Enable dark theme for the application',
    enabled: true,
    rolloutPercentage: 100,
    tags: ['ui', 'theme'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    key: 'notifications',
    name: 'Notifications',
    description: 'Enable in-app notifications',
    enabled: true,
    rolloutPercentage: 100,
    tags: ['ui', 'ux'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    key: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Show advanced analytics and charts on dashboard',
    enabled: false,
    rolloutPercentage: 20,
    tags: ['analytics', 'dashboard'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flagsSubject = new BehaviorSubject<FeatureFlag[]>([...DEFAULT_FLAGS]);

  readonly flags$: Observable<FeatureFlag[]> = this.flagsSubject.asObservable();

  readonly enabledFlags$: Observable<FeatureFlag[]> = this.flags$.pipe(
    map((flags) => flags.filter((f) => f.enabled)),
  );

  get flags(): FeatureFlag[] {
    return this.flagsSubject.value;
  }

  isEnabled(key: string): boolean {
    const flag = this.flagsSubject.value.find((f) => f.key === key);
    return flag?.enabled ?? false;
  }

  isEnabled$(key: string): Observable<boolean> {
    return this.flags$.pipe(map((flags) => flags.find((f) => f.key === key)?.enabled ?? false));
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.flagsSubject.value.find((f) => f.key === key);
  }

  toggle(key: string): void {
    const updated = this.flagsSubject.value.map((f) =>
      f.key === key ? { ...f, enabled: !f.enabled, updatedAt: new Date() } : f,
    );
    this.flagsSubject.next(updated);
  }

  setEnabled(key: string, enabled: boolean): void {
    const updated = this.flagsSubject.value.map((f) =>
      f.key === key ? { ...f, enabled, updatedAt: new Date() } : f,
    );
    this.flagsSubject.next(updated);
  }

  setRollout(key: string, percentage: number): void {
    const clamped = Math.max(0, Math.min(100, percentage));
    const updated = this.flagsSubject.value.map((f) =>
      f.key === key ? { ...f, rolloutPercentage: clamped, updatedAt: new Date() } : f,
    );
    this.flagsSubject.next(updated);
  }

  addFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): void {
    const now = new Date();
    this.flagsSubject.next([
      ...this.flagsSubject.value,
      { ...flag, createdAt: now, updatedAt: now },
    ]);
  }

  getFlagsByTag(tag: string): FeatureFlag[] {
    return this.flagsSubject.value.filter((f) => f.tags.includes(tag));
  }

  reset(): void {
    this.flagsSubject.next([...DEFAULT_FLAGS]);
  }
}
