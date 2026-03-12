import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, NgClass, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ExportService } from '../../services/export.service';
import { ExportFormat } from '../../models/reporting.model';

@Component({
  selector: 'app-reports',
  imports: [AsyncPipe, DatePipe, DecimalPipe, UpperCasePipe, FormsModule],
  template: `
    <section class="reports-page" aria-label="Reports">
      <div class="page-header">
        <h1>Reports</h1>
        <button
          class="new-report-btn"
          (click)="showForm.set(!showForm())"
          aria-label="Create new report"
        >
          {{ showForm() ? 'Cancel' : '+ New Report' }}
        </button>
      </div>

      @if (showForm()) {
        <form class="report-form" (ngSubmit)="createReport()" aria-label="New report form">
          <div class="field">
            <label for="reportName">Report Name *</label>
            <input
              id="reportName"
              name="reportName"
              [(ngModel)]="form.name"
              required
              placeholder="e.g. Q1 Revenue Report"
            />
          </div>
          <div class="field">
            <label for="reportDesc">Description</label>
            <input
              id="reportDesc"
              name="reportDesc"
              [(ngModel)]="form.description"
              placeholder="What does this report contain?"
            />
          </div>
          <button type="submit" class="create-btn" [disabled]="!form.name">Create Report</button>
        </form>
      }

      <ul class="report-list" aria-label="Report list">
        @for (report of reportService.reports$ | async; track report.id) {
          <li
            class="report-row"
            [attr.data-report-id]="report.id"
            [attr.aria-label]="'Report: ' + report.name"
          >
            <div class="report-info">
              <span class="report-name">{{ report.name }}</span>
              <span class="report-desc">{{ report.description }}</span>
              @if (report.lastRunAt) {
                <span class="report-last-run"
                  >Last run: {{ report.lastRunAt | date: 'medium' }}</span
                >
              }
              @if (report.rowCount) {
                <span class="report-rows">{{ report.rowCount | number }} rows</span>
              }
            </div>
            <div class="report-actions">
              <span class="report-status badge-{{ report.status }}">{{
                report.status | uppercase
              }}</span>
              <button
                class="run-btn"
                (click)="runReport(report.id)"
                [attr.aria-label]="'Run report: ' + report.name"
              >
                ▶ Run
              </button>
              <div class="export-group">
                <select
                  class="format-select"
                  [(ngModel)]="selectedFormats[report.id]"
                  [attr.aria-label]="'Export format for ' + report.name"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xlsx">XLSX</option>
                </select>
                <button
                  class="export-btn"
                  (click)="exportReport(report.id, report.name)"
                  [attr.aria-label]="'Export ' + report.name"
                >
                  Export
                </button>
              </div>
              <button
                class="delete-btn"
                (click)="deleteReport(report.id)"
                [attr.aria-label]="'Delete report: ' + report.name"
              >
                ✕
              </button>
            </div>
          </li>
        }
        @if ((reportService.reports$ | async)?.length === 0) {
          <li class="empty-state">No reports yet. Create one to get started.</li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .reports-page {
        color: #e2e8f0;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      h1 {
        margin: 0;
        font-size: 1.75rem;
      }
      .new-report-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
        font-size: 0.875rem;
      }
      .report-form {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 0.75rem;
      }
      .field label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #94a3b8;
      }
      .field input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #334155;
        border-radius: 6px;
        background: #0f172a;
        color: #e2e8f0;
        font-size: 0.9rem;
      }
      .create-btn {
        background: #22c55e;
        color: white;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
        font-size: 0.875rem;
      }
      .create-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .report-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .report-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
      }
      .report-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        flex: 1;
      }
      .report-name {
        font-weight: 600;
      }
      .report-desc {
        font-size: 0.8rem;
        color: #94a3b8;
      }
      .report-last-run,
      .report-rows {
        font-size: 0.75rem;
        color: #64748b;
      }
      .report-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }
      .run-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.3rem 0.75rem;
        border-radius: 5px;
        font-size: 0.8rem;
      }
      .export-group {
        display: flex;
        gap: 0.25rem;
      }
      .format-select {
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 5px;
        padding: 0.3rem 0.5rem;
        font-size: 0.8rem;
      }
      .export-btn {
        background: #6366f1;
        color: white;
        border: none;
        padding: 0.3rem 0.75rem;
        border-radius: 5px;
        font-size: 0.8rem;
      }
      .delete-btn {
        background: none;
        border: 1px solid #475569;
        color: #94a3b8;
        border-radius: 5px;
        padding: 0.3rem 0.5rem;
        font-size: 0.8rem;
      }
      .badge-draft {
        background: #1e293b;
        color: #94a3b8;
        border: 1px solid #334155;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-scheduled {
        background: #312e81;
        color: #a5b4fc;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-running {
        background: #78350f;
        color: #fcd34d;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-completed {
        background: #14532d;
        color: #86efac;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-failed {
        background: #7f1d1d;
        color: #fca5a5;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #475569;
      }
    `,
  ],
})
export class ReportsComponent {
  readonly reportService = inject(ReportService);
  readonly exportService = inject(ExportService);

  showForm = signal(false);
  form = { name: '', description: '' };
  selectedFormats: Record<string, ExportFormat> = {};

  createReport(): void {
    if (!this.form.name) return;
    this.reportService.create(this.form.name, this.form.description);
    this.form = { name: '', description: '' };
    this.showForm.set(false);
  }

  runReport(id: string): void {
    this.reportService.run(id);
  }

  exportReport(reportId: string, reportName: string): void {
    const format: ExportFormat = this.selectedFormats[reportId] ?? 'csv';
    this.exportService.schedule(reportId, reportName, format);
  }

  deleteReport(id: string): void {
    this.reportService.delete(id);
  }
}
