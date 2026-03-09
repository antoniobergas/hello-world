import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  active: boolean;
}

const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', name: 'Acme Corp', domain: 'acme.example.com', plan: 'enterprise', active: true },
  { id: 't2', name: 'Globex', domain: 'globex.example.com', plan: 'pro', active: true },
  { id: 't3', name: 'Initech', domain: 'initech.example.com', plan: 'free', active: false },
];

@Injectable({ providedIn: 'root' })
export class TenantService {
  private tenantsSubject = new BehaviorSubject<Tenant[]>(INITIAL_TENANTS);
  private currentTenantSubject = new BehaviorSubject<Tenant | null>(INITIAL_TENANTS[0]);

  readonly tenants$: Observable<Tenant[]> = this.tenantsSubject.asObservable();
  readonly currentTenant$: Observable<Tenant | null> = this.currentTenantSubject.asObservable();

  readonly activeTenants$: Observable<Tenant[]> = this.tenants$.pipe(
    map((tenants) => tenants.filter((t) => t.active)),
  );

  get tenants(): Tenant[] {
    return this.tenantsSubject.value;
  }

  get currentTenant(): Tenant | null {
    return this.currentTenantSubject.value;
  }

  switchTenant(id: string): void {
    const tenant = this.getTenant(id);
    if (tenant && tenant.active) {
      this.currentTenantSubject.next(tenant);
    }
  }

  getTenant(id: string): Tenant | undefined {
    return this.tenantsSubject.value.find((t) => t.id === id);
  }

  addTenant(tenant: Tenant): void {
    this.tenantsSubject.next([...this.tenantsSubject.value, tenant]);
  }

  deactivateTenant(id: string): void {
    this.tenantsSubject.next(
      this.tenantsSubject.value.map((t) => (t.id === id ? { ...t, active: false } : t)),
    );
    if (this.currentTenantSubject.value?.id === id) {
      this.currentTenantSubject.next(null);
    }
  }

  getActiveTenants(): Tenant[] {
    return this.tenantsSubject.value.filter((t) => t.active);
  }
}
