import { TestBed } from '@angular/core/testing';
import { TimesheetComponent } from './timesheet.component';
import { provideRouter } from '@angular/router';

describe('TimesheetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "Timesheets"', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Timesheets');
  });

  it('should show employee selector', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('.employee-select');
    expect(select).toBeTruthy();
  });

  it('should show .timesheet-summary', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('.timesheet-summary');
    expect(summary).toBeTruthy();
  });
});
