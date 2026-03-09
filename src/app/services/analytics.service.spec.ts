import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService, DashboardWidget } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AnalyticsService] });
    service = TestBed.inject(AnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no metrics', () => {
    expect(service.metrics.length).toBe(0);
  });

  it('should record a metric', () => {
    const m = service.recordMetric('cpu_usage', 42, { host: 'server1' });
    expect(m.metricName).toBe('cpu_usage');
    expect(m.value).toBe(42);
    expect(service.metrics.length).toBe(1);
  });

  it('should get metric history since a date', () => {
    const past = new Date(Date.now() - 5000);
    service.recordMetric('cpu_usage', 10);
    service.recordMetric('cpu_usage', 20);
    const history = service.getMetricHistory('cpu_usage', past);
    expect(history.length).toBe(2);
  });

  it('should filter metric history by name', () => {
    service.recordMetric('cpu_usage', 10);
    service.recordMetric('memory', 50);
    const history = service.getMetricHistory('cpu_usage', new Date(0));
    expect(history.length).toBe(1);
  });

  it('should add a widget', () => {
    const widget: DashboardWidget = { id: 'w1', title: 'CPU', type: 'gauge', data: {}, refreshInterval: 5000 };
    service.addWidget(widget);
    expect(service.widgets.length).toBe(1);
  });

  it('should remove a widget', () => {
    const widget: DashboardWidget = { id: 'w1', title: 'CPU', type: 'gauge', data: {}, refreshInterval: 5000 };
    service.addWidget(widget);
    service.removeWidget('w1');
    expect(service.widgets.length).toBe(0);
  });

  it('should get widget data by id', () => {
    const widget: DashboardWidget = { id: 'w1', title: 'CPU', type: 'counter', data: { value: 100 }, refreshInterval: 1000 };
    service.addWidget(widget);
    expect(service.getWidgetData('w1')).toEqual({ value: 100 });
  });

  it('should compute summary with avg, max, min', () => {
    service.recordMetric('cpu', 10);
    service.recordMetric('cpu', 20);
    service.recordMetric('cpu', 30);
    const summary = service.computeSummary();
    expect(summary['cpu'].count).toBe(3);
    expect(summary['cpu'].avg).toBe(20);
    expect(summary['cpu'].max).toBe(30);
    expect(summary['cpu'].min).toBe(10);
  });

  it('should get top metrics by total value', () => {
    service.recordMetric('cpu', 100);
    service.recordMetric('cpu', 50);
    service.recordMetric('memory', 10);
    const top = service.getTopMetrics(1);
    expect(top[0].name).toBe('cpu');
    expect(top[0].total).toBe(150);
  });

  it('should clear old metrics', () => {
    service.recordMetric('cpu', 10);
    const cleared = service.clearOldMetrics(new Date(Date.now() + 1000));
    expect(cleared).toBe(1);
    expect(service.metrics.length).toBe(0);
  });

  it('should emit metrics via metrics$', async () => {
    service.recordMetric('cpu', 50);
    const metrics = await firstValueFrom(service.metrics$);
    expect(metrics.length).toBe(1);
  });
});
