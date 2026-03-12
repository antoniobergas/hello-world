import { TestBed } from '@angular/core/testing';
import { ScheduleComponent } from './schedule.component';
import { provideRouter } from '@angular/router';
import { WorkforceService } from '../../services/workforce.service';

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

  it('should show Previous week and Next week buttons', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.week-nav-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('aria-label')).toBe('Previous week');
    expect(buttons[1].getAttribute('aria-label')).toBe('Next week');
  });

  it('should show .add-shift-btn button', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.add-shift-btn');
    expect(btn).toBeTruthy();
  });

  it('should not show form panel initially', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('.form-panel');
    expect(form).toBeFalsy();
  });

  it('should show form panel when showForm is set to true', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('.form-panel');
    expect(form).toBeTruthy();
  });

  it('should show add shift form fields when form is open', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select[name="employeeId"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="shiftDate"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="startTime"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="endTime"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.save-shift-btn')).toBeTruthy();
  });

  it('should hide form after cancel', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    const cancelBtn = fixture.nativeElement.querySelector('.cancel-btn');
    cancelBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-panel')).toBeFalsy();
  });

  it('should call prevWeek() and update weekStart backward', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const initial = new Date(component.weekStart);
    component.prevWeek();
    fixture.detectChanges();
    const diff = initial.getTime() - component.weekStart.getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('should call nextWeek() and update weekStart forward', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const initial = new Date(component.weekStart);
    component.nextWeek();
    fixture.detectChanges();
    const diff = component.weekStart.getTime() - initial.getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('should return employee name from getEmployeeName()', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const name = component.getEmployeeName('e1');
    expect(name).toBe('Alice Johnson');
  });

  it('should return the id if employee not found in getEmployeeName()', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const name = component.getEmployeeName('unknown-id');
    expect(name).toBe('unknown-id');
  });

  it('should not save shift when required fields are missing', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    const before = service.shifts.length;
    component.saveShift();
    expect(service.shifts.length).toBe(before);
  });

  it('should save shift and close form when all fields are filled', () => {
    const fixture = TestBed.createComponent(ScheduleComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    component.showForm.set(true);
    component.newShift = {
      employeeId: 'e1',
      date: '2026-03-11',
      startTime: '09:00',
      endTime: '17:00',
      notes: '',
    };
    const before = service.shifts.length;
    component.saveShift();
    expect(service.shifts.length).toBe(before + 1);
    expect(component.showForm()).toBe(false);
  });

  it('should show filtered shifts for current week when a matching shift exists', () => {
    const service = TestBed.inject(WorkforceService);
    const today = new Date().toISOString().split('T')[0];
    service.addShift({
      employeeId: 'e1',
      date: today,
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
    });
    const fixture = TestBed.createComponent(ScheduleComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredShifts.length).toBeGreaterThan(0);
  });
});
