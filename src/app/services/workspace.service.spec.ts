import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(() => {
    service = new WorkspaceService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 8 seed workspaces', () => {
    expect(service.workspaces.length).toBe(8);
  });

  it('should create a new workspace', () => {
    const before = service.workspaces.length;
    service.create({ name: 'New WS', slug: 'new-ws', description: '', tenantId: 't1', ownerId: 'u1', memberIds: [], settings: { allowGuestAccess: false, defaultRole: 'viewer', features: [] }, archived: false });
    expect(service.workspaces.length).toBe(before + 1);
  });

  it('should create assigns UUID and createdAt', () => {
    const ws = service.create({ name: 'New WS', slug: 'new-ws', description: '', tenantId: 't1', ownerId: 'u1', memberIds: [], settings: { allowGuestAccess: false, defaultRole: 'viewer', features: [] }, archived: false });
    expect(ws.id).toBeTruthy();
    expect(ws.createdAt).toBeInstanceOf(Date);
  });

  it('should update a workspace name', () => {
    service.update('ws1', { name: 'Engineering v2' });
    expect(service.workspaces.find((w) => w.id === 'ws1')?.name).toBe('Engineering v2');
  });

  it('should archive sets archived true', () => {
    service.archive('ws1');
    expect(service.workspaces.find((w) => w.id === 'ws1')?.archived).toBe(true);
  });

  it('should addMember adds user to workspace', () => {
    service.addMember('ws1', 'u99');
    expect(service.workspaces.find((w) => w.id === 'ws1')?.memberIds).toContain('u99');
  });

  it('should not add duplicate member', () => {
    service.addMember('ws1', 'u1');
    const ws = service.workspaces.find((w) => w.id === 'ws1')!;
    expect(ws.memberIds.filter((m) => m === 'u1').length).toBe(1);
  });

  it('should removeMember removes user', () => {
    service.removeMember('ws1', 'u1');
    expect(service.workspaces.find((w) => w.id === 'ws1')?.memberIds).not.toContain('u1');
  });

  it('should getByTenant returns correct workspaces', () => {
    const ws = service.getByTenant('t1');
    expect(ws.every((w) => w.tenantId === 't1')).toBe(true);
    expect(ws.length).toBeGreaterThan(0);
  });

  it('should getByTenant returns empty for unknown tenant', () => {
    expect(service.getByTenant('nonexistent')).toHaveLength(0);
  });

  it('should getByMember returns correct workspaces', () => {
    const ws = service.getByMember('u1');
    expect(ws.some((w) => w.id === 'ws1')).toBe(true);
  });

  it('should getByMember returns empty for unknown user', () => {
    expect(service.getByMember('nobody')).toHaveLength(0);
  });

  it('should getBySlug returns correct workspace', () => {
    const ws = service.getBySlug('engineering');
    expect(ws?.id).toBe('ws1');
  });

  it('should getBySlug returns undefined for unknown slug', () => {
    expect(service.getBySlug('nonexistent-slug')).toBeUndefined();
  });

  it('should emit workspaces via workspaces$', async () => {
    const ws = await firstValueFrom(service.workspaces$);
    expect(ws.length).toBe(8);
  });

  it('should emit active (non-archived) workspaces via activeWorkspaces$', async () => {
    const active = await firstValueFrom(service.activeWorkspaces$);
    expect(active.every((w) => !w.archived)).toBe(true);
    expect(active.length).toBe(7);
  });

  it('should update workspace settings', () => {
    service.update('ws2', { settings: { allowGuestAccess: false, defaultRole: 'editor', features: ['campaigns', 'analytics'] } });
    const ws = service.workspaces.find((w) => w.id === 'ws2')!;
    expect(ws.settings.allowGuestAccess).toBe(false);
    expect(ws.settings.features).toContain('analytics');
  });

  it('should getByMember includes user after addMember', () => {
    service.addMember('ws3', 'u99');
    expect(service.getByMember('u99').some((w) => w.id === 'ws3')).toBe(true);
  });

  it('should getByMember excludes user after removeMember', () => {
    service.removeMember('ws1', 'u2');
    expect(service.getByMember('u2').some((w) => w.id === 'ws1')).toBe(false);
  });

  it('should active workspaces count decreases after archive', async () => {
    service.archive('ws2');
    const active = await firstValueFrom(service.activeWorkspaces$);
    expect(active.length).toBe(6);
  });
});
