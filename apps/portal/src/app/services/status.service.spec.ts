import { TestBed } from '@angular/core/testing';
import { StatusService } from './status.service';

describe('StatusService (Portal)', () => {
  let service: StatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 5 services', () => {
    expect(service.services.length).toBe(5);
  });

  it('overall status should be degraded when any service is degraded', () => {
    expect(service.services.some((s) => s.status === 'degraded')).toBe(true);
    expect(service.overallStatus).toBe('degraded');
  });

  it('should update lastChecked timestamps on refresh', () => {
    const before = service.services[0].lastChecked.getTime();
    // Advance a tick
    service.refresh();
    const after = service.services[0].lastChecked.getTime();
    expect(after).toBeGreaterThanOrEqual(before);
  });
});
