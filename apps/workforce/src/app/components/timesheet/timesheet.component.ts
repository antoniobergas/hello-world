import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkforceService } from '../../services/workforce.service';
import { Employee, TimesheetEntry } from '../../models/employee.model';

@Component({
  selector: 'app-timesheet',
  imports: [FormsModule],
  template: `
    <h1>Timesheets</h1>

    <div class="controls">
      <label for="employeeSel">Employee:</label>
      <select class="employee-select" id="employeeSel" [(ngModel)]="selectedEmployeeId" (ngModelChange)="onEmployeeChange()">
        <option value="">All Employees</option>
        @for (emp of employees; track emp.id) {
          <option [value]="emp.id">{{ emp.name }}</option>
        }
      </select>
    </div>

    <div class="timesheet-summary">
      Total hours: {{ totalHours() }}
    </div>

    <div class="timesheet-list">
      @for (entry of filteredEntries(); track entry.id) {
        <div class="timesheet-row">
          <span class="entry-date">{{ entry.date }}</span>
          <span class="entry-employee">{{ getEmployeeName(entry.employeeId) }}</span>
          <span class="entry-project">{{ entry.project }}</span>
          <span class="entry-hours">{{ entry.hoursWorked }}h</span>
          @if (entry.notes) {
            <span class="entry-notes">{{ entry.notes }}</span>
          }
        </div>
      }
      @if (filteredEntries().length === 0) {
        <p class="empty-state">No timesheet entries found.</p>
      }
    </div>

    @if (showForm()) {
      <div class="form-panel">
        <h2>Log Hours</h2>
        <form (ngSubmit)="saveEntry()">
          <select name="employeeId" [(ngModel)]="newEntry.employeeId" required>
            <option value="" disabled>Select employee</option>
            @for (emp of employees; track emp.id) {
              <option [value]="emp.id">{{ emp.name }}</option>
            }
          </select>
          <input name="timesheetDate" type="date" [(ngModel)]="newEntry.date" required />
          <input name="hoursWorked" type="number" min="0.5" max="24" step="0.5" [(ngModel)]="newEntry.hoursWorked" required />
          <input name="project" placeholder="Project name" [(ngModel)]="newEntry.project" required />
          <textarea name="notes" placeholder="Notes (optional)" [(ngModel)]="newEntry.notes"></textarea>
          <div class="form-actions">
            <button type="submit" class="save-hours-btn">Save</button>
            <button type="button" class="cancel-btn" (click)="showForm.set(false)">Cancel</button>
          </div>
        </form>
      </div>
    }

    <button class="log-hours-btn" (click)="showForm.set(true)">Log Hours</button>
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      .controls { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
      .employee-select { padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 4px; }
      .timesheet-summary {
        background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;
        padding: 0.75rem 1rem; font-weight: 600; color: #065f46; margin-bottom: 1rem;
      }
      .timesheet-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
      .timesheet-row {
        display: flex; flex-wrap: wrap; align-items: center; gap: 1rem;
        padding: 0.75rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
      }
      .entry-date { color: #6b7280; min-width: 100px; }
      .entry-employee { font-weight: 600; min-width: 140px; }
      .entry-project { color: #374151; flex: 1; }
      .entry-hours { font-weight: 700; color: #064e3b; min-width: 40px; }
      .entry-notes { color: #9ca3af; font-size: 0.85rem; }
      .log-hours-btn { padding: 0.6rem 1.2rem; background: #064e3b; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; }
      .form-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
      .form-panel h2 { margin-top: 0; }
      .form-panel form { display: flex; flex-direction: column; gap: 0.75rem; max-width: 400px; }
      .form-panel select, .form-panel input, .form-panel textarea {
        padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem;
      }
      .form-actions { display: flex; gap: 0.75rem; }
      .save-hours-btn { padding: 0.5rem 1rem; background: #064e3b; color: #fff; border: none; border-radius: 4px; }
      .cancel-btn { padding: 0.5rem 1rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; }
      .empty-state { color: #9ca3af; font-style: italic; }
    `,
  ],
})
export class TimesheetComponent implements OnInit {
  private readonly workforceService = inject(WorkforceService);

  showForm = signal(false);
  selectedEmployeeId = '';

  employees: Employee[] = [];
  private allEntries: TimesheetEntry[] = [];

  newEntry = {
    employeeId: '',
    date: '',
    hoursWorked: 8,
    project: '',
    notes: '',
  };

  ngOnInit(): void {
    this.workforceService.employees$.subscribe((emps) => (this.employees = emps));
    this.workforceService.timesheetEntries$.subscribe((entries) => (this.allEntries = entries));
  }

  filteredEntries(): TimesheetEntry[] {
    if (!this.selectedEmployeeId) return this.allEntries;
    return this.allEntries.filter((e) => e.employeeId === this.selectedEmployeeId);
  }

  totalHours(): number {
    return this.filteredEntries().reduce((sum, e) => sum + e.hoursWorked, 0);
  }

  onEmployeeChange(): void {
    // reactive filtering handled by filteredEntries()
  }

  getEmployeeName(employeeId: string): string {
    return this.employees.find((e) => e.id === employeeId)?.name ?? employeeId;
  }

  saveEntry(): void {
    if (!this.newEntry.employeeId || !this.newEntry.date || !this.newEntry.project) {
      return;
    }
    this.workforceService.addTimesheetEntry({
      employeeId: this.newEntry.employeeId,
      date: this.newEntry.date,
      hoursWorked: Number(this.newEntry.hoursWorked),
      project: this.newEntry.project,
      notes: this.newEntry.notes || undefined,
    });
    this.newEntry = { employeeId: '', date: '', hoursWorked: 8, project: '', notes: '' };
    this.showForm.set(false);
  }
}
