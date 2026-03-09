import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the fallback when key does not exist', () => {
    expect(service.get('missing', 'default')).toBe('default');
  });

  it('should store and retrieve a string value', () => {
    service.set('key1', 'hello');
    expect(service.get('key1', '')).toBe('hello');
  });

  it('should store and retrieve a number value', () => {
    service.set('num', 42);
    expect(service.get('num', 0)).toBe(42);
  });

  it('should store and retrieve an object', () => {
    const obj = { a: 1, b: 'two' };
    service.set('obj', obj);
    expect(service.get('obj', {})).toEqual(obj);
  });

  it('should store and retrieve an array', () => {
    service.set('arr', [1, 2, 3]);
    expect(service.get('arr', [])).toEqual([1, 2, 3]);
  });

  it('should remove a key', () => {
    service.set('toRemove', 'value');
    service.remove('toRemove');
    expect(service.get('toRemove', 'fallback')).toBe('fallback');
  });

  it('should overwrite an existing key', () => {
    service.set('x', 1);
    service.set('x', 2);
    expect(service.get('x', 0)).toBe(2);
  });

  it('should clear all keys', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.clear();
    expect(service.get('a', null)).toBeNull();
    expect(service.get('b', null)).toBeNull();
  });
});
