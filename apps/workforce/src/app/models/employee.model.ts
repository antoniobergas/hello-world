export type ShiftStatus = 'scheduled' | 'confirmed' | 'absent' | 'completed';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  date: string;
  hoursWorked: number;
  project: string;
  notes?: string;
}
