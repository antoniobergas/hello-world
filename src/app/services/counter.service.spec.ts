import { TestBed } from '@angular/core/testing';
import { CounterService } from './counter.service';

describe('CounterService', () => {
  let service: CounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should increment count', () => {
    service.increment();
    expect(service.current).toBe(1);
  });

  it('should decrement count', () => {
    service.increment();
    service.decrement();
    expect(service.current).toBe(0);
  });

  it('should reset count to zero', () => {
    service.increment();
    service.increment();
    service.reset();
    expect(service.current).toBe(0);
  });
});
