import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  imports: [AsyncPipe, DecimalPipe],
  template: `
    <section class="analytics-page" aria-label="Analytics dashboard">
      <h2>Analytics Dashboard</h2>

      <!-- Record Sample Metric -->
      <div class="analytics-section" aria-label="Record metrics">
        <h3>Record Metric</h3>
        <div class="record-row">
          <button class="sample-btn" (click)="recordSampleMetric()" aria-label="Record sample metric">
            Record Sample Metric
          </button>
          <span class="metric-count">
            Total recorded: {{ (analyticsService.metrics$ | async)?.length ?? 0 }}
          </span>
        </div>
      </div>

      <!-- Widgets -->
      <div class="analytics-section" aria-label="Dashboard widgets">
        <h3>Widgets</h3>
        <ul class="widget-list">
          @for (widget of analyticsService.widgets$ | async; track widget.id) {
            <li class="widget-item" [attr.aria-label]="'Widget: ' + widget.title">
              <span class="widget-title">{{ widget.title }}</span>
              <span class="badge-type">{{ widget.type }}</span>
              <span class="widget-interval">Refresh: {{ widget.refreshInterval }}s</span>
            </li>
          }
          @if ((analyticsService.widgets$ | async)?.length === 0) {
            <li class="empty-state">No widgets configured</li>
          }
        </ul>
        <button class="add-widget-btn" (click)="addSampleWidget()" aria-label="Add sample widget">
          + Add Sample Widget
        </button>
      </div>

      <!-- Metrics Summary -->
      <div class="analytics-section" aria-label="Metrics summary">
        <h3>Metrics Summary</h3>
        @if (getSummaryEntries().length > 0) {
          <table class="summary-table" aria-label="Metrics summary table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
                <th>Sum</th>
                <th>Avg</th>
                <th>Min</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of getSummaryEntries(); track entry.key) {
                <tr>
                  <td class="metric-name">{{ entry.key }}</td>
                  <td>{{ entry.value.count }}</td>
                  <td>{{ entry.value.sum | number: '1.2-2' }}</td>
                  <td>{{ entry.value.avg | number: '1.2-2' }}</td>
                  <td>{{ entry.value.min | number: '1.2-2' }}</td>
                  <td>{{ entry.value.max | number: '1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty-state">No metrics recorded yet</p>
        }
      </div>

      <!-- Top Metrics -->
      <div class="analytics-section" aria-label="Top metrics">
        <h3>Top Metrics</h3>
        <ul class="top-metrics-list">
          @for (item of getTopMetrics(); track item.name) {
            <li class="top-metric-item" [attr.aria-label]="'Metric ' + item.name + ': total ' + item.total">
              <span class="top-metric-name">{{ item.name }}</span>
              <span class="top-metric-total">{{ item.total | number: '1.2-2' }}</span>
            </li>
          }
          @if (getTopMetrics().length === 0) {
            <li class="empty-state">No metrics available</li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: [
    `
      .analytics-page {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }
      h2 {
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .analytics-section {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        background: white;
      }
      h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: #334155;
      }
      .record-row {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .sample-btn {
        padding: 0.4rem 1rem;
        background: #3b82f6;
        color: white;
        border: 1px solid #3b82f6;
        border-radius: 4px;
        cursor: pointer;
      }
      .sample-btn:hover { background: #2563eb; }
      .add-widget-btn {
        margin-top: 0.75rem;
        padding: 0.35rem 0.85rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        cursor: pointer;
        background: #f8fafc;
      }
      .metric-count {
        font-size: 0.875rem;
        color: #64748b;
      }
      .widget-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .widget-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .widget-title {
        font-weight: 600;
        flex: 1;
      }
      .badge-type {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        background: #e0f2fe;
        color: #0369a1;
      }
      .widget-interval {
        font-size: 0.8rem;
        color: #94a3b8;
      }
      .summary-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }
      .summary-table th {
        text-align: left;
        padding: 0.4rem 0.5rem;
        border-bottom: 2px solid #e2e8f0;
        color: #64748b;
        font-weight: 600;
      }
      .summary-table td {
        padding: 0.4rem 0.5rem;
        border-bottom: 1px solid #f1f5f9;
      }
      .metric-name { font-weight: 600; color: #1e293b; }
      .top-metrics-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .top-metric-item {
        display: flex;
        justify-content: space-between;
        padding: 0.4rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .top-metric-name { font-weight: 600; color: #1e293b; }
      .top-metric-total { color: #3b82f6; font-weight: 600; }
      .empty-state {
        color: #94a3b8;
        font-style: italic;
        padding: 0.5rem 0;
      }
    `,
  ],
})
export class AnalyticsComponent {
  analyticsService = inject(AnalyticsService);

  private widgetCount = 0;
  private metricCount = 0;

  recordSampleMetric(): void {
    this.metricCount++;
    const names = ['page_views', 'api_calls', 'errors', 'latency_ms'];
    const name = names[this.metricCount % names.length];
    this.analyticsService.recordMetric(name, Math.floor(Math.random() * 100) + 1, { env: 'demo' });
  }

  addSampleWidget(): void {
    this.widgetCount++;
    const types: Array<'counter' | 'chart' | 'table' | 'gauge'> = ['counter', 'chart', 'table', 'gauge'];
    this.analyticsService.addWidget({
      id: `widget-${this.widgetCount}`,
      title: `Widget ${this.widgetCount}`,
      type: types[this.widgetCount % types.length],
      data: null,
      refreshInterval: 30,
    });
  }

  getSummaryEntries(): Array<{ key: string; value: { count: number; sum: number; avg: number; max: number; min: number } }> {
    const summary = this.analyticsService.computeSummary();
    return Object.entries(summary).map(([key, value]) => ({ key, value }));
  }

  getTopMetrics(): Array<{ name: string; total: number }> {
    return this.analyticsService.getTopMetrics(5);
  }
}
