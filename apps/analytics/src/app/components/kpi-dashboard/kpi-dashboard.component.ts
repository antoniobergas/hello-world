import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DecimalPipe, TitleCasePipe } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { Metric, MetricCategory } from '../../models/metrics.model';

type CategoryFilter = 'all' | MetricCategory;

@Component({
  selector: 'app-kpi-dashboard',
  imports: [NgClass, DecimalPipe, TitleCasePipe],
  template: `
    <h1>Analytics Dashboard</h1>

    <div class="category-tabs">
      @for (cat of categories; track cat) {
        <button
          class="category-tab"
          [ngClass]="{ active: activeCategory() === cat }"
          (click)="activeCategory.set(cat)">
          {{ cat === 'all' ? 'All' : (cat | titlecase) }}
        </button>
      }
    </div>

    <div class="metrics-grid">
      @for (metric of filteredMetrics(); track metric.id) {
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-name">{{ metric.name }}</span>
            <button class="refresh-btn" aria-label="Refresh metric" (click)="refresh(metric.id)">↻</button>
          </div>
          <div class="metric-value">{{ metric.value | number: '1.0-2' }} <span class="metric-unit">{{ metric.unit }}</span></div>
          <div class="metric-trend trend-{{ metric.trend }}">
            @if (metric.trend === 'up') { ↑ }
            @else if (metric.trend === 'down') { ↓ }
            @else { → }
          </div>
          <div class="metric-change" [ngClass]="{ positive: metric.changePercent > 0, negative: metric.changePercent < 0 }">
            {{ metric.changePercent > 0 ? '+' : '' }}{{ metric.changePercent | number: '1.1-1' }}%
          </div>
          @if (metric.target !== undefined) {
            <div class="metric-target">Target: {{ metric.target | number: '1.0-2' }} {{ metric.unit }}</div>
          }
          <div class="metric-category cat-{{ metric.category }}">{{ metric.category }}</div>
        </div>
      }
    </div>

    <div class="dashboard-summary">
      {{ allMetrics().length }} metrics tracked, {{ criticalCount() }} critical alerts
    </div>
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      .category-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .category-tab {
        padding: 0.4rem 0.9rem; border: 1px solid #d1d5db; border-radius: 20px;
        background: #f9fafb; font-size: 0.85rem; cursor: pointer; text-transform: capitalize;
      }
      .category-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
      .metrics-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem; margin-bottom: 1.5rem;
      }
      .metric-card {
        background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
        padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;
      }
      .metric-header { display: flex; justify-content: space-between; align-items: flex-start; }
      .metric-name { font-weight: 700; font-size: 0.9rem; color: #1e293b; }
      .refresh-btn { background: none; border: none; font-size: 1.1rem; color: #6b7280; cursor: pointer; padding: 0; }
      .refresh-btn:hover { color: #1a1a2e; }
      .metric-value { font-size: 1.6rem; font-weight: 800; color: #111827; }
      .metric-unit { font-size: 0.85rem; font-weight: 500; color: #6b7280; }
      .metric-trend { font-size: 1.2rem; }
      .trend-up { color: #10b981; }
      .trend-down { color: #ef4444; }
      .trend-flat { color: #6b7280; }
      .metric-change { font-size: 0.875rem; font-weight: 600; }
      .positive { color: #10b981; }
      .negative { color: #ef4444; }
      .metric-target { font-size: 0.8rem; color: #6b7280; }
      .metric-category {
        font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 10px;
        width: fit-content; font-weight: 600; text-transform: capitalize;
      }
      .cat-revenue { background: #dcfce7; color: #15803d; }
      .cat-users { background: #dbeafe; color: #1d4ed8; }
      .cat-performance { background: #fef3c7; color: #d97706; }
      .cat-quality { background: #f3e8ff; color: #7c3aed; }
      .cat-operations { background: #f1f5f9; color: #475569; }
      .dashboard-summary { font-weight: 600; color: #374151; padding: 0.5rem 0; }
    `,
  ],
})
export class KpiDashboardComponent implements OnInit {
  private readonly metricsService = inject(MetricsService);

  activeCategory = signal<CategoryFilter>('all');
  categories: CategoryFilter[] = ['all', 'revenue', 'users', 'performance', 'quality', 'operations'];

  private _metrics: Metric[] = [];
  private _criticalCount = 0;

  ngOnInit(): void {
    this.metricsService.metrics$.subscribe((m) => (this._metrics = m));
    this.metricsService.criticalAlerts$.subscribe((a) => (this._criticalCount = a.length));
  }

  allMetrics(): Metric[] {
    return this._metrics;
  }

  filteredMetrics(): Metric[] {
    const cat = this.activeCategory();
    if (cat === 'all') return this._metrics;
    return this._metrics.filter((m) => m.category === cat);
  }

  criticalCount(): number {
    return this._criticalCount;
  }

  refresh(id: string): void {
    this.metricsService.refreshMetric(id);
  }

}
