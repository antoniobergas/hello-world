import { TestBed } from '@angular/core/testing';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RateLimitService);
    service.resetAll();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow requests within limit', () => {
    service.configure('test', { maxRequests: 3, windowMs: 60000 });
    expect(service.isAllowed('test')).toBe(true);
    expect(service.isAllowed('test')).toBe(true);
    expect(service.isAllowed('test')).toBe(true);
  });

  it('should block requests when limit exceeded', () => {
    service.configure('test', { maxRequests: 2, windowMs: 60000 });
    service.isAllowed('test');
    service.isAllowed('test');
    expect(service.isAllowed('test')).toBe(false);
  });

  it('should count remaining requests', () => {
    service.configure('test', { maxRequests: 5, windowMs: 60000 });
    service.isAllowed('test');
    service.isAllowed('test');
    expect(service.getRemainingRequests('test')).toBe(3);
  });

  it('should reset a key', () => {
    service.configure('test', { maxRequests: 1, windowMs: 60000 });
    service.isAllowed('test');
    expect(service.getRemainingRequests('test')).toBe(0);
    service.reset('test');
    expect(service.getRemainingRequests('test')).toBe(1);
  });

  it('should reset all keys', () => {
    service.configure('a', { maxRequests: 1, windowMs: 60000 });
    service.configure('b', { maxRequests: 1, windowMs: 60000 });
    service.isAllowed('a');
    service.isAllowed('b');
    service.resetAll();
    expect(service.getRemainingRequests('a')).toBeGreaterThan(0);
  });

  it('should track state per key independently', () => {
    service.configure('api-a', { maxRequests: 1, windowMs: 60000 });
    service.configure('api-b', { maxRequests: 5, windowMs: 60000 });
    service.isAllowed('api-a');
    expect(service.isAllowed('api-a')).toBe(false);
    expect(service.isAllowed('api-b')).toBe(true);
  });

  it('should use default config for unconfigured keys', () => {
    const remaining = service.getRemainingRequests('unknown-key');
    expect(remaining).toBeGreaterThan(0);
  });

  it('should return state snapshot via getState', () => {
    service.configure('test', { maxRequests: 10, windowMs: 60000 });
    service.isAllowed('test');
    const state = service.getState('test');
    expect(state.requests).toBe(1);
    expect(state.key).toBe('test');
  });
});
