import { Injectable } from '@angular/core';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();
  private stats: CacheStats = { size: 0, hits: 0, misses: 0, evictions: 0 };

  set<T>(key: string, value: T, ttlMs = 300_000): void {
    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + ttlMs,
      createdAt: now,
      hits: 0,
    });
    this.stats.size = this.store.size;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.stats.size = this.store.size;
      return undefined;
    }
    entry.hits++;
    this.stats.hits++;
    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.evictions++;
      this.stats.size = this.store.size;
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) this.stats.size = this.store.size;
    return deleted;
  }

  clear(): void {
    this.store.clear();
    this.stats.size = 0;
  }

  getOrSet<T>(key: string, factory: () => T, ttlMs = 300_000): T {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = factory();
    this.set(key, value, ttlMs);
    return value;
  }

  evictExpired(): number {
    const now = Date.now();
    let evicted = 0;
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        evicted++;
        this.stats.evictions++;
      }
    }
    this.stats.size = this.store.size;
    return evicted;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  size(): number {
    return this.store.size;
  }

  ttlRemaining(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.expiresAt - Date.now());
  }
}
