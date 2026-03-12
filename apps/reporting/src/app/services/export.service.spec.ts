import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';

describe('ExportService (Reporting)', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 3 export jobs', () => {
    expect(service.jobs.length).toBe(3);
  });

  it('should schedule a new export job', () => {
    const before = service.jobs.length;
    const job = service.schedule('rpt-001', 'Revenue Report', 'csv');
    expect(service.jobs.length).toBe(before + 1);
    expect(service.jobs[0].id).toBe(job.id);
    expect(job.status).toBe('pending');
    expect(job.format).toBe('csv');
  });

  it('should mark a job as ready', () => {
    const job = service.schedule('rpt-001', 'Test', 'json');
    service.markReady(job.id, 128);
    const updated = service.jobs.find((j) => j.id === job.id);
    expect(updated?.status).toBe('ready');
    expect(updated?.fileSizeKb).toBe(128);
    expect(updated?.readyAt).toBeTruthy();
  });

  it('should delete an export job', () => {
    const before = service.jobs.length;
    service.delete('exp-001');
    expect(service.jobs.length).toBe(before - 1);
    expect(service.jobs.find((j) => j.id === 'exp-001')).toBeUndefined();
  });
});
