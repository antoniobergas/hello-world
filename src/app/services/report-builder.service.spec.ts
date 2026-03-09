import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReportBuilderService } from './report-builder.service';

describe('ReportBuilderService', () => {
  let service: ReportBuilderService;

  beforeEach(() => {
    service = new ReportBuilderService();
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should have 8 seed reports', () => {
    expect(service.reports.length).toBe(8);
  });

  it('should expose reports$ observable', async () => {
    const reports = await firstValueFrom(service.reports$);
    expect(reports.length).toBe(8);
  });

  it('should create a report with UUID and defaults', () => {
    const r = service.create({
      name: 'Test',
      description: 'Desc',
      entity: 'tickets',
      groupBy: undefined,
      sortBy: 'id',
      sortDir: 'asc',
      createdBy: 'u1',
    });
    expect(r.id).toBeTruthy();
    expect(typeof r.id).toBe('string');
    expect(r.status).toBe('draft');
    expect(r.runCount).toBe(0);
    expect(r.columns).toEqual([]);
    expect(r.filters).toEqual([]);
    expect(r.createdAt).toBeInstanceOf(Date);
  });

  it('should add created report to list', () => {
    service.create({
      name: 'X',
      description: 'X',
      entity: 'customers',
      sortBy: 'id',
      sortDir: 'asc',
      createdBy: 'u1',
    });
    expect(service.reports.length).toBe(9);
  });

  it('should save a report', () => {
    service.save('rep4');
    expect(service.reports.find((r) => r.id === 'rep4')?.status).toBe('saved');
  });

  it('should addColumn', () => {
    service.addColumn('rep4', { field: 'name', label: 'Name', type: 'string', visible: true });
    expect(service.reports.find((r) => r.id === 'rep4')?.columns.length).toBe(1);
  });

  it('should removeColumn by field', () => {
    service.addColumn('rep4', { field: 'name', label: 'Name', type: 'string', visible: true });
    service.removeColumn('rep4', 'name');
    expect(service.reports.find((r) => r.id === 'rep4')?.columns.length).toBe(0);
  });

  it('should addFilter', () => {
    service.addFilter('rep4', { field: 'status', operator: 'eq', value: 'open' });
    expect(service.reports.find((r) => r.id === 'rep4')?.filters.length).toBe(1);
  });

  it('should removeFilter by field', () => {
    service.addFilter('rep4', { field: 'status', operator: 'eq', value: 'open' });
    service.removeFilter('rep4', 'status');
    expect(service.reports.find((r) => r.id === 'rep4')?.filters.length).toBe(0);
  });

  it('should run increments runCount and sets lastRunAt', () => {
    const before = service.reports.find((r) => r.id === 'rep1')!.runCount;
    service.run('rep1');
    const after = service.reports.find((r) => r.id === 'rep1')!;
    expect(after.runCount).toBe(before + 1);
    expect(after.lastRunAt).toBeInstanceOf(Date);
  });

  it('should run returns undefined for unknown id', () => {
    expect(service.run('unknown')).toBeUndefined();
  });

  it('should schedule sets status and cron', () => {
    service.schedule('rep4', '0 9 * * 1');
    const r = service.reports.find((r) => r.id === 'rep4')!;
    expect(r.status).toBe('scheduled');
    expect(r.schedule).toBe('0 9 * * 1');
  });

  it('should getByEntity tickets', () => {
    const tickets = service.getByEntity('tickets');
    expect(tickets.every((r) => r.entity === 'tickets')).toBe(true);
    expect(tickets.length).toBe(2);
  });

  it('should getByEntity items', () => {
    const items = service.getByEntity('items');
    expect(items.length).toBe(2);
  });

  it('should getMostRun returns top 5 by default', () => {
    const top = service.getMostRun();
    expect(top.length).toBe(5);
    expect(top[0].runCount).toBeGreaterThanOrEqual(top[1].runCount);
  });

  it('should getMostRun respects limit', () => {
    const top3 = service.getMostRun(3);
    expect(top3.length).toBe(3);
  });

  it('should update observable after create', async () => {
    service.create({
      name: 'X',
      description: 'X',
      entity: 'invoices',
      sortBy: 'id',
      sortDir: 'asc',
      createdBy: 'u1',
    });
    const reports = await firstValueFrom(service.reports$);
    expect(reports.length).toBe(9);
  });

  it('should have rep1 in seed data', () => {
    expect(service.reports.find((r) => r.id === 'rep1')).toBeTruthy();
  });

  it('should getMostRun rep3 has highest runCount (50)', () => {
    const top = service.getMostRun(1);
    expect(top[0].id).toBe('rep3');
  });
});
