import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Contract {
  id: string;
  title: string;
  tenantId: string;
  customerId: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  type: 'msa' | 'sow' | 'nda' | 'saas';
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  ownerId: string;
  signedAt?: Date;
  terminatedAt?: Date;
  notes: string;
  tags: string[];
}

const SEED_CONTRACTS: Contract[] = [
  {
    id: 'con1',
    title: 'MSA Agreement Alpha',
    tenantId: 't1',
    customerId: 'c1',
    status: 'active',
    type: 'msa',
    value: 50000,
    currency: 'USD',
    startDate: new Date('2024-01-01'),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    autoRenew: true,
    ownerId: 'u1',
    notes: '',
    tags: ['enterprise'],
  },
  {
    id: 'con2',
    title: 'SOW Project Beta',
    tenantId: 't1',
    customerId: 'c2',
    status: 'active',
    type: 'sow',
    value: 30000,
    currency: 'USD',
    startDate: new Date('2024-02-01'),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    autoRenew: false,
    ownerId: 'u1',
    notes: '',
    tags: [],
  },
  {
    id: 'con3',
    title: 'NDA Client Gamma',
    tenantId: 't2',
    customerId: 'c3',
    status: 'draft',
    type: 'nda',
    value: 0,
    currency: 'USD',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-03-01'),
    autoRenew: false,
    ownerId: 'u2',
    notes: '',
    tags: [],
  },
  {
    id: 'con4',
    title: 'SaaS License Delta',
    tenantId: 't2',
    customerId: 'c4',
    status: 'active',
    type: 'saas',
    value: 12000,
    currency: 'EUR',
    startDate: new Date('2024-01-15'),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    autoRenew: true,
    ownerId: 'u2',
    notes: '',
    tags: ['saas'],
  },
  {
    id: 'con5',
    title: 'MSA Enterprise Epsilon',
    tenantId: 't1',
    customerId: 'c5',
    status: 'expired',
    type: 'msa',
    value: 80000,
    currency: 'USD',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
    autoRenew: false,
    ownerId: 'u1',
    notes: 'Expired',
    tags: [],
  },
  {
    id: 'con6',
    title: 'SOW Dev Zeta',
    tenantId: 't3',
    customerId: 'c6',
    status: 'terminated',
    type: 'sow',
    value: 20000,
    currency: 'USD',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-06-01'),
    autoRenew: false,
    ownerId: 'u3',
    terminatedAt: new Date('2024-01-01'),
    notes: '',
    tags: [],
  },
  {
    id: 'con7',
    title: 'NDA Vendor Eta',
    tenantId: 't3',
    customerId: 'c7',
    status: 'renewed',
    type: 'nda',
    value: 0,
    currency: 'USD',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-04-01'),
    autoRenew: true,
    ownerId: 'u3',
    notes: '',
    tags: ['nda'],
  },
  {
    id: 'con8',
    title: 'SaaS Startup Theta',
    tenantId: 't1',
    customerId: 'c8',
    status: 'active',
    type: 'saas',
    value: 5000,
    currency: 'USD',
    startDate: new Date('2024-05-01'),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    autoRenew: true,
    ownerId: 'u1',
    notes: '',
    tags: [],
  },
  {
    id: 'con9',
    title: 'MSA Partner Iota',
    tenantId: 't2',
    customerId: 'c9',
    status: 'active',
    type: 'msa',
    value: 60000,
    currency: 'USD',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2026-06-01'),
    autoRenew: true,
    ownerId: 'u2',
    notes: '',
    tags: ['partner'],
  },
  {
    id: 'con10',
    title: 'SOW Consulting Kappa',
    tenantId: 't3',
    customerId: 'c10',
    status: 'draft',
    type: 'sow',
    value: 15000,
    currency: 'GBP',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-07-01'),
    autoRenew: false,
    ownerId: 'u3',
    notes: '',
    tags: [],
  },
  {
    id: 'con11',
    title: 'NDA Research Lambda',
    tenantId: 't1',
    customerId: 'c11',
    status: 'active',
    type: 'nda',
    value: 0,
    currency: 'USD',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2027-08-01'),
    autoRenew: false,
    ownerId: 'u1',
    notes: '',
    tags: ['research'],
  },
  {
    id: 'con12',
    title: 'SaaS Enterprise Mu',
    tenantId: 't2',
    customerId: 'c12',
    status: 'expired',
    type: 'saas',
    value: 25000,
    currency: 'USD',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2023-01-01'),
    autoRenew: false,
    ownerId: 'u2',
    notes: '',
    tags: [],
  },
  {
    id: 'con13',
    title: 'MSA Global Nu',
    tenantId: 't3',
    customerId: 'c13',
    status: 'active',
    type: 'msa',
    value: 100000,
    currency: 'USD',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2026-09-01'),
    autoRenew: true,
    ownerId: 'u3',
    notes: '',
    tags: ['global'],
  },
  {
    id: 'con14',
    title: 'SOW Integration Xi',
    tenantId: 't1',
    customerId: 'c14',
    status: 'terminated',
    type: 'sow',
    value: 40000,
    currency: 'USD',
    startDate: new Date('2023-03-01'),
    endDate: new Date('2024-03-01'),
    autoRenew: false,
    ownerId: 'u1',
    terminatedAt: new Date('2023-12-01'),
    notes: '',
    tags: [],
  },
  {
    id: 'con15',
    title: 'NDA Acquisition Omicron',
    tenantId: 't2',
    customerId: 'c15',
    status: 'renewed',
    type: 'nda',
    value: 0,
    currency: 'USD',
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-10-01'),
    autoRenew: true,
    ownerId: 'u2',
    notes: '',
    tags: [],
  },
];

@Injectable({ providedIn: 'root' })
export class ContractService {
  private contractsSubject = new BehaviorSubject<Contract[]>(SEED_CONTRACTS);

  readonly contracts$: Observable<Contract[]> = this.contractsSubject.asObservable();
  readonly activeContracts$: Observable<Contract[]> = this.contracts$.pipe(
    map((contracts) => contracts.filter((c) => c.status === 'active')),
  );

  get contracts(): Contract[] {
    return this.contractsSubject.getValue();
  }

  create(data: Omit<Contract, 'id'>): Contract {
    const contract: Contract = { ...data, id: crypto.randomUUID() };
    this.contractsSubject.next([...this.contracts, contract]);
    return contract;
  }

  update(id: string, updates: Partial<Contract>): void {
    this.contractsSubject.next(this.contracts.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  sign(id: string): void {
    this.update(id, { status: 'active', signedAt: new Date() });
  }

  terminate(id: string): void {
    this.update(id, { status: 'terminated', terminatedAt: new Date() });
  }

  renew(id: string): void {
    const contract = this.contracts.find((c) => c.id === id);
    if (!contract) return;
    const newEndDate = new Date(contract.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    this.update(id, { status: 'renewed', endDate: newEndDate });
  }

  getByStatus(status: Contract['status']): Contract[] {
    return this.contracts.filter((c) => c.status === status);
  }

  getByTenant(tenantId: string): Contract[] {
    return this.contracts.filter((c) => c.tenantId === tenantId);
  }

  getExpiringSoon(days: number): Contract[] {
    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;
    return this.contracts.filter(
      (c) => c.status === 'active' && c.endDate.getTime() > now && c.endDate.getTime() <= cutoff,
    );
  }

  getStats(): { total: number; active: number; expired: number; value: number } {
    const all = this.contracts;
    return {
      total: all.length,
      active: all.filter((c) => c.status === 'active').length,
      expired: all.filter((c) => c.status === 'expired').length,
      value: all.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.value, 0),
    };
  }
}
