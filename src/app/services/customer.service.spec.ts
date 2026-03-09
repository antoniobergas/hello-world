import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    service = new CustomerService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 30 seed customers', () => {
    expect(service.customers.length).toBe(30);
  });

  it('should add a new customer', () => {
    const before = service.customers.length;
    service.add({ name: 'New User', email: 'new@test.com', phone: '555-9999', company: 'TestCo', plan: 'starter', status: 'active', tags: [], contractValue: 1000, ownerId: 'u1' });
    expect(service.customers.length).toBe(before + 1);
  });

  it('should assign a UUID on add', () => {
    const c = service.add({ name: 'New User', email: 'new@test.com', phone: '555-9999', company: 'TestCo', plan: 'starter', status: 'active', tags: [], contractValue: 1000, ownerId: 'u1' });
    expect(c.id).toBeTruthy();
    expect(typeof c.id).toBe('string');
  });

  it('should assign createdAt on add', () => {
    const c = service.add({ name: 'New User', email: 'new@test.com', phone: '555-9999', company: 'TestCo', plan: 'starter', status: 'active', tags: [], contractValue: 1000, ownerId: 'u1' });
    expect(c.createdAt).toBeInstanceOf(Date);
  });

  it('should update a customer', () => {
    service.update('c1', { name: 'Updated Name' });
    expect(service.customers.find((c) => c.id === 'c1')?.name).toBe('Updated Name');
  });

  it('should remove a customer', () => {
    service.remove('c1');
    expect(service.customers.find((c) => c.id === 'c1')).toBeUndefined();
  });

  it('should not affect other customers on remove', () => {
    const before = service.customers.length;
    service.remove('c1');
    expect(service.customers.length).toBe(before - 1);
  });

  it('should getByPlan: enterprise', () => {
    const enterprise = service.getByPlan('enterprise');
    expect(enterprise.every((c) => c.plan === 'enterprise')).toBe(true);
    expect(enterprise.length).toBeGreaterThan(0);
  });

  it('should getByPlan: starter', () => {
    const starters = service.getByPlan('starter');
    expect(starters.every((c) => c.plan === 'starter')).toBe(true);
  });

  it('should getByStatus: active', () => {
    const active = service.getByStatus('active');
    expect(active.every((c) => c.status === 'active')).toBe(true);
    expect(active.length).toBeGreaterThan(0);
  });

  it('should getByStatus: churned', () => {
    const churned = service.getByStatus('churned');
    expect(churned.every((c) => c.status === 'churned')).toBe(true);
    expect(churned.length).toBeGreaterThan(0);
  });

  it('should search by name (case-insensitive)', () => {
    const results = service.search('alice');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Alice');
  });

  it('should search by email', () => {
    const results = service.search('acme.com');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should search by company', () => {
    const results = service.search('Tyrell');
    expect(results.some((c) => c.company === 'Tyrell Corp')).toBe(true);
  });

  it('should return empty array for no-match search', () => {
    expect(service.search('zzznomatch999')).toHaveLength(0);
  });

  it('should getByOwner returns correct customers', () => {
    const owned = service.getByOwner('u1');
    expect(owned.every((c) => c.ownerId === 'u1')).toBe(true);
    expect(owned.length).toBeGreaterThan(0);
  });

  it('should return empty array for unknown owner', () => {
    expect(service.getByOwner('nonexistent')).toHaveLength(0);
  });

  it('should getStats returns correct totals', () => {
    const stats = service.getStats();
    expect(stats.total).toBe(service.customers.length);
    expect(stats.active + stats.inactive + stats.churned).toBe(stats.total);
  });

  it('should stats update after add', () => {
    const before = service.getStats().total;
    service.add({ name: 'New', email: 'n@n.com', phone: '555-0000', company: 'NewCo', plan: 'starter', status: 'active', tags: [], contractValue: 500, ownerId: 'u1' });
    expect(service.getStats().total).toBe(before + 1);
  });

  it('should stats totalContractValue be sum of all contract values', () => {
    const stats = service.getStats();
    const expected = service.customers.reduce((s, c) => s + c.contractValue, 0);
    expect(stats.totalContractValue).toBe(expected);
  });

  it('should emit updated customers via customers$', async () => {
    service.add({ name: 'X', email: 'x@x.com', phone: '000', company: 'X', plan: 'starter', status: 'active', tags: [], contractValue: 0, ownerId: 'u1' });
    const customers = await firstValueFrom(service.customers$);
    expect(customers.length).toBe(31);
  });

  it('should emit only active customers via activeCustomers$', async () => {
    const active = await firstValueFrom(service.activeCustomers$);
    expect(active.every((c) => c.status === 'active')).toBe(true);
  });

  it('should emit stats via stats$', async () => {
    const stats = await firstValueFrom(service.stats$);
    expect(stats.total).toBeGreaterThan(0);
    expect(typeof stats.totalContractValue).toBe('number');
  });

  it('should handle remove of non-existent id gracefully', () => {
    const before = service.customers.length;
    service.remove('nonexistent');
    expect(service.customers.length).toBe(before);
  });
});
