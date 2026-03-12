import { TestBed } from '@angular/core/testing';
import { TimesheetComponent } from './timesheet.component';
import { provideRouter } from '@angular/router';
import { WorkforceService } from '../../services/workforce.service';

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

  it('should show .timesheet-row elements for seeded data', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.timesheet-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show .log-hours-btn button', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.log-hours-btn')).toBeTruthy();
  });

  it('should not show form panel initially', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-panel')).toBeFalsy();
  });

  it('should show form panel when showForm is set to true', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-panel')).toBeTruthy();
  });

  it('should show log hours form fields when form is open', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select[name="employeeId"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="timesheetDate"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="hoursWorked"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="project"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.save-hours-btn')).toBeTruthy();
  });

  it('should return all entries when no employee is selected', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    component.selectedEmployeeId = '';
    expect(component.filteredEntries().length).toBe(service.timesheetEntries.length);
  });

  it('should filter entries by selected employee', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedEmployeeId = 'e1';
    const filtered = component.filteredEntries();
    expect(filtered.every((e) => e.employeeId === 'e1')).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should return empty array when no entries for selected employee', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedEmployeeId = 'e4';
    expect(component.filteredEntries().length).toBe(0);
  });

  it('should calculate totalHours() for all entries', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedEmployeeId = '';
    expect(component.totalHours()).toBe(37.5);
  });

  it('should calculate totalHours() for filtered employee entries', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedEmployeeId = 'e1';
    expect(component.totalHours()).toBe(15.5);
  });

  it('should return 0 totalHours() when no entries match filter', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.selectedEmployeeId = 'e4';
    expect(component.totalHours()).toBe(0);
  });

  it('should return employee name from getEmployeeName()', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.getEmployeeName('e2')).toBe('Bob Martinez');
  });

  it('should return the id if employee not found in getEmployeeName()', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.getEmployeeName('unknown')).toBe('unknown');
  });

  it('should not save entry when required fields are missing', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    const before = service.timesheetEntries.length;
    component.saveEntry();
    expect(service.timesheetEntries.length).toBe(before);
  });

  it('should save entry and close form when all required fields are filled', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    component.showForm.set(true);
    component.newEntry = {
      employeeId: 'e1',
      date: '2026-03-11',
      hoursWorked: 8,
      project: 'Test Project',
      notes: '',
    };
    const before = service.timesheetEntries.length;
    component.saveEntry();
    expect(service.timesheetEntries.length).toBe(before + 1);
    expect(component.showForm()).toBe(false);
  });

  it('should hide form after cancel', () => {
    const fixture = TestBed.createComponent(TimesheetComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    const cancelBtn = fixture.nativeElement.querySelector('.cancel-btn');
    cancelBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-panel')).toBeFalsy();
  });
});
