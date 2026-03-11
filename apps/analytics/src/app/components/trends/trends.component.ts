import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetricsService } from '../../services/metrics.service';
import { TrendSeries, DataPoint } from '../../models/metrics.model';

@Component({
  selector: 'app-trends',
  imports: [DecimalPipe, DatePipe, FormsModule],
  template: `
    <h1>Trend Analysis</h1>

    <div class="controls">
      <label for="seriesSel">Series:</label>
      <select class="series-select" id="seriesSel" [(ngModel)]="selectedSeriesId" (ngModelChange)="onSeriesChange()">
        <option value="">Select a series...</option>
        @for (s of allSeries; track s.id) {
          <option [value]="s.id">{{ s.name }}</option>
        }
      </select>
    </div>

    @if (selectedSeries()) {
      <div class="series-detail">
        <h2>{{ selectedSeries()!.name }}</h2>
        <span class="series-category cat-{{ selectedSeries()!.category }}">{{ selectedSeries()!.category }}</span>
        <span class="series-unit">Unit: {{ selectedSeries()!.unit }}</span>
      </div>

      <div class="data-points-list">
        @for (point of selectedSeries()!.points; track point.label) {
          <div class="data-point-row">
            <span class="point-label">{{ point.label }}</span>
            <span class="point-date">{{ point.date | date: 'MMM yyyy' }}</span>
            <div class="point-bar-wrap">
              <div
                class="point-bar"
                [style.width.%]="getBarWidth(point.value)"
                [style.background]="selectedSeries()!.color">
              </div>
            </div>
            <span class="point-value">{{ point.value | number: '1.0-2' }} {{ selectedSeries()!.unit }}</span>
          </div>
        }
      </div>

      <div class="trend-summary">
        {{ selectedSeries()!.points.length }} data points | Latest: {{ latestValue() | number: '1.0-2' }} {{ selectedSeries()!.unit }}
      </div>

      <div class="stats-panel">
        <div class="stat-min">Min: {{ minValue() | number: '1.0-2' }}</div>
        <div class="stat-max">Max: {{ maxValue() | number: '1.0-2' }}</div>
        <div class="stat-avg">Avg: {{ avgValue() | number: '1.0-2' }}</div>
      </div>
    } @else {
      <p class="empty-state">Select a trend series to view data.</p>
    }
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      .controls { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
      .series-select { padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 4px; min-width: 220px; }
      .series-detail { margin-bottom: 1.5rem; }
      .series-detail h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
      .series-category {
        padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;
        text-transform: capitalize; margin-right: 0.75rem;
      }
      .cat-revenue { background: #dcfce7; color: #15803d; }
      .cat-users { background: #dbeafe; color: #1d4ed8; }
      .cat-performance { background: #fef3c7; color: #d97706; }
      .cat-quality { background: #f3e8ff; color: #7c3aed; }
      .cat-operations { background: #f1f5f9; color: #475569; }
      .series-unit { font-size: 0.85rem; color: #6b7280; }
      .data-points-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
      .data-point-row {
        display: flex; align-items: center; gap: 1rem;
        padding: 0.6rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
      }
      .point-label { font-weight: 600; min-width: 40px; }
      .point-date { color: #6b7280; font-size: 0.85rem; min-width: 80px; }
      .point-bar-wrap { flex: 1; background: #f3f4f6; border-radius: 4px; height: 8px; overflow: hidden; }
      .point-bar { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
      .point-value { min-width: 120px; text-align: right; font-weight: 600; color: #374151; }
      .trend-summary {
        background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px;
        padding: 0.75rem 1rem; color: #0369a1; font-weight: 600; margin-bottom: 1rem;
      }
      .stats-panel { display: flex; gap: 2rem; }
      .stat-min, .stat-max, .stat-avg {
        padding: 0.5rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
        font-size: 0.9rem; color: #374151;
      }
      .stat-max { color: #15803d; }
      .stat-min { color: #dc2626; }
      .stat-avg { color: #1d4ed8; }
      .empty-state { color: #9ca3af; font-style: italic; }
    `,
  ],
})
export class TrendsComponent implements OnInit {
  private readonly metricsService = inject(MetricsService);

  allSeries: TrendSeries[] = [];
  selectedSeriesId = '';
  private _selectedSeries = signal<TrendSeries | null>(null);

  ngOnInit(): void {
    this.metricsService.trendSeries$.subscribe((series) => {
      this.allSeries = series;
      if (series.length > 0 && !this.selectedSeriesId) {
        this.selectedSeriesId = series[0].id;
        this._selectedSeries.set(series[0]);
      }
    });
  }

  selectedSeries(): TrendSeries | null {
    return this._selectedSeries();
  }

  onSeriesChange(): void {
    const found = this.allSeries.find((s) => s.id === this.selectedSeriesId) ?? null;
    this._selectedSeries.set(found);
  }

  getBarWidth(value: number): number {
    const series = this._selectedSeries();
    if (!series || series.points.length === 0) return 0;
    const max = Math.max(...series.points.map((p) => p.value));
    return max === 0 ? 0 : (value / max) * 100;
  }

  latestValue(): number {
    const series = this._selectedSeries();
    if (!series || series.points.length === 0) return 0;
    return series.points[series.points.length - 1].value;
  }

  minValue(): number {
    const series = this._selectedSeries();
    if (!series || series.points.length === 0) return 0;
    return Math.min(...series.points.map((p) => p.value));
  }

  maxValue(): number {
    const series = this._selectedSeries();
    if (!series || series.points.length === 0) return 0;
    return Math.max(...series.points.map((p) => p.value));
  }

  avgValue(): number {
    const series = this._selectedSeries();
    if (!series || series.points.length === 0) return 0;
    const sum = series.points.reduce((s, p) => s + p.value, 0);
    return Math.round((sum / series.points.length) * 100) / 100;
  }
}
