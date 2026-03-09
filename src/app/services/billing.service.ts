import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BillingAccount {
  id: string;
  tenantId: string;
  plan: 'free' | 'starter' | 'growth' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'cancelled';
  nextBillingDate: Date;
  amount: number;
  currency: string;
}

export interface PaymentRecord {
  id: string;
  accountId: string;
  amount: number;
  date: Date;
  status: 'paid' | 'failed' | 'pending';
  invoiceId: string;
}

const PLAN_AMOUNTS: Record<BillingAccount['plan'], number> = {
  free: 0,
  starter: 29,
  growth: 99,
  enterprise: 499,
};

const INITIAL_ACCOUNTS: BillingAccount[] = [
  { id: 'ba1', tenantId: 't1', plan: 'enterprise', billingCycle: 'annual', status: 'active', nextBillingDate: new Date('2025-01-01'), amount: 499 * 12 * 0.9, currency: 'USD' },
  { id: 'ba2', tenantId: 't2', plan: 'growth', billingCycle: 'monthly', status: 'active', nextBillingDate: new Date('2025-02-01'), amount: 99, currency: 'USD' },
  { id: 'ba3', tenantId: 't3', plan: 'starter', billingCycle: 'monthly', status: 'past_due', nextBillingDate: new Date('2025-01-15'), amount: 29, currency: 'USD' },
  { id: 'ba4', tenantId: 't4', plan: 'free', billingCycle: 'monthly', status: 'active', nextBillingDate: new Date('2025-02-15'), amount: 0, currency: 'USD' },
  { id: 'ba5', tenantId: 't5', plan: 'growth', billingCycle: 'annual', status: 'cancelled', nextBillingDate: new Date('2024-12-01'), amount: 99 * 12 * 0.9, currency: 'USD' },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: 'pay1', accountId: 'ba1', amount: 499 * 12 * 0.9, date: new Date('2024-01-01'), status: 'paid', invoiceId: 'inv1' },
  { id: 'pay2', accountId: 'ba2', amount: 99, date: new Date('2024-12-01'), status: 'paid', invoiceId: 'inv2' },
  { id: 'pay3', accountId: 'ba3', amount: 29, date: new Date('2024-12-15'), status: 'failed', invoiceId: 'inv3' },
  { id: 'pay4', accountId: 'ba2', amount: 99, date: new Date('2024-11-01'), status: 'paid', invoiceId: 'inv4' },
  { id: 'pay5', accountId: 'ba1', amount: 499 * 12 * 0.9, date: new Date('2023-01-01'), status: 'paid', invoiceId: 'inv5' },
];

@Injectable({ providedIn: 'root' })
export class BillingService {
  private accountsSubject = new BehaviorSubject<BillingAccount[]>(INITIAL_ACCOUNTS);
  private paymentsSubject = new BehaviorSubject<PaymentRecord[]>(INITIAL_PAYMENTS);

  readonly accounts$: Observable<BillingAccount[]> = this.accountsSubject.asObservable();
  readonly payments$: Observable<PaymentRecord[]> = this.paymentsSubject.asObservable();

  get accounts(): BillingAccount[] {
    return this.accountsSubject.value;
  }

  get payments(): PaymentRecord[] {
    return this.paymentsSubject.value;
  }

  getAccount(tenantId: string): BillingAccount | undefined {
    return this.accountsSubject.value.find((a) => a.tenantId === tenantId);
  }

  upgradePlan(tenantId: string, plan: BillingAccount['plan'], billingCycle: BillingAccount['billingCycle']): void {
    const amount = billingCycle === 'annual' ? PLAN_AMOUNTS[plan] * 12 * 0.9 : PLAN_AMOUNTS[plan];
    this.accountsSubject.next(
      this.accountsSubject.value.map((a) =>
        a.tenantId === tenantId ? { ...a, plan, billingCycle, amount, status: 'active' } : a,
      ),
    );
  }

  cancelSubscription(tenantId: string): void {
    this.accountsSubject.next(
      this.accountsSubject.value.map((a) =>
        a.tenantId === tenantId ? { ...a, status: 'cancelled' } : a,
      ),
    );
  }

  getPaymentHistory(accountId: string): PaymentRecord[] {
    return this.paymentsSubject.value.filter((p) => p.accountId === accountId);
  }

  addPaymentRecord(record: Omit<PaymentRecord, 'id'>): PaymentRecord {
    const newRecord: PaymentRecord = { ...record, id: crypto.randomUUID() };
    this.paymentsSubject.next([...this.paymentsSubject.value, newRecord]);
    return newRecord;
  }

  computeMRR(): number {
    return this.accountsSubject.value
      .filter((a) => a.status === 'active')
      .reduce((sum, a) => {
        const monthly = a.billingCycle === 'annual' ? a.amount / 12 : a.amount;
        return sum + monthly;
      }, 0);
  }
}
