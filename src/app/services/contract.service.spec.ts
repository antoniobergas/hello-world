import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ContractService } from './contract.service';

describe('ContractService', () => {
  let service: ContractService;

  beforeEach(() => {
    service = new ContractService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 15 seed contracts', () => {
    expect(service.contracts.length).toBe(15);
  });

  it('should return contracts$ observable', async () => {
    const contracts = await firstValueFrom(service.contracts$);
    expect(contracts.length).toBe(15);
  });

  it('should return activeContracts$ filtered to active status', async () => {
    const active = await firstValueFrom(service.activeContracts$);
    expect(active.every(c => c.status === 'active')).toBe(true);
  });

  it('should create a contract and assign UUID', () => {
    const data = {
      title: 'Test', tenantId: 't1', customerId: 'c1', status: 'draft' as const,
      type: 'msa' as const, value: 1000, currency: 'USD',
      startDate: new Date(), endDate: new Date(), autoRenew: false,
      ownerId: 'u1', notes: '', tags: [],
    };
    const c = service.create(data);
    expect(c.id).toBeTruthy();
    expect(typeof c.id).toBe('string');
  });

  it('should add created contract to list', () => {
    const before = service.contracts.length;
    const data = {
      title: 'New', tenantId: 't1', customerId: 'c1', status: 'draft' as const,
      type: 'nda' as const, value: 0, currency: 'USD',
      startDate: new Date(), endDate: new Date(), autoRenew: false,
      ownerId: 'u1', notes: '', tags: [],
    };
    service.create(data);
    expect(service.contracts.length).toBe(before + 1);
  });

  it('should update a contract', () => {
    service.update('con1', { title: 'Updated Title' });
    expect(service.contracts.find(c => c.id === 'con1')?.title).toBe('Updated Title');
  });

  it('should not affect other contracts on update', () => {
    service.update('con1', { title: 'Changed' });
    expect(service.contracts.find(c => c.id === 'con2')?.title).toBe('SOW Project Beta');
  });

  it('should sign a contract (set status=active and signedAt)', () => {
    service.sign('con3');
    const c = service.contracts.find(c => c.id === 'con3');
    expect(c?.status).toBe('active');
    expect(c?.signedAt).toBeInstanceOf(Date);
  });

  it('should terminate a contract', () => {
    service.terminate('con1');
    const c = service.contracts.find(c => c.id === 'con1');
    expect(c?.status).toBe('terminated');
    expect(c?.terminatedAt).toBeInstanceOf(Date);
  });

  it('should renew a contract and extend endDate by 1 year', () => {
    const original = service.contracts.find(c => c.id === 'con9')!;
    const originalEnd = new Date(original.endDate);
    service.renew('con9');
    const updated = service.contracts.find(c => c.id === 'con9')!;
    expect(updated.status).toBe('renewed');
    expect(updated.endDate.getFullYear()).toBe(originalEnd.getFullYear() + 1);
  });

  it('should getByStatus draft', () => {
    const drafts = service.getByStatus('draft');
    expect(drafts.every(c => c.status === 'draft')).toBe(true);
    expect(drafts.length).toBeGreaterThan(0);
  });

  it('should getByStatus active', () => {
    const active = service.getByStatus('active');
    expect(active.every(c => c.status === 'active')).toBe(true);
  });

  it('should getByTenant t1', () => {
    const t1 = service.getByTenant('t1');
    expect(t1.every(c => c.tenantId === 't1')).toBe(true);
    expect(t1.length).toBeGreaterThan(0);
  });

  it('should getByTenant returns empty for unknown tenant', () => {
    expect(service.getByTenant('unknown')).toEqual([]);
  });

  it('should getExpiringSoon within 30 days', () => {
    const expiring = service.getExpiringSoon(30);
    expect(expiring.length).toBeGreaterThan(0);
    expect(expiring.every(c => c.status === 'active')).toBe(true);
  });

  it('should getExpiringSoon return empty for 0 days', () => {
    const expiring = service.getExpiringSoon(0);
    expect(expiring.length).toBe(0);
  });

  it('should getStats return correct counts', () => {
    const stats = service.getStats();
    expect(stats.total).toBe(15);
    expect(stats.active).toBe(service.getByStatus('active').length);
    expect(stats.expired).toBe(service.getByStatus('expired').length);
  });

  it('should getStats value is sum of active contract values', () => {
    const stats = service.getStats();
    const expectedValue = service.getByStatus('active').reduce((sum, c) => sum + c.value, 0);
    expect(stats.value).toBe(expectedValue);
  });

  it('should ignore renew for unknown id', () => {
    const before = service.contracts.map(c => c.id);
    service.renew('unknown');
    expect(service.contracts.map(c => c.id)).toEqual(before);
  });

  it('should update observable after create', async () => {
    const before = (await firstValueFrom(service.contracts$)).length;
    const data = {
      title: 'X', tenantId: 't1', customerId: 'c1', status: 'draft' as const,
      type: 'msa' as const, value: 0, currency: 'USD',
      startDate: new Date(), endDate: new Date(), autoRenew: false,
      ownerId: 'u1', notes: '', tags: [],
    };
    service.create(data);
    const after = (await firstValueFrom(service.contracts$)).length;
    expect(after).toBe(before + 1);
  });

  it('should have con1 in seed data', () => {
    expect(service.contracts.find(c => c.id === 'con1')).toBeTruthy();
  });

  it('should getExpiringSoon not include expired contracts', () => {
    service.terminate('con1');
    const expiring = service.getExpiringSoon(30);
    expect(expiring.find(c => c.id === 'con1')).toBeUndefined();
  });
});
