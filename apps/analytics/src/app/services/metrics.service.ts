import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  Metric,
  TrendSeries,
  AnalyticsAlert,
  AlertStatus,
  MetricCategory,
} from '../models/metrics.model';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly _metrics$ = new BehaviorSubject<Metric[]>([
    {
      id: 'm1',
      name: 'Monthly Revenue',
      category: 'revenue',
      value: 142500,
      unit: 'USD',
      previousValue: 135200,
      trend: 'up',
      changePercent: 5.4,
      lastUpdated: new Date('2025-07-01'),
      target: 150000,
    },
    {
      id: 'm2',
      name: 'Active Users',
      category: 'users',
      value: 8420,
      unit: 'users',
      previousValue: 7980,
      trend: 'up',
      changePercent: 5.5,
      lastUpdated: new Date('2025-07-01'),
      target: 10000,
    },
    {
      id: 'm3',
      name: 'API Response Time',
      category: 'performance',
      value: 245,
      unit: 'ms',
      previousValue: 210,
      trend: 'down',
      changePercent: -16.7,
      lastUpdated: new Date('2025-07-01'),
      target: 200,
    },
    {
      id: 'm4',
      name: 'Error Rate',
      category: 'quality',
      value: 0.8,
      unit: '%',
      previousValue: 1.2,
      trend: 'up',
      changePercent: 33.3,
      lastUpdated: new Date('2025-07-01'),
      target: 0.5,
    },
    {
      id: 'm5',
      name: 'Order Fulfilment Rate',
      category: 'operations',
      value: 97.2,
      unit: '%',
      previousValue: 96.8,
      trend: 'up',
      changePercent: 0.4,
      lastUpdated: new Date('2025-07-01'),
      target: 99,
    },
    {
      id: 'm6',
      name: 'Customer Satisfaction',
      category: 'quality',
      value: 4.3,
      unit: '/5',
      previousValue: 4.1,
      trend: 'up',
      changePercent: 4.9,
      lastUpdated: new Date('2025-07-01'),
      target: 4.5,
    },
    {
      id: 'm7',
      name: 'New Signups',
      category: 'users',
      value: 312,
      unit: 'signups',
      previousValue: 298,
      trend: 'up',
      changePercent: 4.7,
      lastUpdated: new Date('2025-07-01'),
    },
    {
      id: 'm8',
      name: 'Infrastructure Cost',
      category: 'operations',
      value: 18400,
      unit: 'USD',
      previousValue: 19100,
      trend: 'up',
      changePercent: -3.7,
      lastUpdated: new Date('2025-07-01'),
      target: 18000,
    },
  ]);

  private readonly _trendSeries$ = new BehaviorSubject<TrendSeries[]>([
    {
      id: 'ts1',
      name: 'Monthly Revenue',
      category: 'revenue',
      unit: 'USD',
      color: '#10b981',
      points: [
        { label: 'Dec', value: 118000, date: new Date('2024-12-01') },
        { label: 'Jan', value: 122000, date: new Date('2025-01-01') },
        { label: 'Feb', value: 119500, date: new Date('2025-02-01') },
        { label: 'Mar', value: 128000, date: new Date('2025-03-01') },
        { label: 'Apr', value: 131000, date: new Date('2025-04-01') },
        { label: 'May', value: 135200, date: new Date('2025-05-01') },
        { label: 'Jun', value: 138700, date: new Date('2025-06-01') },
        { label: 'Jul', value: 142500, date: new Date('2025-07-01') },
      ],
    },
    {
      id: 'ts2',
      name: 'Active Users',
      category: 'users',
      unit: 'users',
      color: '#6366f1',
      points: [
        { label: 'Dec', value: 6200, date: new Date('2024-12-01') },
        { label: 'Jan', value: 6550, date: new Date('2025-01-01') },
        { label: 'Feb', value: 6800, date: new Date('2025-02-01') },
        { label: 'Mar', value: 7100, date: new Date('2025-03-01') },
        { label: 'Apr', value: 7420, date: new Date('2025-04-01') },
        { label: 'May', value: 7750, date: new Date('2025-05-01') },
        { label: 'Jun', value: 7980, date: new Date('2025-06-01') },
        { label: 'Jul', value: 8420, date: new Date('2025-07-01') },
      ],
    },
    {
      id: 'ts3',
      name: 'API Response Time',
      category: 'performance',
      unit: 'ms',
      color: '#f59e0b',
      points: [
        { label: 'Dec', value: 180, date: new Date('2024-12-01') },
        { label: 'Jan', value: 195, date: new Date('2025-01-01') },
        { label: 'Feb', value: 205, date: new Date('2025-02-01') },
        { label: 'Mar', value: 200, date: new Date('2025-03-01') },
        { label: 'Apr', value: 215, date: new Date('2025-04-01') },
        { label: 'May', value: 210, date: new Date('2025-05-01') },
        { label: 'Jun', value: 225, date: new Date('2025-06-01') },
        { label: 'Jul', value: 245, date: new Date('2025-07-01') },
      ],
    },
  ]);

  private readonly _alerts$ = new BehaviorSubject<AnalyticsAlert[]>([
    {
      id: 'al1',
      title: 'API Response Time Threshold Exceeded',
      severity: 'critical',
      status: 'active',
      description: 'API response time is 245ms, exceeding the 200ms target.',
      metricId: 'm3',
      threshold: 200,
      currentValue: 245,
      createdAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-07-01'),
    },
    {
      id: 'al2',
      title: 'Revenue Growth Trend Positive',
      severity: 'info',
      status: 'resolved',
      description: 'Monthly revenue has grown consistently for 6 months.',
      metricId: 'm1',
      createdAt: new Date('2025-07-01'),
      updatedAt: new Date('2025-07-02'),
    },
    {
      id: 'al3',
      title: 'Error Rate Above Target',
      severity: 'warning',
      status: 'active',
      description: 'Current error rate is 0.8%, above the 0.5% target.',
      metricId: 'm4',
      threshold: 0.5,
      currentValue: 0.8,
      createdAt: new Date('2025-07-03'),
      updatedAt: new Date('2025-07-03'),
    },
    {
      id: 'al4',
      title: 'User Signup Milestone Approaching',
      severity: 'info',
      status: 'acknowledged',
      description: 'Active users approaching 10,000 target milestone.',
      metricId: 'm2',
      threshold: 10000,
      currentValue: 8420,
      createdAt: new Date('2025-07-05'),
      updatedAt: new Date('2025-07-06'),
      acknowledgedBy: 'Analytics Team',
    },
    {
      id: 'al5',
      title: 'Infrastructure Cost Reduction',
      severity: 'info',
      status: 'active',
      description: 'Infrastructure costs decreased 3.7% month-over-month.',
      metricId: 'm8',
      createdAt: new Date('2025-07-07'),
      updatedAt: new Date('2025-07-07'),
    },
  ]);

  private nextId = 100;

  readonly metrics$: Observable<Metric[]> = this._metrics$.asObservable();
  readonly trendSeries$: Observable<TrendSeries[]> = this._trendSeries$.asObservable();
  readonly alerts$: Observable<AnalyticsAlert[]> = this._alerts$.asObservable();
  readonly activeAlerts$: Observable<AnalyticsAlert[]> = this._alerts$.pipe(
    map((a) => a.filter((al) => al.status === 'active' || al.status === 'acknowledged')),
  );
  readonly criticalAlerts$: Observable<AnalyticsAlert[]> = this._alerts$.pipe(
    map((a) => a.filter((al) => al.severity === 'critical' && al.status === 'active')),
  );

  get metrics(): Metric[] {
    return this._metrics$.getValue();
  }

  get alerts(): AnalyticsAlert[] {
    return this._alerts$.getValue();
  }

  get trendSeries(): TrendSeries[] {
    return this._trendSeries$.getValue();
  }

  refreshMetric(id: string): void {
    const metrics = this._metrics$.getValue().map((m) => {
      if (m.id !== id) return m;
      const factor = 1 + (Math.random() * 0.1 - 0.05);
      const newValue = Math.round(m.value * factor * 100) / 100;
      const changePercent =
        Math.round(((newValue - m.previousValue) / m.previousValue) * 10000) / 100;
      return {
        ...m,
        value: newValue,
        changePercent,
        trend: newValue > m.previousValue ? 'up' : newValue < m.previousValue ? 'down' : 'flat',
        lastUpdated: new Date(),
      } as Metric;
    });
    this._metrics$.next(metrics);
  }

  acknowledgeAlert(id: string, by: string): void {
    const alerts = this._alerts$.getValue().map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'acknowledged' as AlertStatus,
            acknowledgedBy: by,
            updatedAt: new Date(),
          }
        : a,
    );
    this._alerts$.next(alerts);
  }

  resolveAlert(id: string): void {
    const alerts = this._alerts$
      .getValue()
      .map((a) =>
        a.id === id ? { ...a, status: 'resolved' as AlertStatus, updatedAt: new Date() } : a,
      );
    this._alerts$.next(alerts);
  }

  addAlert(alert: Omit<AnalyticsAlert, 'id' | 'createdAt' | 'updatedAt'>): AnalyticsAlert {
    const newAlert: AnalyticsAlert = {
      ...alert,
      id: `al${++this.nextId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this._alerts$.next([newAlert, ...this._alerts$.getValue()]);
    return newAlert;
  }

  getMetricById(id: string): Metric | undefined {
    return this._metrics$.getValue().find((m) => m.id === id);
  }
}
