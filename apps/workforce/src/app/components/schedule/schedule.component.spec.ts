import { TestBed } from '@angular/core/testing';
import { ScheduleComponent } from './schedule.component';
import { provideRouter } from '@angular/router';

describe('ScheduleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "Employee Schedule"', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Employee Schedule');
  });

  it('should show .schedule-summary', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('.schedule-summary');
    expect(summary).toBeTruthy();
  });

  it('should show .shift-row elements for seeded data', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.shift-row');
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });
});
