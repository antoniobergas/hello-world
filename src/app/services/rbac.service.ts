import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Role = 'admin' | 'editor' | 'viewer';
export type Permission = 'items:read' | 'items:write' | 'items:delete' | 'admin:access' | 'audit:read' | 'flags:write';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['items:read', 'items:write', 'items:delete', 'admin:access', 'audit:read', 'flags:write'],
  editor: ['items:read', 'items:write'],
  viewer: ['items:read'],
};

export interface UserContext {
  userId: string;
  username: string;
  role: Role;
  permissions: Permission[];
}

@Injectable({ providedIn: 'root' })
export class RbacService {
  private userSubject = new BehaviorSubject<UserContext>({
    userId: 'user-001',
    username: 'admin',
    role: 'admin',
    permissions: ROLE_PERMISSIONS['admin'],
  });

  readonly currentUser$: Observable<UserContext> = this.userSubject.asObservable();
  readonly currentRole$: Observable<Role> = this.currentUser$.pipe(map((u) => u.role));

  get currentUser(): UserContext {
    return this.userSubject.value;
  }

  setRole(role: Role): void {
    const user = this.userSubject.value;
    this.userSubject.next({
      ...user,
      role,
      permissions: ROLE_PERMISSIONS[role],
    });
  }

  hasPermission(permission: Permission): boolean {
    return this.userSubject.value.permissions.includes(permission);
  }

  hasPermission$(permission: Permission): Observable<boolean> {
    return this.currentUser$.pipe(map((u) => u.permissions.includes(permission)));
  }

  hasRole(role: Role): boolean {
    return this.userSubject.value.role === role;
  }

  canAccess(resource: string, action: 'read' | 'write' | 'delete'): boolean {
    const perm = `${resource}:${action}` as Permission;
    return this.hasPermission(perm);
  }

  getRolePermissions(role: Role): Permission[] {
    return [...ROLE_PERMISSIONS[role]];
  }

  getAllRoles(): Role[] {
    return ['admin', 'editor', 'viewer'];
  }
}
