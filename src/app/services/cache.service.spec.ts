import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve a value', () => {
    service.set('key1', 'value1');
    expect(service.get<string>('key1')).toBe('value1');
  });

  it('should return undefined for missing key', () => {
    expect(service.get('nonexistent')).toBeUndefined();
  });

  it('should expire entries after TTL', async () => {
    service.set('temp', 'data', 50);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(service.get('temp')).toBeUndefined();
  });

  it('should report has() as true for valid entry', () => {
    service.set('k', 'v');
    expect(service.has('k')).toBe(true);
  });

  it('should report has() as false after expiry', async () => {
    service.set('k', 'v', 50);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(service.has('k')).toBe(false);
  });

  it('should delete an entry', () => {
    service.set('k', 'v');
    service.delete('k');
    expect(service.get('k')).toBeUndefined();
  });

  it('should clear all entries', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.clear();
    expect(service.size()).toBe(0);
  });

  it('should getOrSet with factory when key absent', () => {
    const val = service.getOrSet('key', () => 42);
    expect(val).toBe(42);
    expect(service.get<number>('key')).toBe(42);
  });

  it('should getOrSet return cached value without calling factory again', () => {
    service.set('key', 'original');
    const val = service.getOrSet('key', () => 'new-value');
    expect(val).toBe('original');
  });

  it('should evict expired entries', async () => {
    service.set('expired', 'val', 50);
    service.set('valid', 'val2', 300000);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const evicted = service.evictExpired();
    expect(evicted).toBe(1);
    expect(service.size()).toBe(1);
  });

  it('should track hit/miss stats', () => {
    service.set('k', 'v');
    service.get('k');
    service.get('missing');
    const stats = service.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it('should return keys', () => {
    service.set('a', 1);
    service.set('b', 2);
    expect(service.keys()).toContain('a');
    expect(service.keys()).toContain('b');
  });

  it('should report ttlRemaining greater than 0 for fresh entry', () => {
    service.set('k', 'v', 10000);
    expect(service.ttlRemaining('k')).toBeGreaterThan(0);
  });
});
