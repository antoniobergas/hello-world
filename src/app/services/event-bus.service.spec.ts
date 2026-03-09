import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
    service.clearHistory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit and receive events', async () => {
    const result = firstValueFrom(service.on<string>('test-event'));
    service.emit('test-event', 'hello');
    expect(await result).toBe('hello');
  });

  it('should not receive events of a different type', async () => {
    let received = false;
    service.on<string>('event-a').pipe(take(1)).subscribe(() => { received = true; });
    service.emit('event-b', 'data');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(received).toBe(false);
  });

  it('should store event history', () => {
    service.emit('action', { id: 1 });
    service.emit('action', { id: 2 });
    expect(service.getHistory().length).toBe(2);
  });

  it('should filter history by type', () => {
    service.emit('click', 'btn1');
    service.emit('submit', 'form1');
    service.emit('click', 'btn2');
    const clicks = service.getHistoryByType('click');
    expect(clicks.length).toBe(2);
  });

  it('should clear history', () => {
    service.emit('evt', 'data');
    service.clearHistory();
    expect(service.getHistory().length).toBe(0);
  });

  it('should get distinct event types', () => {
    service.emit('type-a', 'x');
    service.emit('type-b', 'y');
    service.emit('type-a', 'z');
    const types = service.getEventTypes();
    expect(types).toContain('type-a');
    expect(types).toContain('type-b');
    expect(types.length).toBe(2);
  });

  it('should receive events on onAny()', async () => {
    const result = firstValueFrom(service.onAny());
    service.emit('any-test', 'payload');
    const event = await result;
    expect(event.type).toBe('any-test');
  });

  it('should filter events by source via onSource()', async () => {
    const result = firstValueFrom(service.onSource('service-a'));
    service.emit('event', 'data', 'service-a');
    const event = await result;
    expect(event.source).toBe('service-a');
  });

  it('should include timestamp in emitted events', () => {
    const before = new Date();
    service.emit('ts-test', {});
    const history = service.getHistory();
    expect(history[0].timestamp).toBeInstanceOf(Date);
    expect(history[0].timestamp >= before).toBe(true);
  });
});
