import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-exports',
  imports: [AsyncPipe, DatePipe, UpperCasePipe],
  template: `
    <section class="exports-page" aria-label="Export jobs">
      <h1>Exports</h1>

      <ul class="export-list" aria-label="Export job list">
        @for (job of exportService.jobs$ | async; track job.id) {
          <li
            class="export-row"
            [attr.data-export-id]="job.id"
            [attr.aria-label]="'Export job: ' + job.reportName"
          >
            <div class="export-info">
              <span class="export-report">{{ job.reportName }}</span>
              <span class="export-format format-{{ job.format }}">{{
                job.format | uppercase
              }}</span>
              <span class="export-date">Requested {{ job.createdAt | date: 'medium' }}</span>
              @if (job.readyAt) {
                <span class="export-ready">Ready {{ job.readyAt | date: 'medium' }}</span>
              }
              @if (job.fileSizeKb && job.fileSizeKb > 0) {
                <span class="export-size">{{ job.fileSizeKb }} KB</span>
              }
            </div>
            <div class="export-actions">
              <span class="export-status badge-{{ job.status }}">{{ job.status | uppercase }}</span>
              @if (job.status === 'ready') {
                <button
                  class="download-btn"
                  [attr.aria-label]="'Download ' + job.reportName + ' export'"
                >
                  ↓ Download
                </button>
              }
              <button
                class="delete-export-btn"
                (click)="exportService.delete(job.id)"
                [attr.aria-label]="'Delete export job for ' + job.reportName"
              >
                ✕
              </button>
            </div>
          </li>
        }
        @if ((exportService.jobs$ | async)?.length === 0) {
          <li class="empty-state" aria-label="No export jobs">
            No export jobs yet. Run a report and export it.
          </li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .exports-page {
        color: #e2e8f0;
      }
      h1 {
        margin-bottom: 1.5rem;
        font-size: 1.75rem;
      }
      .export-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .export-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
      }
      .export-info {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        flex: 1;
      }
      .export-report {
        font-weight: 600;
      }
      .export-format {
        font-size: 0.75rem;
        font-weight: 700;
      }
      .format-csv {
        color: #22c55e;
      }
      .format-json {
        color: #f59e0b;
      }
      .format-xlsx {
        color: #6366f1;
      }
      .export-date,
      .export-ready {
        font-size: 0.75rem;
        color: #64748b;
      }
      .export-size {
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .export-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }
      .download-btn {
        background: #22c55e;
        color: white;
        border: none;
        padding: 0.3rem 0.75rem;
        border-radius: 5px;
        font-size: 0.8rem;
      }
      .delete-export-btn {
        background: none;
        border: 1px solid #475569;
        color: #94a3b8;
        border-radius: 5px;
        padding: 0.3rem 0.5rem;
        font-size: 0.8rem;
      }
      .badge-pending {
        background: #1e293b;
        color: #94a3b8;
        border: 1px solid #334155;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-generating {
        background: #78350f;
        color: #fcd34d;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-ready {
        background: #14532d;
        color: #86efac;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
      }
      .badge-expired {
        background: #1e293b;
        color: #475569;
        border: 1px solid #334155;
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
export class ExportsComponent {
  readonly exportService = inject(ExportService);
}
