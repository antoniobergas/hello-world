import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  tenantId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
}

export interface InvoiceTotals {
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
  count: number;
}

function makeItem(id: string, description: string, qty: number, price: number): InvoiceLineItem {
  return { id, description, quantity: qty, unitPrice: price, amount: qty * price };
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    number: 'INV-001',
    tenantId: 't1',
    status: 'paid',
    items: [makeItem('li1', 'Enterprise Plan', 1, 5988)],
    subtotal: 5988,
    tax: 598.8,
    total: 6586.8,
    issuedAt: new Date('2024-01-01'),
    dueAt: new Date('2024-01-31'),
    paidAt: new Date('2024-01-15'),
  },
  {
    id: 'inv2',
    number: 'INV-002',
    tenantId: 't2',
    status: 'paid',
    items: [makeItem('li2', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2024-01-01'),
    dueAt: new Date('2024-01-31'),
    paidAt: new Date('2024-01-10'),
  },
  {
    id: 'inv3',
    number: 'INV-003',
    tenantId: 't3',
    status: 'overdue',
    items: [makeItem('li3', 'Starter Plan', 1, 29)],
    subtotal: 29,
    tax: 2.9,
    total: 31.9,
    issuedAt: new Date('2024-11-01'),
    dueAt: new Date('2024-11-30'),
  },
  {
    id: 'inv4',
    number: 'INV-004',
    tenantId: 't1',
    status: 'sent',
    items: [makeItem('li4', 'Enterprise Plan', 1, 5988)],
    subtotal: 5988,
    tax: 598.8,
    total: 6586.8,
    issuedAt: new Date('2025-01-01'),
    dueAt: new Date('2025-01-31'),
  },
  {
    id: 'inv5',
    number: 'INV-005',
    tenantId: 't2',
    status: 'draft',
    items: [makeItem('li5', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2025-02-01'),
    dueAt: new Date('2025-02-28'),
  },
  {
    id: 'inv6',
    number: 'INV-006',
    tenantId: 't4',
    status: 'paid',
    items: [makeItem('li6', 'Consulting', 5, 200)],
    subtotal: 1000,
    tax: 100,
    total: 1100,
    issuedAt: new Date('2024-10-01'),
    dueAt: new Date('2024-10-31'),
    paidAt: new Date('2024-10-20'),
  },
  {
    id: 'inv7',
    number: 'INV-007',
    tenantId: 't5',
    status: 'void',
    items: [makeItem('li7', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2024-09-01'),
    dueAt: new Date('2024-09-30'),
  },
  {
    id: 'inv8',
    number: 'INV-008',
    tenantId: 't1',
    status: 'paid',
    items: [makeItem('li8', 'Enterprise Plan', 1, 5988)],
    subtotal: 5988,
    tax: 598.8,
    total: 6586.8,
    issuedAt: new Date('2023-01-01'),
    dueAt: new Date('2023-01-31'),
    paidAt: new Date('2023-01-12'),
  },
  {
    id: 'inv9',
    number: 'INV-009',
    tenantId: 't2',
    status: 'overdue',
    items: [makeItem('li9', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2024-10-01'),
    dueAt: new Date('2024-10-31'),
  },
  {
    id: 'inv10',
    number: 'INV-010',
    tenantId: 't3',
    status: 'sent',
    items: [makeItem('li10', 'Starter Plan', 3, 29)],
    subtotal: 87,
    tax: 8.7,
    total: 95.7,
    issuedAt: new Date('2025-01-01'),
    dueAt: new Date('2025-01-31'),
  },
  {
    id: 'inv11',
    number: 'INV-011',
    tenantId: 't4',
    status: 'draft',
    items: [makeItem('li11', 'Consulting', 2, 200)],
    subtotal: 400,
    tax: 40,
    total: 440,
    issuedAt: new Date('2025-02-01'),
    dueAt: new Date('2025-02-28'),
  },
  {
    id: 'inv12',
    number: 'INV-012',
    tenantId: 't1',
    status: 'paid',
    items: [makeItem('li12', 'Support Package', 1, 500)],
    subtotal: 500,
    tax: 50,
    total: 550,
    issuedAt: new Date('2024-06-01'),
    dueAt: new Date('2024-06-30'),
    paidAt: new Date('2024-06-15'),
  },
  {
    id: 'inv13',
    number: 'INV-013',
    tenantId: 't5',
    status: 'overdue',
    items: [makeItem('li13', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2024-08-01'),
    dueAt: new Date('2024-08-31'),
  },
  {
    id: 'inv14',
    number: 'INV-014',
    tenantId: 't2',
    status: 'paid',
    items: [makeItem('li14', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2024-02-01'),
    dueAt: new Date('2024-02-29'),
    paidAt: new Date('2024-02-10'),
  },
  {
    id: 'inv15',
    number: 'INV-015',
    tenantId: 't3',
    status: 'draft',
    items: [makeItem('li15', 'Starter Plan', 1, 29)],
    subtotal: 29,
    tax: 2.9,
    total: 31.9,
    issuedAt: new Date('2025-02-01'),
    dueAt: new Date('2025-02-28'),
  },
  {
    id: 'inv16',
    number: 'INV-016',
    tenantId: 't4',
    status: 'sent',
    items: [makeItem('li16', 'Consulting', 10, 200)],
    subtotal: 2000,
    tax: 200,
    total: 2200,
    issuedAt: new Date('2025-01-15'),
    dueAt: new Date('2025-02-15'),
  },
  {
    id: 'inv17',
    number: 'INV-017',
    tenantId: 't1',
    status: 'overdue',
    items: [makeItem('li17', 'Enterprise Plan', 1, 5988)],
    subtotal: 5988,
    tax: 598.8,
    total: 6586.8,
    issuedAt: new Date('2024-07-01'),
    dueAt: new Date('2024-07-31'),
  },
  {
    id: 'inv18',
    number: 'INV-018',
    tenantId: 't2',
    status: 'void',
    items: [makeItem('li18', 'Growth Plan', 1, 99)],
    subtotal: 99,
    tax: 9.9,
    total: 108.9,
    issuedAt: new Date('2024-03-01'),
    dueAt: new Date('2024-03-31'),
  },
  {
    id: 'inv19',
    number: 'INV-019',
    tenantId: 't5',
    status: 'paid',
    items: [makeItem('li19', 'Growth Plan', 6, 99)],
    subtotal: 594,
    tax: 59.4,
    total: 653.4,
    issuedAt: new Date('2024-04-01'),
    dueAt: new Date('2024-04-30'),
    paidAt: new Date('2024-04-10'),
  },
  {
    id: 'inv20',
    number: 'INV-020',
    tenantId: 't4',
    status: 'paid',
    items: [makeItem('li20', 'Setup Fee', 1, 1000)],
    subtotal: 1000,
    tax: 100,
    total: 1100,
    issuedAt: new Date('2023-06-01'),
    dueAt: new Date('2023-06-30'),
    paidAt: new Date('2023-06-05'),
  },
];

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private invoicesSubject = new BehaviorSubject<Invoice[]>(INITIAL_INVOICES);

  readonly invoices$: Observable<Invoice[]> = this.invoicesSubject.asObservable();

  readonly overdueInvoices$: Observable<Invoice[]> = this.invoices$.pipe(
    map((invoices) => invoices.filter((i) => i.status === 'overdue')),
  );

  get invoices(): Invoice[] {
    return this.invoicesSubject.value;
  }

  create(invoice: Omit<Invoice, 'id'>): Invoice {
    const newInvoice: Invoice = { ...invoice, id: crypto.randomUUID() };
    this.invoicesSubject.next([...this.invoicesSubject.value, newInvoice]);
    return newInvoice;
  }

  markPaid(id: string): void {
    this.invoicesSubject.next(
      this.invoicesSubject.value.map((i) =>
        i.id === id ? { ...i, status: 'paid', paidAt: new Date() } : i,
      ),
    );
  }

  markOverdue(id: string): void {
    this.invoicesSubject.next(
      this.invoicesSubject.value.map((i) =>
        i.id === id && i.status !== 'paid' && i.status !== 'void' ? { ...i, status: 'overdue' } : i,
      ),
    );
  }

  void(id: string): void {
    this.invoicesSubject.next(
      this.invoicesSubject.value.map((i) => (i.id === id ? { ...i, status: 'void' } : i)),
    );
  }

  getByTenant(tenantId: string): Invoice[] {
    return this.invoicesSubject.value.filter((i) => i.tenantId === tenantId);
  }

  getByStatus(status: Invoice['status']): Invoice[] {
    return this.invoicesSubject.value.filter((i) => i.status === status);
  }

  getTotals(): InvoiceTotals {
    const invoices = this.invoicesSubject.value;
    return {
      totalOutstanding: invoices
        .filter((i) => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + i.total, 0),
      totalPaid: invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
      totalOverdue: invoices
        .filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + i.total, 0),
      count: invoices.length,
    };
  }
}
