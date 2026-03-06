import { TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';
import { CounterService } from '../../services/counter.service';

describe('CounterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(CounterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display initial count of 0', async () => {
    const fixture = TestBed.createComponent(CounterComponent);
    await fixture.whenStable();
    const countEl = fixture.nativeElement.querySelector('.count');
    expect(countEl.textContent.trim()).toBe('0');
  });

  it('should increment count when + button is clicked', async () => {
    const fixture = TestBed.createComponent(CounterComponent);
    await fixture.whenStable();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const incrementBtn = buttons.find((b) => b.textContent?.trim() === '+')!;
    incrementBtn.click();
    await fixture.whenStable();
    const countEl = fixture.nativeElement.querySelector('.count');
    expect(countEl.textContent.trim()).toBe('1');
  });

  it('should reset count when Reset button is clicked', async () => {
    const fixture = TestBed.createComponent(CounterComponent);
    const service = TestBed.inject(CounterService);
    service.increment();
    service.increment();
    await fixture.whenStable();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    const resetBtn = buttons.find((b) => b.textContent?.trim() === 'Reset')!;
    resetBtn.click();
    await fixture.whenStable();
    expect(service.current).toBe(0);
  });
});
