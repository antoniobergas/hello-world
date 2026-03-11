import { TestBed } from '@angular/core/testing';
import { WorkforceService } from './workforce.service';
import { firstValueFrom } from 'rxjs';

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

  it('should seed with 8 shifts', () => {
    expect(service.shifts.length).toBe(8);
  });

  it('should seed with 4 leave requests', () => {
    expect(service.leaveRequests.length).toBe(4);
  });

  it('should seed with 5 timesheet entries', () => {
    expect(service.timesheetEntries.length).toBe(5);
  });

  it('should expose employees$ observable', async () => {
    const employees = await firstValueFrom(service.employees$);
    expect(employees.length).toBe(5);
  });

  it('should expose shifts$ observable', async () => {
    const shifts = await firstValueFrom(service.shifts$);
    expect(shifts.length).toBe(8);
  });

  it('should expose leaveRequests$ observable', async () => {
    const requests = await firstValueFrom(service.leaveRequests$);
    expect(requests.length).toBe(4);
  });

  it('should expose timesheetEntries$ observable', async () => {
    const entries = await firstValueFrom(service.timesheetEntries$);
    expect(entries.length).toBe(5);
  });

  it('should expose pendingLeave$ with only pending requests', async () => {
    const pending = await firstValueFrom(service.pendingLeave$);
    expect(pending.every((r) => r.status === 'pending')).toBe(true);
    expect(pending.length).toBe(2);
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

  it('should addShift with optional notes', () => {
    const shift = service.addShift({
      employeeId: 'e2',
      date: '2025-07-16',
      startTime: '08:00',
      endTime: '16:00',
      status: 'confirmed',
      notes: 'Night shift',
    });
    expect(shift.notes).toBe('Night shift');
  });

  it('should updateShiftStatus and change the status', () => {
    const shift = service.addShift({
      employeeId: 'e1',
      date: '2025-07-20',
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
    });
    service.updateShiftStatus(shift.id, 'confirmed');
    const updated = service.shifts.find((s) => s.id === shift.id);
    expect(updated?.status).toBe('confirmed');
  });

  it('should updateShiftStatus to absent', () => {
    const shift = service.addShift({
      employeeId: 'e2',
      date: '2025-07-21',
      startTime: '08:00',
      endTime: '16:00',
      status: 'scheduled',
    });
    service.updateShiftStatus(shift.id, 'absent');
    const updated = service.shifts.find((s) => s.id === shift.id);
    expect(updated?.status).toBe('absent');
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

  it('should submitLeave and set submittedAt to current time', () => {
    const before = Date.now();
    const req = service.submitLeave({
      employeeId: 'e1',
      type: 'sick',
      startDate: '2025-08-10',
      endDate: '2025-08-10',
      days: 1,
      status: 'pending',
      reason: 'Ill',
    });
    expect(req.submittedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('should submitLeave and prepend it to the list', () => {
    const req = service.submitLeave({
      employeeId: 'e3',
      type: 'unpaid',
      startDate: '2025-09-01',
      endDate: '2025-09-01',
      days: 1,
      status: 'pending',
      reason: 'Personal',
    });
    expect(service.leaveRequests[0].id).toBe(req.id);
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

  it('should approveLeave and set reviewedAt', () => {
    const req = service.submitLeave({
      employeeId: 'e4',
      type: 'annual',
      startDate: '2025-10-01',
      endDate: '2025-10-03',
      days: 3,
      status: 'pending',
      reason: 'Vacation',
    });
    const before = Date.now();
    service.approveLeave(req.id, 'Admin');
    const updated = service.leaveRequests.find((r) => r.id === req.id);
    expect(updated?.reviewedAt?.getTime()).toBeGreaterThanOrEqual(before);
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

  it('should rejectLeave and set reviewedAt', () => {
    const req = service.submitLeave({
      employeeId: 'e5',
      type: 'sick',
      startDate: '2025-11-01',
      endDate: '2025-11-01',
      days: 1,
      status: 'pending',
      reason: 'Sick day',
    });
    const before = Date.now();
    service.rejectLeave(req.id, 'Admin');
    const updated = service.leaveRequests.find((r) => r.id === req.id);
    expect(updated?.reviewedAt?.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('should getTotalHoursForEmployee returning the correct sum', () => {
    const total = service.getTotalHoursForEmployee('e1');
    expect(total).toBe(15.5);
  });

  it('should getTotalHoursForEmployee returning 0 for employee with no entries', () => {
    const total = service.getTotalHoursForEmployee('e4');
    expect(total).toBe(0);
  });

  it('should getTotalHoursForEmployee returning 0 for non-existent employee', () => {
    const total = service.getTotalHoursForEmployee('non-existent');
    expect(total).toBe(0);
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

  it('should addTimesheetEntry with optional notes', () => {
    const entry = service.addTimesheetEntry({
      employeeId: 'e2',
      date: '2025-07-12',
      hoursWorked: 6,
      project: 'Side Project',
      notes: 'Pair programming',
    });
    expect(entry.notes).toBe('Pair programming');
  });

  it('should addTimesheetEntry and update total hours for employee', () => {
    const before = service.getTotalHoursForEmployee('e1');
    service.addTimesheetEntry({
      employeeId: 'e1',
      date: '2025-07-11',
      hoursWorked: 4,
      project: 'Extra Work',
    });
    const after = service.getTotalHoursForEmployee('e1');
    expect(after).toBe(before + 4);
  });

  it('should generate unique IDs for added shifts', () => {
    const shift1 = service.addShift({
      employeeId: 'e1',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
    });
    const shift2 = service.addShift({
      employeeId: 'e2',
      date: '2025-07-16',
      startTime: '08:00',
      endTime: '16:00',
      status: 'confirmed',
    });
    expect(shift1.id).not.toBe(shift2.id);
  });

  it('should generate unique IDs for submitted leave requests', () => {
    const req1 = service.submitLeave({
      employeeId: 'e1',
      type: 'annual',
      startDate: '2025-12-01',
      endDate: '2025-12-05',
      days: 5,
      status: 'pending',
      reason: 'Holiday 1',
    });
    const req2 = service.submitLeave({
      employeeId: 'e2',
      type: 'sick',
      startDate: '2025-12-10',
      endDate: '2025-12-10',
      days: 1,
      status: 'pending',
      reason: 'Sick',
    });
    expect(req1.id).not.toBe(req2.id);
  });
});
