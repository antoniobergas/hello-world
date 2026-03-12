import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Environment {
  id: string;
  name: string;
  slug: string;
  type: 'development' | 'staging' | 'production';
  tenantId: string;
  config: Record<string, string>;
  status: 'active' | 'inactive' | 'locked';
  lockedBy?: string;
  lastDeployedAt?: Date;
  deployCount: number;
}

export interface EnvironmentPromotion {
  id: string;
  fromEnvId: string;
  toEnvId: string;
  status: 'pending' | 'approved' | 'deployed' | 'rolled_back';
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  deployedAt?: Date;
}

const SEED_ENVIRONMENTS: Environment[] = [
  {
    id: 'env1',
    name: 'Dev T1',
    slug: 'dev-t1',
    type: 'development',
    tenantId: 't1',
    config: {},
    status: 'active',
    deployCount: 5,
  },
  {
    id: 'env2',
    name: 'Staging T1',
    slug: 'staging-t1',
    type: 'staging',
    tenantId: 't1',
    config: {},
    status: 'active',
    deployCount: 3,
  },
  {
    id: 'env3',
    name: 'Prod T1',
    slug: 'prod-t1',
    type: 'production',
    tenantId: 't1',
    config: {},
    status: 'locked',
    lockedBy: 'u1',
    deployCount: 10,
  },
  {
    id: 'env4',
    name: 'Dev T1 B',
    slug: 'dev-t1-b',
    type: 'development',
    tenantId: 't1',
    config: {},
    status: 'inactive',
    deployCount: 0,
  },
  {
    id: 'env5',
    name: 'Dev T2',
    slug: 'dev-t2',
    type: 'development',
    tenantId: 't2',
    config: {},
    status: 'active',
    deployCount: 2,
  },
  {
    id: 'env6',
    name: 'Staging T2',
    slug: 'staging-t2',
    type: 'staging',
    tenantId: 't2',
    config: {},
    status: 'active',
    deployCount: 1,
  },
  {
    id: 'env7',
    name: 'Prod T2',
    slug: 'prod-t2',
    type: 'production',
    tenantId: 't2',
    config: {},
    status: 'active',
    deployCount: 7,
  },
  {
    id: 'env8',
    name: 'Dev T2 B',
    slug: 'dev-t2-b',
    type: 'development',
    tenantId: 't2',
    config: {},
    status: 'locked',
    lockedBy: 'u2',
    deployCount: 0,
  },
];

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private environmentsSubject = new BehaviorSubject<Environment[]>(SEED_ENVIRONMENTS);
  private promotionsSubject = new BehaviorSubject<EnvironmentPromotion[]>([]);

  readonly environments$: Observable<Environment[]> = this.environmentsSubject.asObservable();
  readonly promotions$: Observable<EnvironmentPromotion[]> = this.promotionsSubject.asObservable();

  get environments(): Environment[] {
    return this.environmentsSubject.getValue();
  }

  get promotions(): EnvironmentPromotion[] {
    return this.promotionsSubject.getValue();
  }

  create(data: Omit<Environment, 'id' | 'deployCount'>): Environment {
    const env: Environment = { ...data, id: crypto.randomUUID(), deployCount: 0 };
    this.environmentsSubject.next([...this.environments, env]);
    return env;
  }

  lock(id: string, lockedBy: string): void {
    this.environmentsSubject.next(
      this.environments.map((e) => (e.id === id ? { ...e, status: 'locked', lockedBy } : e)),
    );
  }

  unlock(id: string): void {
    this.environmentsSubject.next(
      this.environments.map((e) =>
        e.id === id ? { ...e, status: 'active', lockedBy: undefined } : e,
      ),
    );
  }

  promote(fromEnvId: string, toEnvId: string, requestedBy: string): EnvironmentPromotion {
    const promotion: EnvironmentPromotion = {
      id: crypto.randomUUID(),
      fromEnvId,
      toEnvId,
      status: 'pending',
      requestedBy,
      requestedAt: new Date(),
    };
    this.promotionsSubject.next([...this.promotions, promotion]);
    return promotion;
  }

  approvePromotion(promotionId: string, approvedBy: string): void {
    this.promotionsSubject.next(
      this.promotions.map((p) =>
        p.id === promotionId ? { ...p, status: 'approved', approvedBy } : p,
      ),
    );
  }

  deployPromotion(promotionId: string): void {
    const promotion = this.promotions.find((p) => p.id === promotionId);
    if (!promotion) return;
    this.promotionsSubject.next(
      this.promotions.map((p) =>
        p.id === promotionId ? { ...p, status: 'deployed', deployedAt: new Date() } : p,
      ),
    );
    this.environmentsSubject.next(
      this.environments.map((e) =>
        e.id === promotion.toEnvId
          ? { ...e, deployCount: e.deployCount + 1, lastDeployedAt: new Date() }
          : e,
      ),
    );
  }

  getByTenant(tenantId: string): Environment[] {
    return this.environments.filter((e) => e.tenantId === tenantId);
  }

  getPromotionHistory(envId: string): EnvironmentPromotion[] {
    return this.promotions.filter((p) => p.fromEnvId === envId || p.toEnvId === envId);
  }
}
