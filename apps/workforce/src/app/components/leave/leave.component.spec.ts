import { TestBed } from '@angular/core/testing';
import { LeaveComponent } from './leave.component';
import { provideRouter } from '@angular/router';
import { WorkforceService } from '../../services/workforce.service';

describe('LeaveComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "Leave Requests"', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Leave Requests');
  });

  it('should show .leave-row elements for seeded data', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.leave-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show leave filter buttons', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const btns = fixture.nativeElement.querySelectorAll('.leave-filter-btn');
    expect(btns.length).toBeGreaterThanOrEqual(4);
  });

  it('should show 4 filter buttons: All, Pending, Approved, Rejected', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    const btns = fixture.nativeElement.querySelectorAll('.leave-filter-btn');
    const texts = Array.from(btns).map((b: any) => b.textContent.trim().toLowerCase());
    expect(texts).toContain('all');
    expect(texts).toContain('pending');
    expect(texts).toContain('approved');
    expect(texts).toContain('rejected');
  });

  it('should have activeFilter as "all" by default', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeFilter()).toBe('all');
  });

  it('should filter to only pending requests when activeFilter is "pending"', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.activeFilter.set('pending');
    const filtered = component.filteredRequests();
    expect(filtered.every((r) => r.status === 'pending')).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should filter to only approved requests when activeFilter is "approved"', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.activeFilter.set('approved');
    const filtered = component.filteredRequests();
    expect(filtered.every((r) => r.status === 'approved')).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should filter to only rejected requests when activeFilter is "rejected"', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.activeFilter.set('rejected');
    const filtered = component.filteredRequests();
    expect(filtered.every((r) => r.status === 'rejected')).toBe(true);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should return all requests when activeFilter is "all"', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    expect(component.filteredRequests().length).toBe(service.leaveRequests.length);
  });

  it('should not show form panel initially', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-panel')).toBeFalsy();
  });

  it('should show form panel when showForm is set to true', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-panel')).toBeTruthy();
  });

  it('should show form fields when form is open', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.showForm.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select[name="leaveType"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="startDate"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="endDate"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.submit-leave-btn')).toBeTruthy();
  });

  it('should show .new-leave-btn button', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.new-leave-btn')).toBeTruthy();
  });

  it('should return employee name from getEmployeeName()', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.getEmployeeName('e1')).toBe('Alice Johnson');
  });

  it('should return the id if employee not found in getEmployeeName()', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.getEmployeeName('unknown')).toBe('unknown');
  });

  it('should not submit request when required fields are missing', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    const before = service.leaveRequests.length;
    component.submitRequest();
    expect(service.leaveRequests.length).toBe(before);
  });

  it('should submit leave request and close form when all fields are filled', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    component.showForm.set(true);
    component.newRequest = {
      employeeId: 'e1',
      type: 'annual',
      startDate: '2026-04-01',
      endDate: '2026-04-05',
      reason: 'Spring vacation',
    };
    const before = service.leaveRequests.length;
    component.submitRequest();
    expect(service.leaveRequests.length).toBe(before + 1);
    expect(component.showForm()).toBe(false);
  });

  it('should approve a leave request', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    const pending = service.leaveRequests.find((r) => r.status === 'pending');
    component.approve(pending!.id);
    const updated = service.leaveRequests.find((r) => r.id === pending!.id);
    expect(updated?.status).toBe('approved');
  });

  it('should reject a leave request', () => {
    const fixture = TestBed.createComponent(LeaveComponent);
    const component = fixture.componentInstance;
    const service = TestBed.inject(WorkforceService);
    fixture.detectChanges();
    const pending = service.leaveRequests.find((r) => r.status === 'pending');
    component.reject(pending!.id);
    const updated = service.leaveRequests.find((r) => r.id === pending!.id);
    expect(updated?.status).toBe('rejected');
  });
});
