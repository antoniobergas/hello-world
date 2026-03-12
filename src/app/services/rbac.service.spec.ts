import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RbacService } from './rbac.service';

describe('RbacService', () => {
  let service: RbacService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RbacService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with admin role', () => {
    expect(service.currentUser.role).toBe('admin');
  });

  it('should allow admin to have all permissions', () => {
    expect(service.hasPermission('items:read')).toBe(true);
    expect(service.hasPermission('items:write')).toBe(true);
    expect(service.hasPermission('items:delete')).toBe(true);
    expect(service.hasPermission('admin:access')).toBe(true);
    expect(service.hasPermission('audit:read')).toBe(true);
    expect(service.hasPermission('flags:write')).toBe(true);
  });

  it('should change role to viewer and restrict permissions', () => {
    service.setRole('viewer');
    expect(service.hasPermission('items:read')).toBe(true);
    expect(service.hasPermission('items:write')).toBe(false);
    expect(service.hasPermission('items:delete')).toBe(false);
    expect(service.hasPermission('admin:access')).toBe(false);
  });

  it('should change role to editor with correct permissions', () => {
    service.setRole('editor');
    expect(service.hasPermission('items:read')).toBe(true);
    expect(service.hasPermission('items:write')).toBe(true);
    expect(service.hasPermission('items:delete')).toBe(false);
  });

  it('should emit new role via currentRole$', async () => {
    service.setRole('viewer');
    const role = await firstValueFrom(service.currentRole$);
    expect(role).toBe('viewer');
  });

  it('should return false for canAccess when permission not held', () => {
    service.setRole('viewer');
    expect(service.canAccess('items', 'delete')).toBe(false);
  });

  it('should return true for canAccess when permission held', () => {
    service.setRole('editor');
    expect(service.canAccess('items', 'read')).toBe(true);
    expect(service.canAccess('items', 'write')).toBe(true);
  });

  it('should return all three roles', () => {
    const roles = service.getAllRoles();
    expect(roles).toEqual(['admin', 'editor', 'viewer']);
  });

  it('should correctly check hasRole', () => {
    expect(service.hasRole('admin')).toBe(true);
    service.setRole('editor');
    expect(service.hasRole('admin')).toBe(false);
    expect(service.hasRole('editor')).toBe(true);
  });

  it('should return correct permissions for each role via getRolePermissions', () => {
    const adminPerms = service.getRolePermissions('admin');
    expect(adminPerms).toContain('admin:access');
    const viewerPerms = service.getRolePermissions('viewer');
    expect(viewerPerms).toEqual(['items:read']);
  });

  it('should emit updated user via currentUser$ after role change', async () => {
    service.setRole('editor');
    const user = await firstValueFrom(service.currentUser$);
    expect(user.role).toBe('editor');
    expect(user.permissions).toContain('items:write');
    expect(user.permissions).not.toContain('admin:access');
  });
});
