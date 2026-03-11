import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  Employee,
  Shift,
  ShiftStatus,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  TimesheetEntry,
} from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class WorkforceService {
  private readonly _employees$ = new BehaviorSubject<Employee[]>([
    { id: 'e1', name: 'Alice Johnson', department: 'Engineering', role: 'Software Engineer', email: 'alice@example.com' },
    { id: 'e2', name: 'Bob Martinez', department: 'Operations', role: 'Operations Manager', email: 'bob@example.com' },
    { id: 'e3', name: 'Carol White', department: 'HR', role: 'HR Specialist', email: 'carol@example.com' },
    { id: 'e4', name: 'David Lee', department: 'Finance', role: 'Financial Analyst', email: 'david@example.com' },
    { id: 'e5', name: 'Eva Brown', department: 'Engineering', role: 'QA Engineer', email: 'eva@example.com' },
  ]);

  private readonly _shifts$ = new BehaviorSubject<Shift[]>([
    { id: 's1', employeeId: 'e1', date: '2025-07-07', startTime: '09:00', endTime: '17:00', status: 'scheduled' },
    { id: 's2', employeeId: 'e2', date: '2025-07-07', startTime: '08:00', endTime: '16:00', status: 'confirmed' },
    { id: 's3', employeeId: 'e3', date: '2025-07-08', startTime: '10:00', endTime: '18:00', status: 'scheduled' },
    { id: 's4', employeeId: 'e4', date: '2025-07-08', startTime: '09:00', endTime: '17:00', status: 'completed' },
    { id: 's5', employeeId: 'e5', date: '2025-07-09', startTime: '07:00', endTime: '15:00', status: 'scheduled' },
    { id: 's6', employeeId: 'e1', date: '2025-07-09', startTime: '13:00', endTime: '21:00', status: 'confirmed' },
    { id: 's7', employeeId: 'e2', date: '2025-07-10', startTime: '09:00', endTime: '17:00', status: 'absent' },
    { id: 's8', employeeId: 'e3', date: '2025-07-10', startTime: '08:00', endTime: '16:00', status: 'scheduled' },
  ]);

  private readonly _leaveRequests$ = new BehaviorSubject<LeaveRequest[]>([
    {
      id: 'lr1', employeeId: 'e1', type: 'annual', startDate: '2025-07-21', endDate: '2025-07-25',
      days: 5, status: 'approved', reason: 'Summer vacation', submittedAt: new Date('2025-07-01'),
      reviewedAt: new Date('2025-07-02'), reviewedBy: 'Bob Martinez',
    },
    {
      id: 'lr2', employeeId: 'e2', type: 'sick', startDate: '2025-07-14', endDate: '2025-07-15',
      days: 2, status: 'pending', reason: 'Medical appointment', submittedAt: new Date('2025-07-10'),
    },
    {
      id: 'lr3', employeeId: 'e4', type: 'unpaid', startDate: '2025-08-01', endDate: '2025-08-03',
      days: 3, status: 'rejected', reason: 'Personal matters', submittedAt: new Date('2025-07-05'),
      reviewedAt: new Date('2025-07-06'), reviewedBy: 'Carol White',
    },
    {
      id: 'lr4', employeeId: 'e5', type: 'annual', startDate: '2025-07-28', endDate: '2025-07-28',
      days: 1, status: 'pending', reason: 'Family event', submittedAt: new Date('2025-07-09'),
    },
  ]);

  private readonly _timesheetEntries$ = new BehaviorSubject<TimesheetEntry[]>([
    { id: 't1', employeeId: 'e1', date: '2025-07-07', hoursWorked: 8, project: 'Alpha Platform' },
    { id: 't2', employeeId: 'e1', date: '2025-07-08', hoursWorked: 7.5, project: 'Alpha Platform', notes: 'Code review' },
    { id: 't3', employeeId: 'e2', date: '2025-07-07', hoursWorked: 8, project: 'Operations Dashboard' },
    { id: 't4', employeeId: 'e3', date: '2025-07-08', hoursWorked: 6, project: 'HR System Upgrade' },
    { id: 't5', employeeId: 'e5', date: '2025-07-09', hoursWorked: 8, project: 'QA Automation Suite' },
  ]);

  private nextId = 100;

  readonly employees$: Observable<Employee[]> = this._employees$.asObservable();
  readonly shifts$: Observable<Shift[]> = this._shifts$.asObservable();
  readonly leaveRequests$: Observable<LeaveRequest[]> = this._leaveRequests$.asObservable();
  readonly timesheetEntries$: Observable<TimesheetEntry[]> = this._timesheetEntries$.asObservable();
  readonly pendingLeave$: Observable<LeaveRequest[]> = this._leaveRequests$.pipe(
    map((requests) => requests.filter((r) => r.status === 'pending'))
  );

  get employees(): Employee[] {
    return this._employees$.getValue();
  }

  get shifts(): Shift[] {
    return this._shifts$.getValue();
  }

  get leaveRequests(): LeaveRequest[] {
    return this._leaveRequests$.getValue();
  }

  get timesheetEntries(): TimesheetEntry[] {
    return this._timesheetEntries$.getValue();
  }

  addShift(shift: Omit<Shift, 'id'>): Shift {
    const newShift: Shift = { ...shift, id: `s${++this.nextId}` };
    this._shifts$.next([...this._shifts$.getValue(), newShift]);
    return newShift;
  }

  updateShiftStatus(id: string, status: ShiftStatus): void {
    const shifts = this._shifts$.getValue().map((s) => (s.id === id ? { ...s, status } : s));
    this._shifts$.next(shifts);
  }

  submitLeave(req: Omit<LeaveRequest, 'id' | 'submittedAt'>): LeaveRequest {
    const newRequest: LeaveRequest = {
      ...req,
      id: `lr${++this.nextId}`,
      submittedAt: new Date(),
    };
    this._leaveRequests$.next([newRequest, ...this._leaveRequests$.getValue()]);
    return newRequest;
  }

  approveLeave(id: string, reviewedBy: string): void {
    const requests = this._leaveRequests$.getValue().map((r) =>
      r.id === id ? { ...r, status: 'approved' as LeaveStatus, reviewedAt: new Date(), reviewedBy } : r
    );
    this._leaveRequests$.next(requests);
  }

  rejectLeave(id: string, reviewedBy: string): void {
    const requests = this._leaveRequests$.getValue().map((r) =>
      r.id === id ? { ...r, status: 'rejected' as LeaveStatus, reviewedAt: new Date(), reviewedBy } : r
    );
    this._leaveRequests$.next(requests);
  }

  addTimesheetEntry(entry: Omit<TimesheetEntry, 'id'>): TimesheetEntry {
    const newEntry: TimesheetEntry = { ...entry, id: `t${++this.nextId}` };
    this._timesheetEntries$.next([...this._timesheetEntries$.getValue(), newEntry]);
    return newEntry;
  }

  getTotalHoursForEmployee(employeeId: string): number {
    return this._timesheetEntries$
      .getValue()
      .filter((e) => e.employeeId === employeeId)
      .reduce((sum, e) => sum + e.hoursWorked, 0);
  }
}
