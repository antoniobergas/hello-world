import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';

@Component({
  selector: 'app-overview',
  imports: [AsyncPipe, NgClass, DecimalPipe],
  template: `
    <section class="overview-page" aria-label="Reporting overview">
      <h1>Business Overview</h1>

      <!-- KPI Cards -->
      <div class="kpi-grid" aria-label="KPI metrics grid">
        @for (kpi of metricsService.kpis$ | async; track kpi.id) {
          <div
            class="kpi-card"
            [attr.data-kpi-id]="kpi.id"
            [attr.aria-label]="kpi.name + ' metric card'"
          >
            <div class="kpi-header">
              <span class="kpi-name">{{ kpi.name }}</span>
              <span
                class="kpi-trend trend-{{ kpi.trend }}"
                [attr.aria-label]="'Trend: ' + kpi.trend"
              >
                {{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→' }}
              </span>
            </div>
            <div class="kpi-value" [attr.aria-label]="kpi.name + ' value'">
              {{ kpi.value | number }}
              <span class="kpi-unit">{{ kpi.unit }}</span>
            </div>
            <div
              class="kpi-change"
              [ngClass]="kpi.change >= 0 ? 'change-positive' : 'change-negative'"
            >
              {{ kpi.change > 0 ? '+' : '' }}{{ kpi.change | number: '1.1-1' }}% vs last period
            </div>
            <button
              class="kpi-refresh-btn"
              (click)="metricsService.refreshKpi(kpi.id)"
              [attr.aria-label]="'Refresh ' + kpi.name"
            >
              ↻
            </button>
          </div>
        }
      </div>

      <!-- Time Series Summary -->
      <div class="series-section" aria-label="Time series summaries">
        <h2>Trend Summaries</h2>
        @for (series of metricsService.series$ | async; track series.id) {
          <div
            class="series-card"
            [attr.data-series-id]="series.id"
            [attr.aria-label]="series.name + ' trend'"
          >
            <h3 class="series-name">{{ series.name }}</h3>
            <span class="series-period">{{ series.period }}</span>
            <div class="series-points" aria-label="Data points">
              @for (point of series.data; track point.date) {
                <div class="point" [attr.aria-label]="point.date + ': ' + point.value">
                  <span class="point-date">{{ point.date }}</span>
                  <span class="point-value">{{ point.value | number }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .overview-page {
        color: #e2e8f0;
      }
      h1 {
        margin-bottom: 1.5rem;
        font-size: 1.75rem;
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .kpi-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 1rem;
        position: relative;
      }
      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
      }
      .kpi-name {
        font-size: 0.8rem;
        color: #94a3b8;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .kpi-trend {
        font-size: 1.25rem;
      }
      .trend-up {
        color: #22c55e;
      }
      .trend-down {
        color: #ef4444;
      }
      .trend-flat {
        color: #94a3b8;
      }
      .kpi-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #f1f5f9;
      }
      .kpi-unit {
        font-size: 0.8rem;
        color: #64748b;
        margin-left: 0.25rem;
      }
      .kpi-change {
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }
      .change-positive {
        color: #22c55e;
      }
      .change-negative {
        color: #ef4444;
      }
      .kpi-refresh-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        color: #475569;
        font-size: 1rem;
        padding: 0.2rem;
      }
      .series-section h2 {
        margin-bottom: 1rem;
        font-size: 1.25rem;
      }
      .series-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      .series-name {
        margin: 0 0 0.25rem;
        font-size: 1rem;
      }
      .series-period {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
      }
      .series-points {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 0.75rem;
      }
      .point {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.15rem;
      }
      .point-date {
        font-size: 0.7rem;
        color: #64748b;
      }
      .point-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: #e2e8f0;
      }
    `,
  ],
})
export class OverviewComponent {
  readonly metricsService = inject(MetricsService);
}
