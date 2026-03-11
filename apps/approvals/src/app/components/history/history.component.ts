import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../services/approval.service';
import { ApprovalRequest, ApprovalStatus, ApprovalType } from '../../models/approval.model';

@Component({
  selector: 'app-history',
  imports: [DatePipe, FormsModule],
  template: `
    <h1>Approval History</h1>

    <div class="filter-bar">
      <div class="filter-group">
        <label>From:</label>
        <input type="date" [(ngModel)]="filterFrom" (ngModelChange)="applyFilters()" />
      </div>
      <div class="filter-group">
        <label>To:</label>
        <input type="date" [(ngModel)]="filterTo" (ngModelChange)="applyFilters()" />
      </div>
      <div class="filter-group">
        <label>Type:</label>
        <select class="history-type-filter" [(ngModel)]="filterType" (ngModelChange)="applyFilters()">
          <option value="all">All types</option>
          <option value="expense">Expense</option>
          <option value="leave">Leave</option>
          <option value="purchase">Purchase</option>
          <option value="travel">Travel</option>
          <option value="access">Access</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status:</label>
        <select class="history-status-filter" [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div class="history-list">
      @for (req of filteredRequests; track req.id) {
        <div class="history-row">
          <span class="history-id">#{{ req.id }}</span>
          <span class="history-title">{{ req.title }}</span>
          <span class="type-badge type-{{ req.type }}">{{ req.type }}</span>
          <span class="history-status status-{{ req.status }}">
            {{ req.status === 'in_review' ? 'In Review' : req.status }}
          </span>
          <span class="history-by">{{ req.requestedBy }}</span>
          <span class="history-submitted">{{ req.submittedAt | date: 'mediumDate' }}</span>
          <span class="history-updated">Updated: {{ req.updatedAt | date: 'mediumDate' }}</span>
        </div>
      }
      @if (filteredRequests.length === 0) {
        <p class="empty-state">No requests match the current filters.</p>
      }
    </div>

    <div class="history-summary">
      {{ filteredRequests.length }} total requests
    </div>
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      .filter-bar { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-end; }
      .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
      .filter-group label { font-size: 0.8rem; font-weight: 600; color: #6b7280; }
      .filter-group input, .filter-group select {
        padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem;
      }
      .history-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
      .history-row {
        display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;
        padding: 0.75rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
      }
      .history-id { color: #9ca3af; font-size: 0.8rem; min-width: 40px; }
      .history-title { font-weight: 600; flex: 1; min-width: 180px; }
      .type-badge, .history-status {
        padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;
      }
      .type-expense { background: #fef3c7; color: #d97706; }
      .type-leave { background: #dbeafe; color: #1d4ed8; }
      .type-purchase { background: #dcfce7; color: #15803d; }
      .type-travel { background: #f3e8ff; color: #7c3aed; }
      .type-access { background: #fee2e2; color: #dc2626; }
      .status-pending { background: #fef3c7; color: #d97706; }
      .status-in_review { background: #dbeafe; color: #1d4ed8; }
      .status-approved { background: #dcfce7; color: #15803d; }
      .status-rejected { background: #fee2e2; color: #dc2626; }
      .status-draft { background: #f3f4f6; color: #6b7280; }
      .status-cancelled { background: #f3f4f6; color: #9ca3af; }
      .history-by { color: #6b7280; font-size: 0.85rem; }
      .history-submitted, .history-updated { color: #9ca3af; font-size: 0.8rem; }
      .history-summary { font-weight: 600; color: #374151; padding: 0.5rem 0; }
      .empty-state { color: #9ca3af; font-style: italic; }
    `,
  ],
})
export class HistoryComponent implements OnInit {
  private readonly approvalService = inject(ApprovalService);

  filterFrom = '';
  filterTo = '';
  filterType = 'all';
  filterStatus = 'all';
  filteredRequests: ApprovalRequest[] = [];

  private allRequests: ApprovalRequest[] = [];

  ngOnInit(): void {
    this.approvalService.requests$.subscribe((reqs) => {
      this.allRequests = reqs;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.allRequests];
    if (this.filterFrom) {
      const from = new Date(this.filterFrom);
      result = result.filter((r) => new Date(r.submittedAt) >= from);
    }
    if (this.filterTo) {
      const to = new Date(this.filterTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.submittedAt) <= to);
    }
    if (this.filterType !== 'all') {
      result = result.filter((r) => r.type === (this.filterType as ApprovalType));
    }
    if (this.filterStatus !== 'all') {
      result = result.filter((r) => r.status === (this.filterStatus as ApprovalStatus));
    }
    this.filteredRequests = result;
  }
}
