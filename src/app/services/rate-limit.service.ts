import { Injectable } from '@angular/core';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitState {
  key: string;
  requests: number;
  windowStart: number;
  config: RateLimitConfig;
}

const DEFAULT_CONFIG: RateLimitConfig = { maxRequests: 100, windowMs: 60_000 };

@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private states = new Map<string, RateLimitState>();
  private configs = new Map<string, RateLimitConfig>();

  configure(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
  }

  isAllowed(key: string): boolean {
    const state = this.getOrCreate(key);
    const now = Date.now();
    const config = this.configs.get(key) ?? DEFAULT_CONFIG;

    if (now - state.windowStart >= config.windowMs) {
      state.requests = 0;
      state.windowStart = now;
    }

    if (state.requests >= config.maxRequests) return false;
    state.requests++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const state = this.getOrCreate(key);
    const now = Date.now();
    const config = this.configs.get(key) ?? DEFAULT_CONFIG;

    if (now - state.windowStart >= config.windowMs) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - state.requests);
  }

  getWindowResetTime(key: string): number {
    const state = this.getOrCreate(key);
    const config = this.configs.get(key) ?? DEFAULT_CONFIG;
    return state.windowStart + config.windowMs;
  }

  reset(key: string): void {
    const config = this.configs.get(key) ?? DEFAULT_CONFIG;
    this.states.set(key, { key, requests: 0, windowStart: Date.now(), config });
  }

  resetAll(): void {
    this.states.clear();
  }

  getState(key: string): RateLimitState {
    return { ...this.getOrCreate(key) };
  }

  isThrottled(key: string): boolean {
    const state = this.getOrCreate(key);
    const now = Date.now();
    const config = this.configs.get(key) ?? DEFAULT_CONFIG;
    if (now - state.windowStart >= config.windowMs) {
      return false;
    }
    return state.requests >= config.maxRequests;
  }

  private getOrCreate(key: string): RateLimitState {
    if (!this.states.has(key)) {
      const config = this.configs.get(key) ?? DEFAULT_CONFIG;
      this.states.set(key, { key, requests: 0, windowStart: Date.now(), config });
    }
    return this.states.get(key)!;
  }
}
