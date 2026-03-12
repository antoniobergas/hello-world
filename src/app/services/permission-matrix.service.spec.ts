import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionMatrixService, Permission } from './permission-matrix.service';

const makePermission = (id: string, resource: string, action: string): Permission => ({
  id,
  name: `${resource}:${action}`,
  description: `Can ${action} ${resource}`,
  resource,
  action,
});

describe('PermissionMatrixService', () => {
  let service: PermissionMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PermissionMatrixService] });
    service = TestBed.inject(PermissionMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no permissions or matrix entries', () => {
    expect(service.permissions.length).toBe(0);
    expect(Object.keys(service.matrix).length).toBe(0);
  });

  it('should add a permission', () => {
    service.addPermission(makePermission('p1', 'items', 'read'));
    expect(service.permissions.length).toBe(1);
  });

  it('should not add duplicate permissions', () => {
    service.addPermission(makePermission('p1', 'items', 'read'));
    service.addPermission(makePermission('p1', 'items', 'read'));
    expect(service.permissions.length).toBe(1);
  });

  it('should grant a permission to a role', () => {
    service.grantPermission('admin', 'p1');
    expect(service.hasPermission('admin', 'p1')).toBe(true);
  });

  it('should not duplicate permission grants', () => {
    service.grantPermission('admin', 'p1');
    service.grantPermission('admin', 'p1');
    expect(service.matrix['admin'].length).toBe(1);
  });

  it('should revoke a permission from a role', () => {
    service.grantPermission('admin', 'p1');
    service.revokePermission('admin', 'p1');
    expect(service.hasPermission('admin', 'p1')).toBe(false);
  });

  it('should get permissions for a role', () => {
    service.addPermission(makePermission('p1', 'items', 'read'));
    service.addPermission(makePermission('p2', 'items', 'write'));
    service.grantPermission('editor', 'p1');
    const perms = service.getPermissionsForRole('editor');
    expect(perms.length).toBe(1);
    expect(perms[0].id).toBe('p1');
  });

  it('should get roles with a given permission', () => {
    service.grantPermission('admin', 'p1');
    service.grantPermission('editor', 'p1');
    const roles = service.getRolesWithPermission('p1');
    expect(roles).toContain('admin');
    expect(roles).toContain('editor');
  });

  it('should remove a permission and revoke it from all roles', () => {
    service.addPermission(makePermission('p1', 'items', 'delete'));
    service.grantPermission('admin', 'p1');
    service.removePermission('p1');
    expect(service.permissions.length).toBe(0);
    expect(service.hasPermission('admin', 'p1')).toBe(false);
  });

  it('should get permissions for a resource', () => {
    service.addPermission(makePermission('p1', 'items', 'read'));
    service.addPermission(makePermission('p2', 'items', 'write'));
    service.addPermission(makePermission('p3', 'orders', 'read'));
    expect(service.getResourcePermissions('items').length).toBe(2);
  });

  it('should check canPerformAction', () => {
    service.addPermission(makePermission('p1', 'items', 'delete'));
    service.grantPermission('admin', 'p1');
    expect(service.canPerformAction('admin', 'items', 'delete')).toBe(true);
    expect(service.canPerformAction('admin', 'items', 'read')).toBe(false);
    expect(service.canPerformAction('viewer', 'items', 'delete')).toBe(false);
  });

  it('should emit permissions via permissions$', async () => {
    service.addPermission(makePermission('p1', 'items', 'read'));
    const perms = await firstValueFrom(service.permissions$);
    expect(perms.length).toBe(1);
  });
});
