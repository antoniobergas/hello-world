import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface MetricSnapshot {
  timestamp: Date;
  metricName: string;
  value: number;
  tags: Record<string, string>;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'counter' | 'chart' | 'table' | 'gauge';
  data: unknown;
  refreshInterval: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private metricsSubject = new BehaviorSubject<MetricSnapshot[]>([]);
  private widgetsSubject = new BehaviorSubject<DashboardWidget[]>([]);

  readonly metrics$: Observable<MetricSnapshot[]> = this.metricsSubject.asObservable();
  readonly widgets$: Observable<DashboardWidget[]> = this.widgetsSubject.asObservable();

  get metrics(): MetricSnapshot[] {
    return this.metricsSubject.value;
  }

  get widgets(): DashboardWidget[] {
    return this.widgetsSubject.value;
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}): MetricSnapshot {
    const snapshot: MetricSnapshot = { timestamp: new Date(), metricName: name, value, tags };
    this.metricsSubject.next([...this.metricsSubject.value, snapshot]);
    return snapshot;
  }

  getMetricHistory(name: string, since: Date): MetricSnapshot[] {
    return this.metricsSubject.value.filter((m) => m.metricName === name && m.timestamp >= since);
  }

  addWidget(widget: DashboardWidget): void {
    this.widgetsSubject.next([...this.widgetsSubject.value, widget]);
  }

  removeWidget(id: string): void {
    this.widgetsSubject.next(this.widgetsSubject.value.filter((w) => w.id !== id));
  }

  getWidgetData(id: string): unknown {
    return this.widgetsSubject.value.find((w) => w.id === id)?.data ?? null;
  }

  computeSummary(): Record<
    string,
    { count: number; sum: number; avg: number; max: number; min: number }
  > {
    const summary: Record<
      string,
      { count: number; sum: number; avg: number; max: number; min: number }
    > = {};
    for (const m of this.metricsSubject.value) {
      if (!summary[m.metricName]) {
        summary[m.metricName] = { count: 0, sum: 0, avg: 0, max: -Infinity, min: Infinity };
      }
      const s = summary[m.metricName];
      s.count++;
      s.sum += m.value;
      s.max = Math.max(s.max, m.value);
      s.min = Math.min(s.min, m.value);
      s.avg = s.sum / s.count;
    }
    return summary;
  }

  getTopMetrics(limit: number): Array<{ name: string; total: number }> {
    const totals: Record<string, number> = {};
    for (const m of this.metricsSubject.value) {
      totals[m.metricName] = (totals[m.metricName] ?? 0) + m.value;
    }
    return Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  clearOldMetrics(olderThan: Date): number {
    const before = this.metricsSubject.value.length;
    this.metricsSubject.next(this.metricsSubject.value.filter((m) => m.timestamp >= olderThan));
    return before - this.metricsSubject.value.length;
  }
}
