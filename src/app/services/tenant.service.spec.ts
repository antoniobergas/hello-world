import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { TenantService, Tenant } from './tenant.service';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TenantService] });
    service = TestBed.inject(TenantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 3 tenants', () => {
    expect(service.tenants.length).toBe(3);
  });

  it('should have first tenant as current tenant on init', () => {
    expect(service.currentTenant?.id).toBe('t1');
  });

  it('should switch to a valid active tenant', () => {
    service.switchTenant('t2');
    expect(service.currentTenant?.id).toBe('t2');
  });

  it('should not switch to an inactive tenant', () => {
    service.switchTenant('t3');
    expect(service.currentTenant?.id).toBe('t1');
  });

  it('should get a tenant by id', () => {
    const tenant = service.getTenant('t2');
    expect(tenant?.name).toBe('Globex');
  });

  it('should return undefined for unknown tenant id', () => {
    expect(service.getTenant('unknown')).toBeUndefined();
  });

  it('should add a new tenant', () => {
    const newTenant: Tenant = {
      id: 't4',
      name: 'NewCo',
      domain: 'newco.com',
      plan: 'pro',
      active: true,
    };
    service.addTenant(newTenant);
    expect(service.tenants.length).toBe(4);
    expect(service.getTenant('t4')?.name).toBe('NewCo');
  });

  it('should deactivate a tenant', () => {
    service.deactivateTenant('t2');
    expect(service.getTenant('t2')?.active).toBe(false);
  });

  it('should clear currentTenant when deactivating the current one', () => {
    service.deactivateTenant('t1');
    expect(service.currentTenant).toBeNull();
  });

  it('should return only active tenants from getActiveTenants()', () => {
    const active = service.getActiveTenants();
    expect(active.every((t) => t.active)).toBe(true);
    expect(active.length).toBe(2);
  });

  it('should emit updated list via tenants$ after addTenant', async () => {
    const newTenant: Tenant = {
      id: 't5',
      name: 'BetaCo',
      domain: 'betaco.com',
      plan: 'free',
      active: true,
    };
    service.addTenant(newTenant);
    const tenants = await firstValueFrom(service.tenants$);
    expect(tenants.length).toBe(4);
  });

  it('should emit active tenants via activeTenants$', async () => {
    const active = await firstValueFrom(service.activeTenants$);
    expect(active.length).toBe(2);
  });

  it('should emit current tenant via currentTenant$ after switch', async () => {
    service.switchTenant('t2');
    const current = await firstValueFrom(service.currentTenant$);
    expect(current?.id).toBe('t2');
  });
});
