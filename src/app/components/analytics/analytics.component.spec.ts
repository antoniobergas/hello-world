import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { AnalyticsService } from '../../services/analytics.service';

describe('AnalyticsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject AnalyticsService', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    expect(fixture.componentInstance.analyticsService).toBeTruthy();
  });

  it('should record a metric when recordSampleMetric is called', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    const service = TestBed.inject(AnalyticsService);
    fixture.componentInstance.recordSampleMetric();
    expect(service.metrics.length).toBe(1);
  });

  it('should add a widget when addSampleWidget is called', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    const service = TestBed.inject(AnalyticsService);
    fixture.componentInstance.addSampleWidget();
    expect(service.widgets.length).toBe(1);
    expect(service.widgets[0].title).toBe('Widget 1');
  });

  it('should return empty summary when no metrics recorded', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    expect(fixture.componentInstance.getSummaryEntries()).toEqual([]);
  });

  it('should compute summary entries after recording metrics', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    const service = TestBed.inject(AnalyticsService);
    service.recordMetric('cpu', 50);
    service.recordMetric('cpu', 100);
    const entries = fixture.componentInstance.getSummaryEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].key).toBe('cpu');
    expect(entries[0].value.count).toBe(2);
    expect(entries[0].value.avg).toBe(75);
  });

  it('should return top metrics sorted by total', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    const service = TestBed.inject(AnalyticsService);
    service.recordMetric('alpha', 10);
    service.recordMetric('beta', 50);
    service.recordMetric('alpha', 20);
    const top = fixture.componentInstance.getTopMetrics();
    expect(top[0].name).toBe('beta');
    expect(top[1].name).toBe('alpha');
  });

  it('should render empty state for widgets when none configured', () => {
    const fixture = TestBed.createComponent(AnalyticsComponent);
    fixture.detectChanges();
    const emptyItems = fixture.nativeElement.querySelectorAll('.empty-state');
    expect(emptyItems.length).toBeGreaterThan(0);
  });
});
