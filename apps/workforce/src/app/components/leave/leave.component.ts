import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkforceService } from '../../services/workforce.service';
import { Employee, LeaveRequest, LeaveStatus, LeaveType } from '../../models/employee.model';

type FilterOption = 'all' | LeaveStatus;

@Component({
  selector: 'app-leave',
  imports: [NgClass, UpperCasePipe, FormsModule],
  template: `
    <h1>Leave Requests</h1>

    <div class="filter-bar">
      @for (f of filters; track f) {
        <button
          class="leave-filter-btn"
          [ngClass]="{ active: activeFilter() === f }"
          (click)="activeFilter.set(f)">
          {{ f | uppercase }}
        </button>
      }
    </div>

    @if (showForm()) {
      <div class="form-panel">
        <h2>New Leave Request</h2>
        <form (ngSubmit)="submitRequest()">
          <select name="employeeId" [(ngModel)]="newRequest.employeeId" required>
            <option value="" disabled>Select employee</option>
            @for (emp of employees; track emp.id) {
              <option [value]="emp.id">{{ emp.name }}</option>
            }
          </select>
          <select name="leaveType" [(ngModel)]="newRequest.type" required>
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="unpaid">Unpaid</option>
            <option value="maternity">Maternity</option>
            <option value="paternity">Paternity</option>
          </select>
          <input name="startDate" type="date" [(ngModel)]="newRequest.startDate" required />
          <input name="endDate" type="date" [(ngModel)]="newRequest.endDate" required />
          <input name="reason" placeholder="Reason" [(ngModel)]="newRequest.reason" required />
          <div class="form-actions">
            <button type="submit" class="submit-leave-btn">Submit Request</button>
            <button type="button" class="cancel-btn" (click)="showForm.set(false)">Cancel</button>
          </div>
        </form>
      </div>
    }

    <div class="leave-list">
      @for (req of filteredRequests(); track req.id) {
        <div class="leave-row">
          <span class="leave-status" [ngClass]="'status-' + req.status">{{ req.status }}</span>
          <span class="employee-name">{{ getEmployeeName(req.employeeId) }}</span>
          <span class="leave-type">{{ req.type }}</span>
          <span class="leave-dates">{{ req.startDate }} → {{ req.endDate }}</span>
          <span class="leave-days">{{ req.days }} day(s)</span>
          <span class="leave-reason">{{ req.reason }}</span>
          @if (req.status === 'pending') {
            <div class="manager-actions">
              <button class="approve-btn" (click)="approve(req.id)">Approve</button>
              <button class="reject-btn" (click)="reject(req.id)">Reject</button>
            </div>
          }
        </div>
      }
      @if (filteredRequests().length === 0) {
        <p class="empty-state">No leave requests match the current filter.</p>
      }
    </div>

    <button class="new-leave-btn" (click)="showForm.set(true)">+ Request Leave</button>
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      .filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .leave-filter-btn {
        padding: 0.4rem 0.9rem; border: 1px solid #d1d5db; border-radius: 20px;
        background: #f9fafb; font-size: 0.85rem; cursor: pointer;
      }
      .leave-filter-btn.active { background: #064e3b; color: #fff; border-color: #064e3b; }
      .leave-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
      .leave-row {
        display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
      }
      .leave-status { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
      .status-pending { background: #fef3c7; color: #d97706; }
      .status-approved { background: #dcfce7; color: #15803d; }
      .status-rejected { background: #fee2e2; color: #dc2626; }
      .employee-name { font-weight: 600; min-width: 130px; }
      .leave-type { color: #6b7280; text-transform: capitalize; }
      .leave-dates { color: #374151; }
      .leave-days { color: #6b7280; font-size: 0.85rem; }
      .leave-reason { color: #6b7280; font-size: 0.85rem; flex: 1; }
      .manager-actions { display: flex; gap: 0.5rem; margin-left: auto; }
      .approve-btn { padding: 0.3rem 0.8rem; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 4px; }
      .reject-btn { padding: 0.3rem 0.8rem; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; }
      .new-leave-btn { padding: 0.6rem 1.2rem; background: #064e3b; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; }
      .form-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
      .form-panel h2 { margin-top: 0; }
      .form-panel form { display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px; }
      .form-panel select, .form-panel input {
        padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem;
      }
      .form-actions { display: flex; gap: 0.75rem; }
      .submit-leave-btn { padding: 0.5rem 1rem; background: #064e3b; color: #fff; border: none; border-radius: 4px; }
      .cancel-btn { padding: 0.5rem 1rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; }
      .empty-state { color: #9ca3af; font-style: italic; }
    `,
  ],
})
export class LeaveComponent implements OnInit {
  private readonly workforceService = inject(WorkforceService);

  showForm = signal(false);
  activeFilter = signal<FilterOption>('all');
  filters: FilterOption[] = ['all', 'pending', 'approved', 'rejected'];

  employees: Employee[] = [];
  private allRequests: LeaveRequest[] = [];

  newRequest = {
    employeeId: '',
    type: 'annual' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  };

  ngOnInit(): void {
    this.workforceService.employees$.subscribe((emps) => (this.employees = emps));
    this.workforceService.leaveRequests$.subscribe((reqs) => (this.allRequests = reqs));
  }

  filteredRequests(): LeaveRequest[] {
    const filter = this.activeFilter();
    if (filter === 'all') return this.allRequests;
    return this.allRequests.filter((r) => r.status === filter);
  }

  getEmployeeName(employeeId: string): string {
    return this.employees.find((e) => e.id === employeeId)?.name ?? employeeId;
  }

  approve(id: string): void {
    this.workforceService.approveLeave(id, 'Manager');
  }

  reject(id: string): void {
    this.workforceService.rejectLeave(id, 'Manager');
  }

  submitRequest(): void {
    if (!this.newRequest.employeeId || !this.newRequest.startDate || !this.newRequest.endDate) {
      return;
    }
    const start = new Date(this.newRequest.startDate);
    const end = new Date(this.newRequest.endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    this.workforceService.submitLeave({
      employeeId: this.newRequest.employeeId,
      type: this.newRequest.type,
      startDate: this.newRequest.startDate,
      endDate: this.newRequest.endDate,
      days,
      status: 'pending',
      reason: this.newRequest.reason,
    });
    this.newRequest = { employeeId: '', type: 'annual', startDate: '', endDate: '', reason: '' };
    this.showForm.set(false);
  }

}
