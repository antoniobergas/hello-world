import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  tenantId: string;
  ownerId: string;
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'key1',
    name: 'Production API Key',
    key: 'prod_live_xK3mN8pQrS',
    prefix: 'prod_live_',
    tenantId: 't1',
    ownerId: 'u1',
    permissions: ['read', 'write'],
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastUsedAt: new Date('2025-01-10'),
  },
  {
    id: 'key2',
    name: 'Development Key',
    key: 'dev_test_yL4nO9qRsT',
    prefix: 'dev_test_',
    tenantId: 't1',
    ownerId: 'u1',
    permissions: ['read'],
    status: 'active',
    createdAt: new Date('2024-06-01'),
    lastUsedAt: new Date('2025-01-08'),
  },
  {
    id: 'key3',
    name: 'CI/CD Key',
    key: 'ci_live_zM5oP0rStU',
    prefix: 'ci_live_',
    tenantId: 't2',
    ownerId: 'u2',
    permissions: ['read', 'write', 'deploy'],
    status: 'active',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'key4',
    name: 'Revoked Key',
    key: 'old_live_aA1bB2cCdD',
    prefix: 'old_live_',
    tenantId: 't1',
    ownerId: 'u3',
    permissions: ['read'],
    status: 'revoked',
    createdAt: new Date('2023-06-01'),
    lastUsedAt: new Date('2023-12-01'),
  },
  {
    id: 'key5',
    name: 'Expired Key',
    key: 'exp_live_bB2cC3dDeE',
    prefix: 'exp_live_',
    tenantId: 't3',
    ownerId: 'u2',
    permissions: ['read'],
    status: 'expired',
    createdAt: new Date('2022-01-01'),
    expiresAt: new Date('2023-01-01'),
  },
  {
    id: 'key6',
    name: 'Analytics Key',
    key: 'prod_live_cC3dD4eEfF',
    prefix: 'prod_live_',
    tenantId: 't2',
    ownerId: 'u4',
    permissions: ['read', 'analytics'],
    status: 'active',
    createdAt: new Date('2024-09-01'),
    lastUsedAt: new Date('2025-01-05'),
  },
];

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private keysSubject = new BehaviorSubject<ApiKey[]>(INITIAL_KEYS);
  private usageLog = new Map<string, Date[]>();

  readonly keys$: Observable<ApiKey[]> = this.keysSubject.asObservable();

  readonly activeKeys$: Observable<ApiKey[]> = this.keys$.pipe(
    map((keys) => keys.filter((k) => k.status === 'active')),
  );

  get keys(): ApiKey[] {
    return this.keysSubject.value;
  }

  generate(
    name: string,
    tenantId: string,
    ownerId: string,
    permissions: string[],
    expiresAt?: Date,
  ): ApiKey {
    const prefix = `sk_live_`;
    const key = `${prefix}${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name,
      key,
      prefix,
      tenantId,
      ownerId,
      permissions,
      status: 'active',
      createdAt: new Date(),
      expiresAt,
    };
    this.keysSubject.next([...this.keysSubject.value, newKey]);
    return newKey;
  }

  revoke(id: string): void {
    this.keysSubject.next(
      this.keysSubject.value.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k)),
    );
  }

  rotate(id: string): ApiKey | undefined {
    const existing = this.keysSubject.value.find((k) => k.id === id);
    if (!existing) return undefined;
    this.revoke(id);
    return this.generate(
      existing.name,
      existing.tenantId,
      existing.ownerId,
      existing.permissions,
      existing.expiresAt,
    );
  }

  getByTenant(tenantId: string): ApiKey[] {
    return this.keysSubject.value.filter((k) => k.tenantId === tenantId);
  }

  getByOwner(ownerId: string): ApiKey[] {
    return this.keysSubject.value.filter((k) => k.ownerId === ownerId);
  }

  isValid(key: string): boolean {
    const apiKey = this.keysSubject.value.find((k) => k.key === key);
    if (!apiKey || apiKey.status !== 'active') return false;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return false;
    return true;
  }

  getLastUsed(id: string): Date | undefined {
    return this.keysSubject.value.find((k) => k.id === id)?.lastUsedAt;
  }

  logUsage(id: string): void {
    const now = new Date();
    const existing = this.usageLog.get(id) ?? [];
    this.usageLog.set(id, [...existing, now]);
    this.keysSubject.next(
      this.keysSubject.value.map((k) => (k.id === id ? { ...k, lastUsedAt: now } : k)),
    );
  }
}
