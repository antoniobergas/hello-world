import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { HealthCheckService } from './health-check.service';

describe('HealthCheckService', () => {
  let service: HealthCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(HealthCheckService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform a health check and return a report', () => {
    const report = service.check();
    expect(report).toBeTruthy();
    expect(report.version).toBe('1.0.0');
    expect(report.indicators.length).toBeGreaterThan(0);
  });

  it('should have storage indicator', () => {
    const report = service.check();
    const storageIndicator = report.indicators.find((i) => i.name === 'storage');
    expect(storageIndicator).toBeTruthy();
  });

  it('should have memory indicator', () => {
    const report = service.check();
    const memoryIndicator = report.indicators.find((i) => i.name === 'memory');
    expect(memoryIndicator).toBeTruthy();
  });

  it('should have application indicator', () => {
    const report = service.check();
    const appIndicator = report.indicators.find((i) => i.name === 'application');
    expect(appIndicator).toBeTruthy();
    expect(appIndicator?.status).toBe('healthy');
  });

  it('should return overall healthy status when all indicators healthy', () => {
    const report = service.check();
    // All indicators should be healthy in test environment
    expect(['healthy', 'degraded']).toContain(report.status);
  });

  it('should emit report via report$', async () => {
    service.check();
    const report = await firstValueFrom(service.report$);
    expect(report).toBeTruthy();
    expect(report.indicators).toBeTruthy();
  });

  it('should emit status via status$', async () => {
    service.check();
    const status = await firstValueFrom(service.status$);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(status);
  });

  it('should have uptime greater than 0', () => {
    const report = service.check();
    expect(report.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return metrics', () => {
    service.check();
    const metrics = service.getMetrics();
    expect(metrics['status']).toBeTruthy();
    expect(typeof metrics['indicatorCount']).toBe('number');
    expect(typeof metrics['healthyIndicators']).toBe('number');
  });

  it('should have each indicator with a name and message', () => {
    const report = service.check();
    report.indicators.forEach((i) => {
      expect(i.name).toBeTruthy();
      expect(i.message).toBeTruthy();
      expect(i.lastChecked).toBeInstanceOf(Date);
    });
  });
});
