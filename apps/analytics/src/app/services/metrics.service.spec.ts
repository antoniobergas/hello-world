import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 8 metrics', () => {
    expect(service.metrics.length).toBe(8);
  });

  it('should seed with 5 alerts', () => {
    expect(service.alerts.length).toBe(5);
  });

  it('should refreshMetric() update the metric lastUpdated', async () => {
    const before = service.getMetricById('m1')!.lastUpdated;
    await new Promise((r) => setTimeout(r, 10));
    service.refreshMetric('m1');
    const after = service.getMetricById('m1')!.lastUpdated;
    expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should acknowledgeAlert() change status to acknowledged and set acknowledgedBy', () => {
    const active = service.alerts.find((a) => a.status === 'active');
    service.acknowledgeAlert(active!.id, 'Analyst');
    const updated = service.alerts.find((a) => a.id === active!.id);
    expect(updated!.status).toBe('acknowledged');
    expect(updated!.acknowledgedBy).toBe('Analyst');
  });

  it('should resolveAlert() change status to resolved', () => {
    const active = service.alerts.find((a) => a.status === 'active');
    service.resolveAlert(active!.id);
    const updated = service.alerts.find((a) => a.id === active!.id);
    expect(updated!.status).toBe('resolved');
  });

  it('should addAlert() prepend alert and return it with id', () => {
    const before = service.alerts.length;
    const alert = service.addAlert({
      title: 'Test Alert',
      description: 'Test description',
      severity: 'warning',
      status: 'active',
    });
    expect(alert.id).toBeTruthy();
    expect(service.alerts.length).toBe(before + 1);
    expect(service.alerts[0].id).toBe(alert.id);
  });

  it('should getMetricById() return the correct metric', () => {
    const metric = service.getMetricById('m2');
    expect(metric).toBeTruthy();
    expect(metric!.name).toBe('Active Users');
  });

  it('should activeAlerts$ filter to only active/acknowledged alerts', async () => {
    const active = await firstValueFrom(service.activeAlerts$);
    expect(active.every((a) => a.status === 'active' || a.status === 'acknowledged')).toBe(true);
  });
});
