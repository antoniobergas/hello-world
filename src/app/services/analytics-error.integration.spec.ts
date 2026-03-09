import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';
import { ErrorReportingService } from './error-reporting.service';
import { NotificationService } from './notification.service';

describe('Analytics + ErrorReporting + Notification Integration', () => {
  let analytics: AnalyticsService;
  let errorReporting: ErrorReportingService;
  let notifications: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService, ErrorReportingService, NotificationService],
    });
    analytics = TestBed.inject(AnalyticsService);
    errorReporting = TestBed.inject(ErrorReportingService);
    notifications = TestBed.inject(NotificationService);
  });

  it('should record a metric and add it to the analytics service', () => {
    const snapshot = analytics.recordMetric('page_views', 42, { page: 'home' });
    expect(analytics.metrics).toHaveLength(1);
    expect(snapshot.metricName).toBe('page_views');
    expect(snapshot.value).toBe(42);
    expect(snapshot.tags['page']).toBe('home');
  });

  it('should create an error report when an error is reported', () => {
    const report = errorReporting.reportError('Something went wrong', 'stack trace here', 'error', { component: 'dashboard' });
    expect(errorReporting.reports).toHaveLength(1);
    expect(report.message).toBe('Something went wrong');
    expect(report.level).toBe('error');
    expect(report.resolved).toBe(false);
  });

  it('should track error count correctly across multiple errors', () => {
    errorReporting.reportError('Error 1');
    errorReporting.reportError('Error 2');
    errorReporting.reportWarning('Warning 1');
    errorReporting.reportInfo('Info 1');

    expect(errorReporting.getErrorCount()).toBe(4);
    expect(errorReporting.getByLevel('error')).toHaveLength(2);
    expect(errorReporting.getByLevel('warn')).toHaveLength(1);
    expect(errorReporting.getByLevel('info')).toHaveLength(1);
  });

  it('should return unresolved errors from getUnresolved()', () => {
    errorReporting.reportError('Error A');
    const errB = errorReporting.reportError('Error B');
    errorReporting.reportError('Error C');

    errorReporting.resolveError(errB.id);

    const unresolved = errorReporting.getUnresolved();
    expect(unresolved).toHaveLength(2);
    expect(unresolved.find((r) => r.id === errB.id)).toBeUndefined();
  });

  it('should remove error from unresolved list after resolving it', () => {
    const report = errorReporting.reportError('Critical failure', undefined, 'fatal');
    expect(errorReporting.getUnresolved()).toHaveLength(1);

    errorReporting.resolveError(report.id);
    expect(errorReporting.getUnresolved()).toHaveLength(0);

    const resolved = errorReporting.reports.find((r) => r.id === report.id);
    expect(resolved?.resolved).toBe(true);
  });

  it('should allow analytics widgets and metrics to coexist', () => {
    analytics.recordMetric('api_latency', 120);
    analytics.recordMetric('error_rate', 0.5);

    analytics.addWidget({
      id: 'w1',
      title: 'Error Rate',
      type: 'gauge',
      data: { value: 0.5 },
      refreshInterval: 30,
    });
    analytics.addWidget({
      id: 'w2',
      title: 'API Latency',
      type: 'chart',
      data: [],
      refreshInterval: 60,
    });

    expect(analytics.metrics).toHaveLength(2);
    expect(analytics.widgets).toHaveLength(2);
    expect(analytics.getWidgetData('w1')).toEqual({ value: 0.5 });
  });

  it('should filter errors by level correctly', () => {
    errorReporting.reportError('Fatal error', undefined, 'fatal');
    errorReporting.reportError('Regular error', undefined, 'error');
    errorReporting.reportWarning('A warning');
    errorReporting.reportInfo('Just info');

    const fatals = errorReporting.getByLevel('fatal');
    expect(fatals).toHaveLength(1);
    expect(fatals[0].message).toBe('Fatal error');

    const warns = errorReporting.getByLevel('warn');
    expect(warns).toHaveLength(1);
    expect(warns[0].message).toBe('A warning');
  });

  it('should compute analytics summary correctly with recorded metrics', () => {
    analytics.recordMetric('requests', 100);
    analytics.recordMetric('requests', 200);
    analytics.recordMetric('requests', 300);
    analytics.recordMetric('errors', 5);

    const summary = analytics.computeSummary();
    expect(summary['requests']).toBeDefined();
    expect(summary['requests'].count).toBe(3);
    expect(summary['requests'].sum).toBe(600);
    expect(summary['requests'].avg).toBe(200);
    expect(summary['requests'].max).toBe(300);
    expect(summary['requests'].min).toBe(100);
    expect(summary['errors'].count).toBe(1);
    expect(summary['errors'].sum).toBe(5);
  });

  it('should track notifications shown for error events', () => {
    const report = errorReporting.reportError('DB connection failed');
    notifications.show(`Error: ${report.message}`, 'error', 60000);
    expect(notifications.current).toHaveLength(1);
    expect(notifications.current[0].type).toBe('error');
    expect(notifications.current[0].message).toContain('DB connection failed');
  });

  it('should clear resolved errors without affecting unresolved ones', () => {
    const r1 = errorReporting.reportError('Error 1');
    errorReporting.reportError('Error 2');
    errorReporting.resolveError(r1.id);

    errorReporting.clearResolved();
    expect(errorReporting.reports).toHaveLength(1);
    expect(errorReporting.reports[0].message).toBe('Error 2');
  });
});
