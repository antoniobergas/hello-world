import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { SavedSearchService } from './saved-search.service';

describe('SavedSearchService', () => {
  let service: SavedSearchService;

  beforeEach(() => {
    service = new SavedSearchService();
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should have 10 seed searches', () => {
    expect(service.searches.length).toBe(10);
  });

  it('should expose searches$ observable', async () => {
    const searches = await firstValueFrom(service.searches$);
    expect(searches.length).toBe(10);
  });

  it('should save a new search with UUID and defaults', () => {
    const s = service.save({
      name: 'Test',
      userId: 'u1',
      entity: 'tickets',
      filters: {},
      sortBy: 'id',
      sortDir: 'asc',
    });
    expect(s.id).toBeTruthy();
    expect(typeof s.id).toBe('string');
    expect(s.useCount).toBe(0);
    expect(s.createdAt).toBeInstanceOf(Date);
  });

  it('should add saved search to list', () => {
    service.save({
      name: 'New',
      userId: 'u1',
      entity: 'items',
      filters: {},
      sortBy: 'id',
      sortDir: 'asc',
    });
    expect(service.searches.length).toBe(11);
  });

  it('should delete a search', () => {
    service.delete('ss1');
    expect(service.searches.find((s) => s.id === 'ss1')).toBeUndefined();
    expect(service.searches.length).toBe(9);
  });

  it('should delete unknown id does nothing', () => {
    service.delete('unknown');
    expect(service.searches.length).toBe(10);
  });

  it('should execute increments useCount', () => {
    service.execute('ss1');
    expect(service.searches.find((s) => s.id === 'ss1')?.useCount).toBe(26);
  });

  it('should execute sets lastUsedAt', () => {
    service.execute('ss2');
    expect(service.searches.find((s) => s.id === 'ss2')?.lastUsedAt).toBeInstanceOf(Date);
  });

  it('should execute returns undefined for unknown id', () => {
    expect(service.execute('unknown')).toBeUndefined();
  });

  it('should getByUser u1', () => {
    const u1 = service.getByUser('u1');
    expect(u1.every((s) => s.userId === 'u1')).toBe(true);
    expect(u1.length).toBeGreaterThan(0);
  });

  it('should getByUser returns empty for unknown', () => {
    expect(service.getByUser('unknown')).toEqual([]);
  });

  it('should getByEntity tickets', () => {
    const tickets = service.getByEntity('tickets');
    expect(tickets.every((s) => s.entity === 'tickets')).toBe(true);
    expect(tickets.length).toBeGreaterThan(0);
  });

  it('should getMostUsed returns top 5 by default', () => {
    const top = service.getMostUsed();
    expect(top.length).toBe(5);
    expect(top[0].useCount).toBeGreaterThanOrEqual(top[1].useCount);
  });

  it('should getMostUsed respects limit', () => {
    const top3 = service.getMostUsed(3);
    expect(top3.length).toBe(3);
  });

  it('should rename a search', () => {
    service.rename('ss1', 'Renamed');
    expect(service.searches.find((s) => s.id === 'ss1')?.name).toBe('Renamed');
  });

  it('should rename does not affect other fields', () => {
    service.rename('ss1', 'X');
    expect(service.searches.find((s) => s.id === 'ss1')?.useCount).toBe(25);
  });

  it('should updateFilters', () => {
    service.updateFilters('ss2', { status: 'active' });
    expect(service.searches.find((s) => s.id === 'ss2')?.filters).toEqual({ status: 'active' });
  });

  it('should update observable after save', async () => {
    service.save({
      name: 'X',
      userId: 'u1',
      entity: 'invoices',
      filters: {},
      sortBy: 'id',
      sortDir: 'desc',
    });
    const searches = await firstValueFrom(service.searches$);
    expect(searches.length).toBe(11);
  });

  it('should have ss1 in seed data', () => {
    expect(service.searches.find((s) => s.id === 'ss1')).toBeTruthy();
  });

  it('should getMostUsed ss1 first (useCount 25)', () => {
    const top = service.getMostUsed(1);
    expect(top[0].id).toBe('ss1');
  });
});
