import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    service = new InvoiceService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 20 seed invoices', () => {
    expect(service.invoices.length).toBe(20);
  });

  it('should create a new invoice', () => {
    const before = service.invoices.length;
    service.create({ number: 'INV-099', tenantId: 't1', status: 'draft', items: [], subtotal: 100, tax: 10, total: 110, issuedAt: new Date(), dueAt: new Date() });
    expect(service.invoices.length).toBe(before + 1);
  });

  it('should create assigns a UUID', () => {
    const inv = service.create({ number: 'INV-099', tenantId: 't1', status: 'draft', items: [], subtotal: 100, tax: 10, total: 110, issuedAt: new Date(), dueAt: new Date() });
    expect(inv.id).toBeTruthy();
  });

  it('should markPaid sets status to paid', () => {
    service.markPaid('inv3');
    expect(service.invoices.find((i) => i.id === 'inv3')?.status).toBe('paid');
  });

  it('should markPaid sets paidAt', () => {
    service.markPaid('inv3');
    expect(service.invoices.find((i) => i.id === 'inv3')?.paidAt).toBeInstanceOf(Date);
  });

  it('should markOverdue sets status', () => {
    service.markOverdue('inv4');
    expect(service.invoices.find((i) => i.id === 'inv4')?.status).toBe('overdue');
  });

  it('should markOverdue not affect already paid invoices', () => {
    service.markOverdue('inv1');
    expect(service.invoices.find((i) => i.id === 'inv1')?.status).toBe('paid');
  });

  it('should void an invoice', () => {
    service.void('inv4');
    expect(service.invoices.find((i) => i.id === 'inv4')?.status).toBe('void');
  });

  it('should getByTenant returns correct invoices', () => {
    const t1 = service.getByTenant('t1');
    expect(t1.every((i) => i.tenantId === 't1')).toBe(true);
    expect(t1.length).toBeGreaterThan(0);
  });

  it('should getByTenant returns empty for unknown tenant', () => {
    expect(service.getByTenant('unknown')).toHaveLength(0);
  });

  it('should getByStatus paid', () => {
    const paid = service.getByStatus('paid');
    expect(paid.every((i) => i.status === 'paid')).toBe(true);
    expect(paid.length).toBeGreaterThan(0);
  });

  it('should getByStatus overdue', () => {
    const overdue = service.getByStatus('overdue');
    expect(overdue.every((i) => i.status === 'overdue')).toBe(true);
  });

  it('should getTotals count matches invoices length', () => {
    expect(service.getTotals().count).toBe(service.invoices.length);
  });

  it('should getTotals totalPaid is sum of paid invoice totals', () => {
    const expected = service.getByStatus('paid').reduce((s, i) => s + i.total, 0);
    expect(service.getTotals().totalPaid).toBeCloseTo(expected, 1);
  });

  it('should getTotals totalOverdue is sum of overdue invoice totals', () => {
    const expected = service.getByStatus('overdue').reduce((s, i) => s + i.total, 0);
    expect(service.getTotals().totalOverdue).toBeCloseTo(expected, 1);
  });

  it('should getTotals totalOutstanding includes sent and overdue', () => {
    const totals = service.getTotals();
    expect(totals.totalOutstanding).toBeGreaterThan(0);
  });

  it('should emit invoices via invoices$', async () => {
    const invoices = await firstValueFrom(service.invoices$);
    expect(invoices.length).toBe(20);
  });

  it('should emit overdue invoices via overdueInvoices$', async () => {
    const overdue = await firstValueFrom(service.overdueInvoices$);
    expect(overdue.every((i) => i.status === 'overdue')).toBe(true);
  });

  it('should update count after create in getTotals', () => {
    service.create({ number: 'INV-099', tenantId: 't1', status: 'draft', items: [], subtotal: 0, tax: 0, total: 0, issuedAt: new Date(), dueAt: new Date() });
    expect(service.getTotals().count).toBe(21);
  });
});
