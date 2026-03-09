import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WorkspaceSettings {
  allowGuestAccess: boolean;
  defaultRole: string;
  features: string[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  tenantId: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  settings: WorkspaceSettings;
  archived: boolean;
}

const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws1', name: 'Engineering', slug: 'engineering', description: 'Engineering workspace', tenantId: 't1', ownerId: 'u1', memberIds: ['u1', 'u2', 'u3', 'u4'], createdAt: new Date('2023-01-01'), settings: { allowGuestAccess: false, defaultRole: 'editor', features: ['code-review', 'ci-cd'] }, archived: false },
  { id: 'ws2', name: 'Marketing', slug: 'marketing', description: 'Marketing workspace', tenantId: 't1', ownerId: 'u5', memberIds: ['u5', 'u6'], createdAt: new Date('2023-02-01'), settings: { allowGuestAccess: true, defaultRole: 'viewer', features: ['campaigns'] }, archived: false },
  { id: 'ws3', name: 'Sales', slug: 'sales', description: 'Sales workspace', tenantId: 't2', ownerId: 'u7', memberIds: ['u7', 'u8', 'u9'], createdAt: new Date('2023-01-15'), settings: { allowGuestAccess: false, defaultRole: 'editor', features: ['crm'] }, archived: false },
  { id: 'ws4', name: 'Support', slug: 'support', description: 'Customer support workspace', tenantId: 't2', ownerId: 'u10', memberIds: ['u10', 'u11'], createdAt: new Date('2023-03-01'), settings: { allowGuestAccess: false, defaultRole: 'viewer', features: ['ticketing'] }, archived: false },
  { id: 'ws5', name: 'Finance', slug: 'finance', description: 'Finance workspace', tenantId: 't3', ownerId: 'u12', memberIds: ['u12', 'u13'], createdAt: new Date('2023-01-20'), settings: { allowGuestAccess: false, defaultRole: 'viewer', features: ['reporting', 'budgets'] }, archived: false },
  { id: 'ws6', name: 'Product', slug: 'product', description: 'Product management', tenantId: 't1', ownerId: 'u14', memberIds: ['u14', 'u15', 'u1'], createdAt: new Date('2023-04-01'), settings: { allowGuestAccess: false, defaultRole: 'editor', features: ['roadmap', 'specs'] }, archived: false },
  { id: 'ws7', name: 'HR', slug: 'hr', description: 'Human resources', tenantId: 't3', ownerId: 'u16', memberIds: ['u16', 'u17'], createdAt: new Date('2023-05-01'), settings: { allowGuestAccess: false, defaultRole: 'viewer', features: [] }, archived: false },
  { id: 'ws8', name: 'Legacy Project', slug: 'legacy-project', description: 'Archived legacy project', tenantId: 't1', ownerId: 'u1', memberIds: ['u1'], createdAt: new Date('2021-01-01'), settings: { allowGuestAccess: false, defaultRole: 'viewer', features: [] }, archived: true },
];

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private workspacesSubject = new BehaviorSubject<Workspace[]>(INITIAL_WORKSPACES);

  readonly workspaces$: Observable<Workspace[]> = this.workspacesSubject.asObservable();

  readonly activeWorkspaces$: Observable<Workspace[]> = this.workspaces$.pipe(
    map((ws) => ws.filter((w) => !w.archived)),
  );

  get workspaces(): Workspace[] {
    return this.workspacesSubject.value;
  }

  create(workspace: Omit<Workspace, 'id' | 'createdAt'>): Workspace {
    const newWs: Workspace = { ...workspace, id: crypto.randomUUID(), createdAt: new Date() };
    this.workspacesSubject.next([...this.workspacesSubject.value, newWs]);
    return newWs;
  }

  update(id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt'>>): void {
    this.workspacesSubject.next(
      this.workspacesSubject.value.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    );
  }

  archive(id: string): void {
    this.update(id, { archived: true });
  }

  addMember(workspaceId: string, userId: string): void {
    this.workspacesSubject.next(
      this.workspacesSubject.value.map((w) =>
        w.id === workspaceId && !w.memberIds.includes(userId)
          ? { ...w, memberIds: [...w.memberIds, userId] }
          : w,
      ),
    );
  }

  removeMember(workspaceId: string, userId: string): void {
    this.workspacesSubject.next(
      this.workspacesSubject.value.map((w) =>
        w.id === workspaceId ? { ...w, memberIds: w.memberIds.filter((m) => m !== userId) } : w,
      ),
    );
  }

  getByTenant(tenantId: string): Workspace[] {
    return this.workspacesSubject.value.filter((w) => w.tenantId === tenantId);
  }

  getByMember(userId: string): Workspace[] {
    return this.workspacesSubject.value.filter((w) => w.memberIds.includes(userId));
  }

  getBySlug(slug: string): Workspace | undefined {
    return this.workspacesSubject.value.find((w) => w.slug === slug);
  }
}
