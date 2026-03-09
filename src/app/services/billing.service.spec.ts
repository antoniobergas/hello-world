import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    service = new BillingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 5 billing accounts', () => {
    expect(service.accounts.length).toBe(5);
  });

  it('should initialize with payment records', () => {
    expect(service.payments.length).toBeGreaterThan(0);
  });

  it('should getAccount by tenantId', () => {
    const account = service.getAccount('t1');
    expect(account?.tenantId).toBe('t1');
    expect(account?.plan).toBe('enterprise');
  });

  it('should return undefined for unknown tenantId', () => {
    expect(service.getAccount('nonexistent')).toBeUndefined();
  });

  it('should upgradePlan changes the plan', () => {
    service.upgradePlan('t2', 'enterprise', 'monthly');
    expect(service.getAccount('t2')?.plan).toBe('enterprise');
  });

  it('should upgradePlan updates amount for monthly billing', () => {
    service.upgradePlan('t2', 'enterprise', 'monthly');
    expect(service.getAccount('t2')?.amount).toBe(499);
  });

  it('should upgradePlan with annual billing applies discount', () => {
    service.upgradePlan('t2', 'enterprise', 'annual');
    const account = service.getAccount('t2');
    expect(account?.amount).toBeCloseTo(499 * 12 * 0.9, 1);
  });

  it('should upgradePlan sets status to active', () => {
    service.upgradePlan('t3', 'growth', 'monthly');
    expect(service.getAccount('t3')?.status).toBe('active');
  });

  it('should cancelSubscription sets status to cancelled', () => {
    service.cancelSubscription('t2');
    expect(service.getAccount('t2')?.status).toBe('cancelled');
  });

  it('should getPaymentHistory for an account', () => {
    const history = service.getPaymentHistory('ba2');
    expect(history.length).toBe(2);
    expect(history.every((p) => p.accountId === 'ba2')).toBe(true);
  });

  it('should return empty payment history for unknown account', () => {
    expect(service.getPaymentHistory('unknown')).toHaveLength(0);
  });

  it('should addPaymentRecord increases payments count', () => {
    const before = service.payments.length;
    service.addPaymentRecord({ accountId: 'ba1', amount: 100, date: new Date(), status: 'paid', invoiceId: 'invNew' });
    expect(service.payments.length).toBe(before + 1);
  });

  it('should addPaymentRecord assigns UUID', () => {
    const record = service.addPaymentRecord({ accountId: 'ba1', amount: 100, date: new Date(), status: 'paid', invoiceId: 'invNew' });
    expect(record.id).toBeTruthy();
  });

  it('should computeMRR is greater than 0 with active accounts', () => {
    const mrr = service.computeMRR();
    expect(mrr).toBeGreaterThan(0);
  });

  it('should computeMRR excludes cancelled accounts', () => {
    service.cancelSubscription('t1');
    service.cancelSubscription('t2');
    const mrr = service.computeMRR();
    const expected = service.accounts
      .filter((a) => a.status === 'active')
      .reduce((sum, a) => sum + (a.billingCycle === 'annual' ? a.amount / 12 : a.amount), 0);
    expect(mrr).toBeCloseTo(expected, 1);
  });

  it('should emit accounts via accounts$', async () => {
    const accounts = await firstValueFrom(service.accounts$);
    expect(accounts.length).toBe(5);
  });

  it('should emit payments via payments$', async () => {
    const payments = await firstValueFrom(service.payments$);
    expect(payments.length).toBeGreaterThan(0);
  });

  it('should MRR be 0 when all accounts cancelled', () => {
    ['t1', 't2', 't3', 't4', 't5'].forEach((t) => service.cancelSubscription(t));
    expect(service.computeMRR()).toBe(0);
  });

  it('should free plan account contributes 0 to MRR', () => {
    // Cancel all non-free accounts; t4 is free
    ['t1', 't2', 't3', 't5'].forEach((t) => service.cancelSubscription(t));
    expect(service.computeMRR()).toBe(0);
  });

  it('should upgradePlan changes billingCycle', () => {
    service.upgradePlan('t2', 'growth', 'annual');
    expect(service.getAccount('t2')?.billingCycle).toBe('annual');
  });
});
