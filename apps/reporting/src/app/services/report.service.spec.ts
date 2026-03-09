import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { firstValueFrom } from 'rxjs';

describe('ReportService (Reporting)', () => {
  let service: ReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 4 reports', () => {
    expect(service.reports.length).toBe(4);
  });

  it('should create a new draft report', () => {
    const before = service.reports.length;
    const report = service.create('Test Report', 'Some description');
    expect(service.reports.length).toBe(before + 1);
    expect(report.status).toBe('draft');
    expect(report.name).toBe('Test Report');
  });

  it('should get a report by id', () => {
    const report = service.getById('rpt-001');
    expect(report).toBeTruthy();
    expect(report?.name).toBe('Monthly Revenue Summary');
  });

  it('should return undefined for unknown id', () => {
    expect(service.getById('unknown')).toBeUndefined();
  });

  it('should delete a report', () => {
    const before = service.reports.length;
    service.delete('rpt-004');
    expect(service.reports.length).toBe(before - 1);
    expect(service.getById('rpt-004')).toBeUndefined();
  });

  it('completedReports$ emits only completed reports', async () => {
    const completed = await firstValueFrom(service.completedReports$);
    expect(completed.every((r) => r.status === 'completed')).toBe(true);
  });

  it('should set status to running when run() is called', () => {
    service.run('rpt-003');
    expect(service.getById('rpt-003')?.status).toBe('running');
  });
});
