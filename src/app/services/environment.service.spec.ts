import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    service = new EnvironmentService();
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should have 8 seed environments', () => {
    expect(service.environments.length).toBe(8);
  });

  it('should have empty promotions initially', () => {
    expect(service.promotions.length).toBe(0);
  });

  it('should expose environments$ observable', async () => {
    const envs = await firstValueFrom(service.environments$);
    expect(envs.length).toBe(8);
  });

  it('should expose promotions$ observable', async () => {
    const promos = await firstValueFrom(service.promotions$);
    expect(promos.length).toBe(0);
  });

  it('should create an environment with UUID and deployCount=0', () => {
    const env = service.create({
      name: 'Test',
      slug: 'test',
      type: 'development',
      tenantId: 't1',
      config: {},
      status: 'active',
    });
    expect(env.id).toBeTruthy();
    expect(typeof env.id).toBe('string');
    expect(env.deployCount).toBe(0);
  });

  it('should add created environment to list', () => {
    service.create({
      name: 'X',
      slug: 'x',
      type: 'staging',
      tenantId: 't1',
      config: {},
      status: 'active',
    });
    expect(service.environments.length).toBe(9);
  });

  it('should lock an environment', () => {
    service.lock('env1', 'u1');
    const env = service.environments.find((e) => e.id === 'env1')!;
    expect(env.status).toBe('locked');
    expect(env.lockedBy).toBe('u1');
  });

  it('should unlock an environment', () => {
    service.unlock('env3');
    const env = service.environments.find((e) => e.id === 'env3')!;
    expect(env.status).toBe('active');
    expect(env.lockedBy).toBeUndefined();
  });

  it('should promote creates a pending promotion', () => {
    const p = service.promote('env1', 'env2', 'u1');
    expect(p.status).toBe('pending');
    expect(p.fromEnvId).toBe('env1');
    expect(p.toEnvId).toBe('env2');
    expect(p.requestedBy).toBe('u1');
    expect(p.requestedAt).toBeInstanceOf(Date);
  });

  it('should promote adds to promotions list', () => {
    service.promote('env1', 'env2', 'u1');
    expect(service.promotions.length).toBe(1);
  });

  it('should approvePromotion sets approved status and approvedBy', () => {
    const p = service.promote('env1', 'env2', 'u1');
    service.approvePromotion(p.id, 'u2');
    const approved = service.promotions.find((x) => x.id === p.id)!;
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('u2');
  });

  it('should deployPromotion sets deployed status and deployedAt', () => {
    const p = service.promote('env1', 'env2', 'u1');
    service.deployPromotion(p.id);
    const deployed = service.promotions.find((x) => x.id === p.id)!;
    expect(deployed.status).toBe('deployed');
    expect(deployed.deployedAt).toBeInstanceOf(Date);
  });

  it('should deployPromotion increments target env deployCount', () => {
    const before = service.environments.find((e) => e.id === 'env2')!.deployCount;
    const p = service.promote('env1', 'env2', 'u1');
    service.deployPromotion(p.id);
    expect(service.environments.find((e) => e.id === 'env2')!.deployCount).toBe(before + 1);
  });

  it('should deployPromotion sets lastDeployedAt on target', () => {
    const p = service.promote('env5', 'env6', 'u2');
    service.deployPromotion(p.id);
    expect(service.environments.find((e) => e.id === 'env6')!.lastDeployedAt).toBeInstanceOf(Date);
  });

  it('should getByTenant t1', () => {
    const t1 = service.getByTenant('t1');
    expect(t1.every((e) => e.tenantId === 't1')).toBe(true);
    expect(t1.length).toBe(4);
  });

  it('should getByTenant t2', () => {
    const t2 = service.getByTenant('t2');
    expect(t2.length).toBe(4);
  });

  it('should getPromotionHistory returns promotions for env', () => {
    service.promote('env1', 'env2', 'u1');
    service.promote('env3', 'env1', 'u2');
    const history = service.getPromotionHistory('env1');
    expect(history.length).toBe(2);
  });

  it('should getPromotionHistory returns empty if no promotions', () => {
    expect(service.getPromotionHistory('env1')).toEqual([]);
  });

  it('should have env1 in seed data', () => {
    expect(service.environments.find((e) => e.id === 'env1')).toBeTruthy();
  });

  it('should deployPromotion does nothing for unknown promotion', () => {
    const before = service.environments.map((e) => e.deployCount);
    service.deployPromotion('unknown');
    expect(service.environments.map((e) => e.deployCount)).toEqual(before);
  });
});
