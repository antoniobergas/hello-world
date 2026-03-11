import { TestBed } from '@angular/core/testing';
import { WorkforceService } from './workforce.service';

describe('WorkforceService', () => {
  let service: WorkforceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkforceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed with 5 employees', () => {
    expect(service.employees.length).toBe(5);
  });

  it('should addShift and return a shift with an id', () => {
    const before = service.shifts.length;
    const shift = service.addShift({
      employeeId: 'e1',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
    });
    expect(shift.id).toBeTruthy();
    expect(service.shifts.length).toBe(before + 1);
  });

  it('should submitLeave creating a pending request', () => {
    const before = service.leaveRequests.length;
    const req = service.submitLeave({
      employeeId: 'e1',
      type: 'annual',
      startDate: '2025-08-01',
      endDate: '2025-08-05',
      days: 5,
      status: 'pending',
      reason: 'Holiday',
    });
    expect(req.status).toBe('pending');
    expect(service.leaveRequests.length).toBe(before + 1);
  });

  it('should approveLeave and change status to approved', () => {
    service.submitLeave({
      employeeId: 'e2',
      type: 'sick',
      startDate: '2025-08-10',
      endDate: '2025-08-10',
      days: 1,
      status: 'pending',
      reason: 'Unwell',
    });
    const pending = service.leaveRequests.find(
      (r) => r.status === 'pending' && r.employeeId === 'e2',
    );
    service.approveLeave(pending!.id, 'Manager A');
    const approved = service.leaveRequests.find((r) => r.id === pending!.id);
    expect(approved!.status).toBe('approved');
    expect(approved!.reviewedBy).toBe('Manager A');
  });

  it('should rejectLeave and change status to rejected', () => {
    service.submitLeave({
      employeeId: 'e3',
      type: 'unpaid',
      startDate: '2025-09-01',
      endDate: '2025-09-02',
      days: 2,
      status: 'pending',
      reason: 'Personal',
    });
    const pending = service.leaveRequests.find(
      (r) => r.status === 'pending' && r.employeeId === 'e3',
    );
    service.rejectLeave(pending!.id, 'Manager B');
    const rejected = service.leaveRequests.find((r) => r.id === pending!.id);
    expect(rejected!.status).toBe('rejected');
    expect(rejected!.reviewedBy).toBe('Manager B');
  });

  it('should getTotalHoursForEmployee returning the correct sum', () => {
    const total = service.getTotalHoursForEmployee('e1');
    expect(total).toBe(15.5);
  });

  it('should addTimesheetEntry and add the entry', () => {
    const before = service.timesheetEntries.length;
    const entry = service.addTimesheetEntry({
      employeeId: 'e1',
      date: '2025-07-11',
      hoursWorked: 8,
      project: 'New Project',
    });
    expect(entry.id).toBeTruthy();
    expect(service.timesheetEntries.length).toBe(before + 1);
  });
});
