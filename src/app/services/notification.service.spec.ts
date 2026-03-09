import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show a notification', () => {
    service.show('Hello!', 'success', 60000);
    expect(service.current.length).toBe(1);
    expect(service.current[0].message).toBe('Hello!');
    expect(service.current[0].type).toBe('success');
  });

  it('should dismiss a notification by id', () => {
    service.show('Bye!', 'info', 60000);
    const id = service.current[0].id;
    service.dismiss(id);
    expect(service.current.length).toBe(0);
  });

  it('should auto-dismiss after duration', () => {
    service.show('Auto-dismiss', 'warning', 500);
    expect(service.current.length).toBe(1);
    vi.advanceTimersByTime(500);
    expect(service.current.length).toBe(0);
  });
});
