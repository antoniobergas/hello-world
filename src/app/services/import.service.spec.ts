import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ImportService } from './import.service';

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    service = new ImportService();
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should have 5 seed jobs', () => {
    expect(service.jobs.length).toBe(5);
  });

  it('should expose jobs$ observable', async () => {
    const jobs = await firstValueFrom(service.jobs$);
    expect(jobs.length).toBe(5);
  });

  it('should validateRow for customers requires name and email', () => {
    const errors = service.validateRow('customers', { name: 'John' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
    expect(errors.some((e) => e.field === 'name')).toBe(false);
  });

  it('should validateRow for items requires name and price', () => {
    const errors = service.validateRow('items', {});
    expect(errors.some((e) => e.field === 'name')).toBe(true);
    expect(errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('should validateRow for tickets requires title and status', () => {
    const errors = service.validateRow('tickets', { title: 'Bug' });
    expect(errors.some((e) => e.field === 'status')).toBe(true);
  });

  it('should validateRow returns empty for valid row', () => {
    expect(service.validateRow('customers', { name: 'John', email: 'j@j.com' })).toEqual([]);
  });

  it('should startImport with valid rows returns completed job', () => {
    const job = service.startImport(
      'Test',
      'customers',
      [{ name: 'Alice', email: 'a@a.com' }],
      'u1',
    );
    expect(job.status).toBe('completed');
    expect(job.validRows).toBe(1);
  });

  it('should startImport with invalid rows returns failed job', () => {
    const job = service.startImport('Bad Import', 'customers', [{ name: 'Alice' }], 'u1');
    expect(job.status).toBe('failed');
    expect(job.invalidRows).toBe(1);
    expect(job.errors.length).toBeGreaterThan(0);
  });

  it('should startImport adds job to list', () => {
    service.startImport('Test', 'items', [{ name: 'Widget', price: 9.99 }], 'u1');
    expect(service.jobs.length).toBe(6);
  });

  it('should startImport assigns row numbers to errors', () => {
    const job = service.startImport(
      'Test',
      'customers',
      [{ name: 'Alice' }, { email: 'b@b.com' }],
      'u1',
    );
    expect(job.errors.some((e) => e.row === 1)).toBe(true);
    expect(job.errors.some((e) => e.row === 2)).toBe(true);
  });

  it('should cancel sets status to failed', () => {
    service.cancel('imp3');
    expect(service.jobs.find((j) => j.id === 'imp3')?.status).toBe('failed');
  });

  it('should getByStatus completed', () => {
    const completed = service.getByStatus('completed');
    expect(completed.every((j) => j.status === 'completed')).toBe(true);
    expect(completed.length).toBe(2);
  });

  it('should getByStatus pending', () => {
    const pending = service.getByStatus('pending');
    expect(pending.length).toBe(1);
  });

  it('should retry a failed job', () => {
    const job = service.retry('imp2');
    expect(job).toBeTruthy();
  });

  it('should retry returns undefined for unknown id', () => {
    expect(service.retry('unknown')).toBeUndefined();
  });

  it('should processImport sets completed if validRows > 0', () => {
    service.processImport('imp1');
    expect(service.jobs.find((j) => j.id === 'imp1')?.status).toBe('completed');
  });

  it('should processImport sets failed if validRows = 0', () => {
    service.processImport('imp2');
    expect(service.jobs.find((j) => j.id === 'imp2')?.status).toBe('failed');
  });

  it('should update observable after startImport', async () => {
    service.startImport('T', 'tickets', [{ title: 'Bug', status: 'open' }], 'u1');
    const jobs = await firstValueFrom(service.jobs$);
    expect(jobs.length).toBe(6);
  });

  it('should have imp1 in seed data', () => {
    expect(service.jobs.find((j) => j.id === 'imp1')).toBeTruthy();
  });

  it('should startImport with mixed rows correctly counts valid/invalid', () => {
    const job = service.startImport(
      'Mixed',
      'customers',
      [{ name: 'Alice', email: 'a@a.com' }, { name: 'Bob' }],
      'u1',
    );
    expect(job.validRows).toBe(1);
    expect(job.invalidRows).toBe(1);
  });
});
