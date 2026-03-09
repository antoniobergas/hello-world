import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export type RolePermissionMatrix = Record<string, string[]>;

@Injectable({ providedIn: 'root' })
export class PermissionMatrixService {
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private matrixSubject = new BehaviorSubject<RolePermissionMatrix>({});

  readonly permissions$: Observable<Permission[]> = this.permissionsSubject.asObservable();
  readonly matrix$: Observable<RolePermissionMatrix> = this.matrixSubject.asObservable();

  get permissions(): Permission[] {
    return this.permissionsSubject.value;
  }

  get matrix(): RolePermissionMatrix {
    return this.matrixSubject.value;
  }

  grantPermission(role: string, permissionId: string): void {
    const current = this.matrixSubject.value;
    const existing = current[role] ?? [];
    if (!existing.includes(permissionId)) {
      this.matrixSubject.next({ ...current, [role]: [...existing, permissionId] });
    }
  }

  revokePermission(role: string, permissionId: string): void {
    const current = this.matrixSubject.value;
    const existing = current[role] ?? [];
    this.matrixSubject.next({
      ...current,
      [role]: existing.filter((id) => id !== permissionId),
    });
  }

  hasPermission(role: string, permissionId: string): boolean {
    return (this.matrixSubject.value[role] ?? []).includes(permissionId);
  }

  getPermissionsForRole(role: string): Permission[] {
    const ids = this.matrixSubject.value[role] ?? [];
    return this.permissionsSubject.value.filter((p) => ids.includes(p.id));
  }

  getRolesWithPermission(permissionId: string): string[] {
    return Object.entries(this.matrixSubject.value)
      .filter(([, ids]) => ids.includes(permissionId))
      .map(([role]) => role);
  }

  addPermission(permission: Permission): void {
    if (!this.permissionsSubject.value.find((p) => p.id === permission.id)) {
      this.permissionsSubject.next([...this.permissionsSubject.value, permission]);
    }
  }

  removePermission(id: string): void {
    this.permissionsSubject.next(this.permissionsSubject.value.filter((p) => p.id !== id));
    const updated: RolePermissionMatrix = {};
    for (const [role, ids] of Object.entries(this.matrixSubject.value)) {
      updated[role] = ids.filter((pid) => pid !== id);
    }
    this.matrixSubject.next(updated);
  }

  getResourcePermissions(resource: string): Permission[] {
    return this.permissionsSubject.value.filter((p) => p.resource === resource);
  }

  canPerformAction(role: string, resource: string, action: string): boolean {
    const rolePermIds = this.matrixSubject.value[role] ?? [];
    return this.permissionsSubject.value.some(
      (p) => rolePermIds.includes(p.id) && p.resource === resource && p.action === action,
    );
  }
}
