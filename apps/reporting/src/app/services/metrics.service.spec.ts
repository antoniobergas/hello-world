import { TestBed } from '@angular/core/testing';
import { MetricsService } from './metrics.service';
import { firstValueFrom } from 'rxjs';

describe('MetricsService (Reporting)', () => {
  let service: MetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 6 KPI metrics', () => {
    expect(service.kpis.length).toBe(6);
  });

  it('should seed with 2 time series', () => {
    expect(service.series.length).toBe(2);
  });

  it('should find a KPI by id', () => {
    const kpi = service.getKpi('kpi-1');
    expect(kpi).toBeTruthy();
    expect(kpi?.name).toBe('Active Users');
  });

  it('should return undefined for unknown KPI id', () => {
    expect(service.getKpi('unknown')).toBeUndefined();
  });

  it('should find a time series by id', () => {
    const series = service.getSeries('ts-users');
    expect(series).toBeTruthy();
    expect(series?.name).toBe('Daily Active Users');
  });

  it('should emit KPIs via kpis$', async () => {
    const kpis = await firstValueFrom(service.kpis$);
    expect(kpis.length).toBe(6);
  });

  it('should refresh a KPI value (value may increase)', () => {
    const before = service.getKpi('kpi-1')!.value;
    service.refreshKpi('kpi-1');
    const after = service.getKpi('kpi-1')!.value;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('all KPIs should have a valid trend', () => {
    service.kpis.forEach((k) => {
      expect(['up', 'down', 'flat']).toContain(k.trend);
    });
  });
});
