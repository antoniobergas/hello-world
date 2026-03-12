import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExportService } from './export.service';
import { DataRetentionService } from './data-retention.service';
import { PermissionMatrixService } from './permission-matrix.service';

describe('Export + DataRetention + PermissionMatrix Integration', () => {
  let exportSvc: ExportService;
  let dataRetention: DataRetentionService;
  let permissionMatrix: PermissionMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportService, DataRetentionService, PermissionMatrixService],
    });
    exportSvc = TestBed.inject(ExportService);
    dataRetention = TestBed.inject(DataRetentionService);
    permissionMatrix = TestBed.inject(PermissionMatrixService);
  });

  it('should produce valid CSV output', () => {
    const data = [
      { id: '1', name: 'Alice', role: 'admin' },
      { id: '2', name: 'Bob', role: 'viewer' },
    ];
    const csv = exportSvc.exportToCsv(data, 'users.csv');
    const lines = csv.split('\n');
    expect(lines[0]).toBe('id,name,role');
    expect(lines[1]).toBe('1,Alice,admin');
    expect(lines[2]).toBe('2,Bob,viewer');
  });

  it('should produce valid JSON output', () => {
    const data = [
      { id: '1', value: 42 },
      { id: '2', value: 99 },
    ];
    const json = exportSvc.exportToJson(data, 'metrics.json');
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].value).toBe(42);
    expect(parsed[1].id).toBe('2');
  });

  it('should add and retrieve a data retention policy', () => {
    dataRetention.addPolicy({
      id: 'pol-1',
      name: '90-day logs',
      entityType: 'audit_log',
      retentionDays: 90,
      archiveBeforeDelete: false,
      enabled: true,
    });

    expect(dataRetention.policies).toHaveLength(1);
    expect(dataRetention.policies[0].id).toBe('pol-1');
    expect(dataRetention.policies[0].retentionDays).toBe(90);
  });

  it('should schedule records for deletion under an existing policy', () => {
    dataRetention.addPolicy({
      id: 'pol-2',
      name: '30-day sessions',
      entityType: 'session',
      retentionDays: 30,
      archiveBeforeDelete: false,
      enabled: true,
    });

    const record = dataRetention.scheduleForDeletion('pol-2', 'entity-abc');
    expect(record).toBeDefined();
    expect(record?.policyId).toBe('pol-2');
    expect(record?.entityId).toBe('entity-abc');
    expect(record?.archived).toBe(false);
    expect(dataRetention.records).toHaveLength(1);
  });

  it('should grant and revoke permissions for roles correctly', () => {
    permissionMatrix.addPermission({
      id: 'perm-export',
      name: 'Export Data',
      description: 'Can export data',
      resource: 'export',
      action: 'read',
    });

    permissionMatrix.grantPermission('manager', 'perm-export');
    expect(permissionMatrix.hasPermission('manager', 'perm-export')).toBe(true);

    permissionMatrix.revokePermission('manager', 'perm-export');
    expect(permissionMatrix.hasPermission('manager', 'perm-export')).toBe(false);
  });

  it('should check canPerformAction for various role/resource combinations', () => {
    permissionMatrix.addPermission({
      id: 'perm-read-report',
      name: 'Read Reports',
      description: 'Can read reports',
      resource: 'report',
      action: 'read',
    });
    permissionMatrix.addPermission({
      id: 'perm-write-report',
      name: 'Write Reports',
      description: 'Can write reports',
      resource: 'report',
      action: 'write',
    });

    permissionMatrix.grantPermission('analyst', 'perm-read-report');
    permissionMatrix.grantPermission('admin', 'perm-read-report');
    permissionMatrix.grantPermission('admin', 'perm-write-report');

    expect(permissionMatrix.canPerformAction('analyst', 'report', 'read')).toBe(true);
    expect(permissionMatrix.canPerformAction('analyst', 'report', 'write')).toBe(false);
    expect(permissionMatrix.canPerformAction('admin', 'report', 'read')).toBe(true);
    expect(permissionMatrix.canPerformAction('admin', 'report', 'write')).toBe(true);
    expect(permissionMatrix.canPerformAction('viewer', 'report', 'read')).toBe(false);
  });

  it('should identify expired retention records', () => {
    dataRetention.addPolicy({
      id: 'pol-3',
      name: 'Instant expiry',
      entityType: 'log',
      retentionDays: 0,
      archiveBeforeDelete: false,
      enabled: true,
    });

    const record = dataRetention.scheduleForDeletion('pol-3', 'log-001');
    expect(record).toBeDefined();

    const expired = dataRetention.getExpiredRecords();
    expect(expired.some((r) => r.entityId === 'log-001')).toBe(true);
  });

  it('should ensure permission grants are role-specific', () => {
    permissionMatrix.addPermission({
      id: 'perm-delete',
      name: 'Delete Records',
      description: 'Can delete records',
      resource: 'record',
      action: 'delete',
    });

    permissionMatrix.grantPermission('admin', 'perm-delete');
    permissionMatrix.grantPermission('superadmin', 'perm-delete');

    const roles = permissionMatrix.getRolesWithPermission('perm-delete');
    expect(roles).toContain('admin');
    expect(roles).toContain('superadmin');
    expect(roles).not.toContain('viewer');
    expect(roles).not.toContain('editor');
  });

  it('should schedule an export job and record it', () => {
    const data = [{ id: '1', name: 'Test' }];
    const job = exportSvc.scheduleExport('csv', data, 'test.csv');
    expect(job.status).toBe('complete');
    expect(job.recordCount).toBe(1);
    expect(exportSvc.getExportJobs()).toHaveLength(1);
  });

  it('should retrieve permissions assigned to a specific resource', () => {
    permissionMatrix.addPermission({
      id: 'perm-r1',
      name: 'Read Users',
      description: 'Read user list',
      resource: 'users',
      action: 'read',
    });
    permissionMatrix.addPermission({
      id: 'perm-r2',
      name: 'Write Users',
      description: 'Create/update users',
      resource: 'users',
      action: 'write',
    });
    permissionMatrix.addPermission({
      id: 'perm-r3',
      name: 'Read Orders',
      description: 'Read orders',
      resource: 'orders',
      action: 'read',
    });

    const userPerms = permissionMatrix.getResourcePermissions('users');
    expect(userPerms).toHaveLength(2);
    expect(userPerms.map((p) => p.id)).toContain('perm-r1');
    expect(userPerms.map((p) => p.id)).toContain('perm-r2');
  });
});
