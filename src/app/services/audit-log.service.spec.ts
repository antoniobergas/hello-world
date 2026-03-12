import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty log', () => {
    expect(service.entries.length).toBe(0);
  });

  it('should log an entry and return it', () => {
    const entry = service.log('u1', 'alice', 'CREATE', 'items', 'Created item');
    expect(entry.userId).toBe('u1');
    expect(entry.username).toBe('alice');
    expect(entry.action).toBe('CREATE');
    expect(entry.resource).toBe('items');
    expect(entry.details).toBe('Created item');
    expect(entry.success).toBe(true);
  });

  it('should store logged entries', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'Created item');
    service.log('u1', 'alice', 'UPDATE', 'items', 'Updated item');
    expect(service.entries.length).toBe(2);
  });

  it('should filter entries by user', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'test');
    service.log('u2', 'bob', 'DELETE', 'items', 'test');
    const aliceEntries = service.getByUser('u1');
    expect(aliceEntries.length).toBe(1);
    expect(aliceEntries[0].username).toBe('alice');
  });

  it('should filter entries by action', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'test');
    service.log('u1', 'alice', 'DELETE', 'items', 'test');
    const creates = service.getByAction('CREATE');
    expect(creates.length).toBe(1);
  });

  it('should filter entries by resource', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'test');
    service.log('u1', 'alice', 'CONFIG_CHANGE', 'config', 'test');
    const itemEntries = service.getByResource('items');
    expect(itemEntries.length).toBe(1);
  });

  it('should clear all entries', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'test');
    service.clear();
    expect(service.entries.length).toBe(0);
  });

  it('should get stats with byAction counts', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'test');
    service.log('u1', 'alice', 'CREATE', 'items', 'test2');
    service.log('u1', 'alice', 'DELETE', 'items', 'test3', { success: false });
    const stats = service.getStats();
    expect(stats.total).toBe(3);
    expect(stats.byAction['CREATE']).toBe(2);
    expect(stats.byAction['DELETE']).toBe(1);
    expect(stats.failureCount).toBe(1);
  });

  it('should return recent entries in reverse order', async () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'first');
    service.log('u1', 'alice', 'UPDATE', 'items', 'second');
    const recent = await firstValueFrom(service.recentEntries$);
    expect(recent[0].details).toBe('second');
    expect(recent[1].details).toBe('first');
  });

  it('should set severity and success on log entry', () => {
    const entry = service.log('u1', 'alice', 'DELETE', 'items', 'risky', {
      severity: 'high',
      success: false,
    });
    expect(entry.severity).toBe('high');
    expect(entry.success).toBe(false);
  });

  it('should clear entries older than given date', () => {
    service.log('u1', 'alice', 'CREATE', 'items', 'old');
    service.log('u1', 'alice', 'UPDATE', 'items', 'recent');
    const removed = service.clearOlderThan(new Date(Date.now() - 1000));
    // Both entries are new so none should be removed
    expect(removed).toBe(0);
    expect(service.entries.length).toBe(2);
  });
});
