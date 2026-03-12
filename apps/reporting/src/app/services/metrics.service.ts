import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KpiMetric, TimeSeries } from '../models/reporting.model';

const SEED_KPI: KpiMetric[] = [
  { id: 'kpi-1', name: 'Active Users', value: 4821, unit: 'users', change: +12.4, trend: 'up' },
  { id: 'kpi-2', name: 'Monthly Revenue', value: 128400, unit: 'USD', change: +8.1, trend: 'up' },
  {
    id: 'kpi-3',
    name: 'Support Tickets',
    value: 342,
    unit: 'tickets',
    change: -5.2,
    trend: 'down',
  },
  {
    id: 'kpi-4',
    name: 'Avg Response Time',
    value: 2.4,
    unit: 'hours',
    change: -18.0,
    trend: 'down',
  },
  { id: 'kpi-5', name: 'NPS Score', value: 67, unit: 'points', change: +3.0, trend: 'up' },
  { id: 'kpi-6', name: 'Churn Rate', value: 2.1, unit: '%', change: -0.3, trend: 'down' },
];

const SEED_SERIES: TimeSeries[] = [
  {
    id: 'ts-users',
    name: 'Daily Active Users',
    period: 'daily',
    data: [
      { date: '2025-01-01', value: 4200 },
      { date: '2025-01-02', value: 4350 },
      { date: '2025-01-03', value: 4100 },
      { date: '2025-01-04', value: 4550 },
      { date: '2025-01-05', value: 4821 },
    ],
  },
  {
    id: 'ts-revenue',
    name: 'Monthly Revenue',
    period: 'monthly',
    data: [
      { date: '2024-09-01', value: 110000 },
      { date: '2024-10-01', value: 115600 },
      { date: '2024-11-01', value: 119200 },
      { date: '2024-12-01', value: 121500 },
      { date: '2025-01-01', value: 128400 },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private kpiSubject = new BehaviorSubject<KpiMetric[]>([...SEED_KPI]);
  private seriesSubject = new BehaviorSubject<TimeSeries[]>([...SEED_SERIES]);

  readonly kpis$ = this.kpiSubject.asObservable();
  readonly series$ = this.seriesSubject.asObservable();

  get kpis(): KpiMetric[] {
    return this.kpiSubject.value;
  }

  get series(): TimeSeries[] {
    return this.seriesSubject.value;
  }

  getKpi(id: string): KpiMetric | undefined {
    return this.kpiSubject.value.find((k) => k.id === id);
  }

  getSeries(id: string): TimeSeries | undefined {
    return this.seriesSubject.value.find((s) => s.id === id);
  }

  refreshKpi(id: string): void {
    const updated = this.kpiSubject.value.map((k) =>
      k.id === id ? { ...k, value: k.value + Math.floor(Math.random() * 10) } : k,
    );
    this.kpiSubject.next(updated);
  }
}
