import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExportService } from './export.service';

const sampleData = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
];

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExportService] });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no export jobs', () => {
    expect(service.exportJobs.length).toBe(0);
  });

  it('should export data to CSV string', () => {
    const csv = service.exportToCsv(sampleData, 'test.csv');
    expect(csv).toContain('id,name,age');
    expect(csv).toContain('1,Alice,30');
    expect(csv).toContain('2,Bob,25');
  });

  it('should export data to JSON string', () => {
    const json = service.exportToJson(sampleData, 'test.json');
    const parsed = JSON.parse(json);
    expect(parsed.length).toBe(2);
    expect(parsed[0].name).toBe('Alice');
  });

  it('should export data to TSV string', () => {
    const tsv = service.exportToTsv(sampleData, 'test.tsv');
    expect(tsv).toContain('id\tname\tage');
    expect(tsv).toContain('1\tAlice\t30');
  });

  it('should return empty string for CSV with no data', () => {
    expect(service.exportToCsv([], 'empty.csv')).toBe('');
  });

  it('should return empty string for TSV with no data', () => {
    expect(service.exportToTsv([], 'empty.tsv')).toBe('');
  });

  it('should schedule an export job and record it', () => {
    const job = service.scheduleExport('csv', sampleData, 'output.csv');
    expect(job.format).toBe('csv');
    expect(job.recordCount).toBe(2);
    expect(job.status).toBe('complete');
    expect(service.getExportJobs().length).toBe(1);
  });

  it('should clear export jobs', () => {
    service.scheduleExport('json', sampleData, 'output.json');
    service.clearExportJobs();
    expect(service.getExportJobs().length).toBe(0);
  });

  it('should emit jobs via exportJobs$', async () => {
    service.scheduleExport('tsv', sampleData, 'output.tsv');
    const jobs = await firstValueFrom(service.exportJobs$);
    expect(jobs.length).toBe(1);
    expect(jobs[0].format).toBe('tsv');
  });

  it('should quote CSV values containing commas', () => {
    const data = [{ id: '1', name: 'Smith, John' }];
    const csv = service.exportToCsv(data, 'test.csv');
    expect(csv).toContain('"Smith, John"');
  });
});
