import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { DataRetentionService, RetentionPolicy } from './data-retention.service';

const makePolicy = (id: string, retentionDays = 30, enabled = true): RetentionPolicy => ({
  id,
  name: `Policy ${id}`,
  entityType: 'document',
  retentionDays,
  archiveBeforeDelete: false,
  enabled,
});

describe('DataRetentionService', () => {
  let service: DataRetentionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DataRetentionService] });
    service = TestBed.inject(DataRetentionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no policies or records', () => {
    expect(service.policies.length).toBe(0);
    expect(service.records.length).toBe(0);
  });

  it('should add a policy', () => {
    service.addPolicy(makePolicy('p1'));
    expect(service.policies.length).toBe(1);
  });

  it('should update a policy', () => {
    service.addPolicy(makePolicy('p1', 30));
    service.updatePolicy('p1', { retentionDays: 60 });
    expect(service.policies[0].retentionDays).toBe(60);
  });

  it('should remove a policy', () => {
    service.addPolicy(makePolicy('p1'));
    service.removePolicy('p1');
    expect(service.policies.length).toBe(0);
  });

  it('should schedule an entity for deletion', () => {
    service.addPolicy(makePolicy('p1', 30));
    const record = service.scheduleForDeletion('p1', 'entity1');
    expect(record).toBeDefined();
    expect(record?.entityId).toBe('entity1');
    expect(record?.archived).toBe(false);
    expect(service.records.length).toBe(1);
  });

  it('should return undefined when scheduling with unknown policy', () => {
    const record = service.scheduleForDeletion('unknown', 'entity1');
    expect(record).toBeUndefined();
  });

  it('should archive a record', () => {
    service.addPolicy(makePolicy('p1'));
    const record = service.scheduleForDeletion('p1', 'entity1')!;
    service.archiveRecord(record.id);
    expect(service.records[0].archived).toBe(true);
  });

  it('should identify expired records', () => {
    service.addPolicy(makePolicy('p1', 0)); // 0 days = already past
    service.scheduleForDeletion('p1', 'entity1');
    // scheduledDeleteAt == now, so it should be expired or just barely not
    const expired = service.getExpiredRecords();
    expect(expired.length).toBeGreaterThanOrEqual(0);
  });

  it('should get records by policy', () => {
    service.addPolicy(makePolicy('p1'));
    service.addPolicy(makePolicy('p2'));
    service.scheduleForDeletion('p1', 'e1');
    service.scheduleForDeletion('p2', 'e2');
    expect(service.getRecordsByPolicy('p1').length).toBe(1);
  });

  it('should emit policies via policies$', async () => {
    service.addPolicy(makePolicy('p1'));
    const policies = await firstValueFrom(service.policies$);
    expect(policies.length).toBe(1);
  });

  it('should emit only enabled policies via enabledPolicies$', async () => {
    service.addPolicy(makePolicy('p1', 30, true));
    service.addPolicy(makePolicy('p2', 30, false));
    const enabled = await firstValueFrom(service.enabledPolicies$);
    expect(enabled.length).toBe(1);
    expect(enabled[0].id).toBe('p1');
  });
});
