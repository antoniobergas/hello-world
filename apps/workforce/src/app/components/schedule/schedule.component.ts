import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkforceService } from '../../services/workforce.service';
import { Employee, Shift, ShiftStatus } from '../../models/employee.model';

@Component({
  selector: 'app-schedule',
  imports: [DatePipe, NgClass, FormsModule],
  template: `
    <h1>Employee Schedule</h1>

    <div class="toolbar">
      <button class="week-nav-btn" aria-label="Previous week" (click)="prevWeek()">
        &#8592; Prev
      </button>
      <span class="week-label">Week of {{ weekStart | date: 'mediumDate' }}</span>
      <button class="week-nav-btn" aria-label="Next week" (click)="nextWeek()">Next &#8594;</button>
    </div>

    @if (showForm()) {
      <div class="form-panel">
        <h2>Add Shift</h2>
        <form (ngSubmit)="saveShift()">
          <select name="employeeId" [(ngModel)]="newShift.employeeId" required>
            <option value="" disabled>Select employee</option>
            @for (emp of employees; track emp.id) {
              <option [value]="emp.id">{{ emp.name }}</option>
            }
          </select>
          <input name="shiftDate" type="date" [(ngModel)]="newShift.date" required />
          <input name="startTime" type="time" [(ngModel)]="newShift.startTime" required />
          <input name="endTime" type="time" [(ngModel)]="newShift.endTime" required />
          <textarea
            name="notes"
            [(ngModel)]="newShift.notes"
            placeholder="Notes (optional)"
          ></textarea>
          <div class="form-actions">
            <button type="submit" class="save-shift-btn">Save Shift</button>
            <button type="button" class="cancel-btn" (click)="showForm.set(false)">Cancel</button>
          </div>
        </form>
      </div>
    }

    <div class="shift-list">
      @for (shift of filteredShifts; track shift.id) {
        <div class="shift-row">
          <span class="employee-name">{{ getEmployeeName(shift.employeeId) }}</span>
          <span class="shift-date">{{ shift.date }}</span>
          <span class="shift-time">{{ shift.startTime }} – {{ shift.endTime }}</span>
          <span class="shift-status" [ngClass]="'status-' + shift.status">{{ shift.status }}</span>
          @if (shift.notes) {
            <span class="shift-notes">{{ shift.notes }}</span>
          }
        </div>
      }
      @if (filteredShifts.length === 0) {
        <p class="empty-state">No shifts scheduled for this week.</p>
      }
    </div>

    <div class="schedule-summary">{{ filteredShifts.length }} shifts this week</div>

    <button class="add-shift-btn" (click)="showForm.set(true)">+ Add Shift</button>
  `,
  styles: [
    `
      h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .week-label {
        font-weight: 600;
        color: #374151;
      }
      .week-nav-btn {
        padding: 0.4rem 0.8rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: #fff;
      }
      .shift-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .shift-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }
      .employee-name {
        font-weight: 600;
        min-width: 150px;
      }
      .shift-date {
        color: #6b7280;
        min-width: 100px;
      }
      .shift-time {
        color: #374151;
        min-width: 130px;
      }
      .shift-status {
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .status-scheduled {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .status-confirmed {
        background: #dcfce7;
        color: #15803d;
      }
      .status-absent {
        background: #fee2e2;
        color: #dc2626;
      }
      .status-completed {
        background: #f3f4f6;
        color: #374151;
      }
      .schedule-summary {
        font-weight: 600;
        color: #374151;
        margin: 1rem 0;
      }
      .add-shift-btn {
        padding: 0.6rem 1.2rem;
        background: #064e3b;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .form-panel {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .form-panel h2 {
        margin-top: 0;
      }
      .form-panel form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
      }
      .form-panel select,
      .form-panel input,
      .form-panel textarea {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      .form-actions {
        display: flex;
        gap: 0.75rem;
      }
      .save-shift-btn {
        padding: 0.5rem 1rem;
        background: #064e3b;
        color: #fff;
        border: none;
        border-radius: 4px;
      }
      .cancel-btn {
        padding: 0.5rem 1rem;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 4px;
      }
      .empty-state {
        color: #9ca3af;
        font-style: italic;
      }
    `,
  ],
})
export class ScheduleComponent implements OnInit {
  private readonly workforceService = inject(WorkforceService);

  showForm = signal(false);
  weekStart: Date = new Date();

  employees: Employee[] = [];
  allShifts: Shift[] = [];
  filteredShifts: Shift[] = [];

  newShift = {
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  };

  ngOnInit(): void {
    this.setWeekStart(new Date());
    this.workforceService.employees$.subscribe((emps) => (this.employees = emps));
    this.workforceService.shifts$.subscribe((shifts) => {
      this.allShifts = shifts;
      this.filterShiftsForWeek();
    });
  }

  private setWeekStart(date: Date): void {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    this.weekStart = d;
    this.filterShiftsForWeek();
  }

  private filterShiftsForWeek(): void {
    const start = new Date(this.weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    this.filteredShifts = this.allShifts.filter((s) => {
      const d = new Date(s.date);
      return d >= start && d < end;
    });
  }

  prevWeek(): void {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() - 7);
    this.setWeekStart(d);
  }

  nextWeek(): void {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + 7);
    this.setWeekStart(d);
  }

  getEmployeeName(employeeId: string): string {
    return this.employees.find((e) => e.id === employeeId)?.name ?? employeeId;
  }

  saveShift(): void {
    if (
      !this.newShift.employeeId ||
      !this.newShift.date ||
      !this.newShift.startTime ||
      !this.newShift.endTime
    ) {
      return;
    }
    this.workforceService.addShift({
      employeeId: this.newShift.employeeId,
      date: this.newShift.date,
      startTime: this.newShift.startTime,
      endTime: this.newShift.endTime,
      status: 'scheduled',
      notes: this.newShift.notes || undefined,
    });
    this.newShift = { employeeId: '', date: '', startTime: '', endTime: '', notes: '' };
    this.showForm.set(false);
  }
}
