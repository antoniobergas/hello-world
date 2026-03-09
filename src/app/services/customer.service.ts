import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'inactive' | 'churned';
  createdAt: Date;
  tags: string[];
  contractValue: number;
  ownerId: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  churned: number;
  totalContractValue: number;
}

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    email: 'alice@acme.com',
    phone: '555-0101',
    company: 'Acme Corp',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    tags: ['vip', 'tech'],
    contractValue: 50000,
    ownerId: 'u1',
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    email: 'bob@globex.com',
    phone: '555-0102',
    company: 'Globex',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-02-10'),
    tags: ['mid-market'],
    contractValue: 15000,
    ownerId: 'u1',
  },
  {
    id: 'c3',
    name: 'Carol White',
    email: 'carol@initech.com',
    phone: '555-0103',
    company: 'Initech',
    plan: 'starter',
    status: 'inactive',
    createdAt: new Date('2023-03-05'),
    tags: [],
    contractValue: 3000,
    ownerId: 'u2',
  },
  {
    id: 'c4',
    name: 'Dave Brown',
    email: 'dave@umbrella.com',
    phone: '555-0104',
    company: 'Umbrella',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-01-20'),
    tags: ['vip'],
    contractValue: 80000,
    ownerId: 'u2',
  },
  {
    id: 'c5',
    name: 'Eve Davis',
    email: 'eve@weyland.com',
    phone: '555-0105',
    company: 'Weyland',
    plan: 'growth',
    status: 'churned',
    createdAt: new Date('2022-11-01'),
    tags: [],
    contractValue: 0,
    ownerId: 'u1',
  },
  {
    id: 'c6',
    name: 'Frank Miller',
    email: 'frank@cyberdyne.com',
    phone: '555-0106',
    company: 'Cyberdyne',
    plan: 'starter',
    status: 'active',
    createdAt: new Date('2023-04-12'),
    tags: ['smb'],
    contractValue: 2500,
    ownerId: 'u3',
  },
  {
    id: 'c7',
    name: 'Grace Wilson',
    email: 'grace@soylent.com',
    phone: '555-0107',
    company: 'Soylent',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-05-18'),
    tags: ['food'],
    contractValue: 20000,
    ownerId: 'u3',
  },
  {
    id: 'c8',
    name: 'Hank Moore',
    email: 'hank@oscorp.com',
    phone: '555-0108',
    company: 'Oscorp',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-02-28'),
    tags: ['vip', 'pharma'],
    contractValue: 120000,
    ownerId: 'u1',
  },
  {
    id: 'c9',
    name: 'Iris Taylor',
    email: 'iris@stark.com',
    phone: '555-0109',
    company: 'Stark Industries',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-03-15'),
    tags: ['vip', 'defense'],
    contractValue: 200000,
    ownerId: 'u2',
  },
  {
    id: 'c10',
    name: 'Jack Anderson',
    email: 'jack@wayne.com',
    phone: '555-0110',
    company: 'Wayne Enterprises',
    plan: 'enterprise',
    status: 'inactive',
    createdAt: new Date('2022-12-01'),
    tags: [],
    contractValue: 75000,
    ownerId: 'u2',
  },
  {
    id: 'c11',
    name: 'Kate Thomas',
    email: 'kate@lexcorp.com',
    phone: '555-0111',
    company: 'LexCorp',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-06-01'),
    tags: [],
    contractValue: 18000,
    ownerId: 'u3',
  },
  {
    id: 'c12',
    name: 'Leo Jackson',
    email: 'leo@monsters.com',
    phone: '555-0112',
    company: 'Monsters Inc',
    plan: 'starter',
    status: 'active',
    createdAt: new Date('2023-06-15'),
    tags: ['smb'],
    contractValue: 1500,
    ownerId: 'u1',
  },
  {
    id: 'c13',
    name: 'Mia White',
    email: 'mia@dunder.com',
    phone: '555-0113',
    company: 'Dunder Mifflin',
    plan: 'starter',
    status: 'churned',
    createdAt: new Date('2022-09-01'),
    tags: [],
    contractValue: 0,
    ownerId: 'u3',
  },
  {
    id: 'c14',
    name: 'Nick Harris',
    email: 'nick@pied.com',
    phone: '555-0114',
    company: 'Pied Piper',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-07-01'),
    tags: ['tech'],
    contractValue: 22000,
    ownerId: 'u1',
  },
  {
    id: 'c15',
    name: 'Olivia Martin',
    email: 'olivia@hooli.com',
    phone: '555-0115',
    company: 'Hooli',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-01-10'),
    tags: ['tech', 'vip'],
    contractValue: 95000,
    ownerId: 'u2',
  },
  {
    id: 'c16',
    name: 'Paul Garcia',
    email: 'paul@aviato.com',
    phone: '555-0116',
    company: 'Aviato',
    plan: 'starter',
    status: 'inactive',
    createdAt: new Date('2023-04-20'),
    tags: [],
    contractValue: 2000,
    ownerId: 'u3',
  },
  {
    id: 'c17',
    name: 'Quinn Martinez',
    email: 'quinn@initech.com',
    phone: '555-0117',
    company: 'Initech II',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-08-01'),
    tags: ['tech'],
    contractValue: 16000,
    ownerId: 'u1',
  },
  {
    id: 'c18',
    name: 'Rachel Robinson',
    email: 'rachel@veridian.com',
    phone: '555-0118',
    company: 'Veridian Dynamics',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-02-14'),
    tags: ['vip'],
    contractValue: 110000,
    ownerId: 'u2',
  },
  {
    id: 'c19',
    name: 'Sam Clark',
    email: 'sam@nakatomi.com',
    phone: '555-0119',
    company: 'Nakatomi',
    plan: 'starter',
    status: 'active',
    createdAt: new Date('2023-09-01'),
    tags: ['smb'],
    contractValue: 3500,
    ownerId: 'u3',
  },
  {
    id: 'c20',
    name: 'Tina Rodriguez',
    email: 'tina@premise.com',
    phone: '555-0120',
    company: 'The Premise',
    plan: 'growth',
    status: 'churned',
    createdAt: new Date('2022-10-01'),
    tags: [],
    contractValue: 0,
    ownerId: 'u1',
  },
  {
    id: 'c21',
    name: 'Uma Lewis',
    email: 'uma@massive.com',
    phone: '555-0121',
    company: 'Massive Dynamic',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-01-25'),
    tags: ['vip', 'science'],
    contractValue: 145000,
    ownerId: 'u2',
  },
  {
    id: 'c22',
    name: 'Victor Lee',
    email: 'victor@primatech.com',
    phone: '555-0122',
    company: 'Primatech',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-03-20'),
    tags: [],
    contractValue: 19000,
    ownerId: 'u3',
  },
  {
    id: 'c23',
    name: 'Wendy Walker',
    email: 'wendy@dharma.com',
    phone: '555-0123',
    company: 'Dharma Initiative',
    plan: 'starter',
    status: 'inactive',
    createdAt: new Date('2023-05-01'),
    tags: [],
    contractValue: 1000,
    ownerId: 'u1',
  },
  {
    id: 'c24',
    name: 'Xavier Hall',
    email: 'xavier@empire.com',
    phone: '555-0124',
    company: 'Empire Inc',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-07-15'),
    tags: ['media'],
    contractValue: 25000,
    ownerId: 'u2',
  },
  {
    id: 'c25',
    name: 'Yara Allen',
    email: 'yara@oscorp2.com',
    phone: '555-0125',
    company: 'Oscorp 2',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-02-05'),
    tags: ['vip'],
    contractValue: 88000,
    ownerId: 'u3',
  },
  {
    id: 'c26',
    name: 'Zane Young',
    email: 'zane@omni.com',
    phone: '555-0126',
    company: 'Omni Consumer',
    plan: 'starter',
    status: 'active',
    createdAt: new Date('2023-10-01'),
    tags: ['retail'],
    contractValue: 4000,
    ownerId: 'u1',
  },
  {
    id: 'c27',
    name: 'Amy Hernandez',
    email: 'amy@buy-n-large.com',
    phone: '555-0127',
    company: 'Buy-N-Large',
    plan: 'growth',
    status: 'active',
    createdAt: new Date('2023-09-15'),
    tags: ['retail'],
    contractValue: 21000,
    ownerId: 'u2',
  },
  {
    id: 'c28',
    name: 'Brian King',
    email: 'brian@rekall.com',
    phone: '555-0128',
    company: 'Rekall',
    plan: 'enterprise',
    status: 'inactive',
    createdAt: new Date('2022-08-01'),
    tags: [],
    contractValue: 60000,
    ownerId: 'u3',
  },
  {
    id: 'c29',
    name: 'Casey Wright',
    email: 'casey@tyrell.com',
    phone: '555-0129',
    company: 'Tyrell Corp',
    plan: 'enterprise',
    status: 'active',
    createdAt: new Date('2023-04-01'),
    tags: ['vip', 'tech'],
    contractValue: 175000,
    ownerId: 'u1',
  },
  {
    id: 'c30',
    name: 'Dana Scott',
    email: 'dana@multi.com',
    phone: '555-0130',
    company: 'Multi Corp',
    plan: 'growth',
    status: 'churned',
    createdAt: new Date('2022-07-01'),
    tags: [],
    contractValue: 0,
    ownerId: 'u2',
  },
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customersSubject = new BehaviorSubject<Customer[]>(INITIAL_CUSTOMERS);

  readonly customers$: Observable<Customer[]> = this.customersSubject.asObservable();

  readonly activeCustomers$: Observable<Customer[]> = this.customers$.pipe(
    map((customers) => customers.filter((c) => c.status === 'active')),
  );

  readonly stats$: Observable<CustomerStats> = this.customers$.pipe(
    map((customers) => this.computeStats(customers)),
  );

  get customers(): Customer[] {
    return this.customersSubject.value;
  }

  add(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.customersSubject.next([...this.customersSubject.value, newCustomer]);
    return newCustomer;
  }

  update(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): void {
    this.customersSubject.next(
      this.customersSubject.value.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  }

  remove(id: string): void {
    this.customersSubject.next(this.customersSubject.value.filter((c) => c.id !== id));
  }

  getByPlan(plan: Customer['plan']): Customer[] {
    return this.customersSubject.value.filter((c) => c.plan === plan);
  }

  getByStatus(status: Customer['status']): Customer[] {
    return this.customersSubject.value.filter((c) => c.status === status);
  }

  search(query: string): Customer[] {
    const q = query.toLowerCase();
    return this.customersSubject.value.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q),
    );
  }

  getByOwner(ownerId: string): Customer[] {
    return this.customersSubject.value.filter((c) => c.ownerId === ownerId);
  }

  getStats(): CustomerStats {
    return this.computeStats(this.customersSubject.value);
  }

  private computeStats(customers: Customer[]): CustomerStats {
    return {
      total: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      inactive: customers.filter((c) => c.status === 'inactive').length,
      churned: customers.filter((c) => c.status === 'churned').length,
      totalContractValue: customers.reduce((sum, c) => sum + c.contractValue, 0),
    };
  }
}
