import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ApiKeyService] });
    service = TestBed.inject(ApiKeyService);
  });

  it('should be created', () => { expect(service).toBeTruthy(); });
  it('should initialize with 6 seed keys', () => { expect(service.keys.length).toBe(6); });
  it('should generate a new key', () => {
    const before = service.keys.length;
    service.generate('My Key', 't1', 'u1', ['read']);
    expect(service.keys.length).toBe(before + 1);
  });
  it('should generated key starts with prefix', () => {
    const k = service.generate('My Key', 't1', 'u1', ['read']);
    expect(k.key.startsWith('sk_live_')).toBe(true);
  });
  it('should generated key has status active', () => {
    const k = service.generate('My Key', 't1', 'u1', ['read']);
    expect(k.status).toBe('active');
  });
  it('should generated key has UUID id', () => {
    const k = service.generate('My Key', 't1', 'u1', ['read']);
    expect(k.id).toBeTruthy();
  });
  it('should revoke a key', () => {
    service.revoke('key1');
    expect(service.keys.find(k => k.id === 'key1')?.status).toBe('revoked');
  });
  it('should rotate creates a new key', () => {
    const before = service.keys.length;
    service.rotate('key1');
    expect(service.keys.length).toBe(before + 1);
  });
  it('should rotate revokes old key', () => {
    service.rotate('key1');
    expect(service.keys.find(k => k.id === 'key1')?.status).toBe('revoked');
  });
  it('should rotate returns undefined for unknown key', () => {
    expect(service.rotate('nonexistent')).toBeUndefined();
  });
  it('should getByTenant returns keys for tenant', () => {
    const keys = service.getByTenant('t1');
    expect(keys.every(k => k.tenantId === 't1')).toBe(true);
    expect(keys.length).toBeGreaterThan(0);
  });
  it('should getByOwner returns keys for owner', () => {
    const keys = service.getByOwner('u1');
    expect(keys.every(k => k.ownerId === 'u1')).toBe(true);
  });
  it('should isValid returns true for active key', () => {
    expect(service.isValid('prod_live_xK3mN8pQrS')).toBe(true);
  });
  it('should isValid returns false for revoked key', () => {
    expect(service.isValid('old_live_aA1bB2cCdD')).toBe(false);
  });
  it('should isValid returns false for expired key', () => {
    expect(service.isValid('exp_live_bB2cC3dDeE')).toBe(false);
  });
  it('should isValid returns false for unknown key', () => {
    expect(service.isValid('unknown_key')).toBe(false);
  });
  it('should getLastUsed returns date', () => {
    const date = service.getLastUsed('key1');
    expect(date).toBeInstanceOf(Date);
  });
  it('should getLastUsed returns undefined for key never used', () => {
    expect(service.getLastUsed('key3')).toBeUndefined();
  });
  it('should logUsage updates lastUsedAt', () => {
    service.logUsage('key3');
    expect(service.getLastUsed('key3')).toBeInstanceOf(Date);
  });
  it('should emit active keys via activeKeys$', async () => {
    const active = await firstValueFrom(service.activeKeys$);
    expect(active.every(k => k.status === 'active')).toBe(true);
  });
  it('should getByTenant returns empty for unknown tenant', () => {
    expect(service.getByTenant('nonexistent')).toHaveLength(0);
  });
});
