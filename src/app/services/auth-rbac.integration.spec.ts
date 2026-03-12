import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { RbacService } from './rbac.service';

describe('Auth + RBAC Integration', () => {
  let auth: AuthService;
  let rbac: RbacService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthService, RbacService] });
    auth = TestBed.inject(AuthService);
    rbac = TestBed.inject(RbacService);
  });

  it('should grant admin permissions when auth user has admin role and rbac role is set to admin', () => {
    const user = auth.getCurrentUser();
    expect(user?.roles).toContain('admin');
    rbac.setRole('admin');
    expect(rbac.hasPermission('admin:access')).toBe(true);
    expect(rbac.hasPermission('items:delete')).toBe(true);
    expect(rbac.hasPermission('audit:read')).toBe(true);
  });

  it('should allow RBAC role change independently from auth state', () => {
    expect(auth.isAuthenticated()).toBe(true);
    rbac.setRole('viewer');
    expect(rbac.hasRole('viewer')).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getCurrentUser()?.username).toBe('admin');
  });

  it('should use auth user tenant context alongside RBAC permissions', () => {
    const user = auth.getCurrentUser();
    expect(user?.tenantId).toBe('t1');
    rbac.setRole('admin');
    expect(rbac.hasPermission('items:read')).toBe(true);
    expect(user?.tenantId).toBe('t1');
  });

  it('should clear auth state on logout while RBAC state is unaffected', () => {
    rbac.setRole('editor');
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getCurrentUser()).toBeNull();
    expect(rbac.hasRole('editor')).toBe(true);
  });

  it('should pass canAccess checks for authenticated user with admin RBAC role', () => {
    expect(auth.isAuthenticated()).toBe(true);
    rbac.setRole('admin');
    expect(rbac.canAccess('items', 'read')).toBe(true);
    expect(rbac.canAccess('items', 'write')).toBe(true);
    expect(rbac.canAccess('items', 'delete')).toBe(true);
  });

  it('should fail permission checks for viewer role that lacks write/delete', () => {
    rbac.setRole('viewer');
    expect(rbac.canAccess('items', 'read')).toBe(true);
    expect(rbac.canAccess('items', 'write')).toBe(false);
    expect(rbac.canAccess('items', 'delete')).toBe(false);
    expect(rbac.hasPermission('admin:access')).toBe(false);
  });

  it('should keep auth state and RBAC state consistent across multiple role changes', () => {
    rbac.setRole('viewer');
    expect(rbac.hasRole('viewer')).toBe(true);
    expect(auth.hasRole('admin')).toBe(true);

    rbac.setRole('editor');
    expect(rbac.hasRole('editor')).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);

    rbac.setRole('admin');
    expect(rbac.hasPermission('flags:write')).toBe(true);
    expect(auth.state.user?.username).toBe('admin');
  });

  it('should check MFA requirement by inspecting auth state for sensitive admin operations', () => {
    rbac.setRole('admin');
    expect(rbac.hasPermission('admin:access')).toBe(true);
    const user = auth.getCurrentUser();
    expect(user?.mfaEnabled).toBe(false);
    auth.enableMfa();
    const updatedUser = auth.getCurrentUser();
    expect(updatedUser?.mfaEnabled).toBe(true);
    expect(rbac.hasPermission('admin:access')).toBe(true);
  });

  it('should reflect correct permissions for editor role', () => {
    rbac.setRole('editor');
    expect(rbac.hasPermission('items:read')).toBe(true);
    expect(rbac.hasPermission('items:write')).toBe(true);
    expect(rbac.hasPermission('items:delete')).toBe(false);
    expect(rbac.hasPermission('admin:access')).toBe(false);
  });

  it('should return all roles from RBAC service', () => {
    const roles = rbac.getAllRoles();
    expect(roles).toContain('admin');
    expect(roles).toContain('editor');
    expect(roles).toContain('viewer');
  });

  it('should expose role permissions correctly for each role level', () => {
    expect(rbac.getRolePermissions('admin')).toContain('admin:access');
    expect(rbac.getRolePermissions('editor')).not.toContain('admin:access');
    expect(rbac.getRolePermissions('viewer')).toHaveLength(1);
    expect(rbac.getRolePermissions('viewer')[0]).toBe('items:read');
  });
});
