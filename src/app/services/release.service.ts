import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReleaseChange {
  type: 'feature' | 'fix' | 'breaking' | 'deprecation' | 'security';
  description: string;
  issueRef?: string;
}

export interface Release {
  id: string;
  version: string;
  title: string;
  description: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  status: 'draft' | 'published' | 'archived';
  changes: ReleaseChange[];
  releasedAt?: Date;
  createdBy: string;
  targetEnvironments: string[];
}

const SEED_RELEASES: Release[] = [
  {
    id: 'rel1',
    version: '1.0.0',
    title: 'Initial Release',
    description: 'First major release',
    type: 'major',
    status: 'published',
    changes: [{ type: 'feature', description: 'Initial setup' }],
    releasedAt: new Date('2024-01-15'),
    createdBy: 'u1',
    targetEnvironments: ['prod'],
  },
  {
    id: 'rel2',
    version: '1.1.0',
    title: 'Feature Update',
    description: 'Added new features',
    type: 'minor',
    status: 'published',
    changes: [{ type: 'feature', description: 'New dashboard' }],
    releasedAt: new Date('2024-02-15'),
    createdBy: 'u1',
    targetEnvironments: ['prod'],
  },
  {
    id: 'rel3',
    version: '1.1.1',
    title: 'Bug Fix',
    description: 'Critical bug fixes',
    type: 'patch',
    status: 'published',
    changes: [{ type: 'fix', description: 'Fixed login issue' }],
    releasedAt: new Date('2024-03-01'),
    createdBy: 'u2',
    targetEnvironments: ['prod'],
  },
  {
    id: 'rel4',
    version: '1.1.2',
    title: 'Hotfix Auth',
    description: 'Auth security hotfix',
    type: 'hotfix',
    status: 'published',
    changes: [{ type: 'security', description: 'Auth patch', issueRef: 'SEC-001' }],
    releasedAt: new Date('2024-03-15'),
    createdBy: 'u2',
    targetEnvironments: ['prod'],
  },
  {
    id: 'rel5',
    version: '2.0.0',
    title: 'Major Overhaul',
    description: 'Complete redesign',
    type: 'major',
    status: 'published',
    changes: [{ type: 'breaking', description: 'New API' }],
    releasedAt: new Date('2024-04-01'),
    createdBy: 'u1',
    targetEnvironments: ['staging', 'prod'],
  },
  {
    id: 'rel6',
    version: '2.1.0',
    title: 'Minor Feature',
    description: 'Small improvements',
    type: 'minor',
    status: 'draft',
    changes: [],
    createdBy: 'u3',
    targetEnvironments: ['staging'],
  },
  {
    id: 'rel7',
    version: '2.1.1',
    title: 'Patch Fix',
    description: 'Performance improvements',
    type: 'patch',
    status: 'draft',
    changes: [],
    createdBy: 'u3',
    targetEnvironments: [],
  },
  {
    id: 'rel8',
    version: '0.9.0',
    title: 'Beta Release',
    description: 'Beta version',
    type: 'minor',
    status: 'archived',
    changes: [{ type: 'feature', description: 'Beta feature' }],
    releasedAt: new Date('2023-12-01'),
    createdBy: 'u1',
    targetEnvironments: ['staging'],
  },
  {
    id: 'rel9',
    version: '0.8.0',
    title: 'Alpha Release',
    description: 'Alpha version',
    type: 'major',
    status: 'archived',
    changes: [],
    createdBy: 'u2',
    targetEnvironments: [],
  },
  {
    id: 'rel10',
    version: '2.2.0',
    title: 'Upcoming Release',
    description: 'Next planned release',
    type: 'minor',
    status: 'draft',
    changes: [{ type: 'feature', description: 'Upcoming feature' }],
    createdBy: 'u1',
    targetEnvironments: ['dev'],
  },
];

@Injectable({ providedIn: 'root' })
export class ReleaseService {
  private releasesSubject = new BehaviorSubject<Release[]>(SEED_RELEASES);

  readonly releases$: Observable<Release[]> = this.releasesSubject.asObservable();

  get releases(): Release[] {
    return this.releasesSubject.getValue();
  }

  create(data: Omit<Release, 'id' | 'status' | 'changes'>): Release {
    const release: Release = { ...data, id: crypto.randomUUID(), status: 'draft', changes: [] };
    this.releasesSubject.next([...this.releases, release]);
    return release;
  }

  publish(id: string): void {
    this.releasesSubject.next(
      this.releases.map((r) =>
        r.id === id ? { ...r, status: 'published', releasedAt: new Date() } : r,
      ),
    );
  }

  archive(id: string): void {
    this.releasesSubject.next(
      this.releases.map((r) => (r.id === id ? { ...r, status: 'archived' } : r)),
    );
  }

  addChange(id: string, change: ReleaseChange): void {
    this.releasesSubject.next(
      this.releases.map((r) => (r.id === id ? { ...r, changes: [...r.changes, change] } : r)),
    );
  }

  removeChange(id: string, changeIndex: number): void {
    this.releasesSubject.next(
      this.releases.map((r) =>
        r.id === id ? { ...r, changes: r.changes.filter((_, i) => i !== changeIndex) } : r,
      ),
    );
  }

  getByStatus(status: Release['status']): Release[] {
    return this.releases.filter((r) => r.status === status);
  }

  getByVersion(version: string): Release | undefined {
    return this.releases.find((r) => r.version === version);
  }

  getLatestPublished(): Release | undefined {
    const published = this.releases.filter((r) => r.status === 'published' && r.releasedAt);
    if (!published.length) return undefined;
    return published.reduce((latest, r) =>
      r.releasedAt!.getTime() > latest.releasedAt!.getTime() ? r : latest,
    );
  }

  search(query: string): Release[] {
    const q = query.toLowerCase();
    return this.releases.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }
}
