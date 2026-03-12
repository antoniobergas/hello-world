import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../services/approval.service';
import { ApprovalRequest, ApprovalStatus, ApprovalType } from '../../models/approval.model';

type QueueFilter = 'all' | ApprovalStatus;

@Component({
  selector: 'app-queue',
  imports: [NgClass, DatePipe, TitleCasePipe, DecimalPipe, FormsModule],
  template: `
    <h1>Approval Queue</h1>

    <div class="tab-bar">
      @for (tab of statusTabs; track tab) {
        <button
          class="queue-tab"
          [ngClass]="{ active: activeStatus() === tab }"
          (click)="activeStatus.set(tab)"
        >
          {{ tab === 'in_review' ? 'In Review' : (tab | titlecase) }}
        </button>
      }
    </div>

    <div class="filters-row">
      <label>Type:</label>
      <select class="type-filter" [(ngModel)]="activeType">
        <option value="all">All types</option>
        <option value="expense">Expense</option>
        <option value="leave">Leave</option>
        <option value="purchase">Purchase</option>
        <option value="travel">Travel</option>
        <option value="access">Access</option>
      </select>
    </div>

    <div class="approval-list">
      @for (req of filteredRequests(); track req.id) {
        <div class="approval-row">
          <div class="row-main">
            <span class="req-title">{{ req.title }}</span>
            <span class="type-badge type-{{ req.type }}">{{ req.type }}</span>
            <span class="priority-badge priority-{{ req.priority }}">{{ req.priority }}</span>
            <span class="approval-status status-{{ req.status }}">
              {{ req.status === 'in_review' ? 'In Review' : req.status }}
            </span>
          </div>
          <div class="row-meta">
            <span class="req-by">by {{ req.requestedBy }}</span>
            <span class="req-date">{{ req.submittedAt | date: 'mediumDate' }}</span>
            @if (req.amount) {
              <span class="req-amount">{{ req.currency }} {{ req.amount | number }}</span>
            }
          </div>
          @if (req.status === 'pending' || req.status === 'in_review') {
            <div class="row-actions">
              <button class="approve-btn" (click)="approve(req.id)">Approve</button>
              <button class="reject-btn" (click)="reject(req.id)">Reject</button>
            </div>
          }
        </div>
      }
      @if (filteredRequests().length === 0) {
        <p class="empty-state">No requests match the current filters.</p>
      }
    </div>

    <div class="queue-summary">{{ pendingCount() }} requests pending</div>
  `,
  styles: [
    `
      h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      .tab-bar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .queue-tab {
        padding: 0.4rem 0.9rem;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        background: #f9fafb;
        font-size: 0.85rem;
        cursor: pointer;
        text-transform: capitalize;
      }
      .queue-tab.active {
        background: #1e1b4b;
        color: #fff;
        border-color: #1e1b4b;
      }
      .filters-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .type-filter {
        padding: 0.4rem 0.6rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
      }
      .approval-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .approval-row {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .row-main {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }
      .req-title {
        font-weight: 600;
        flex: 1;
        min-width: 200px;
      }
      .type-badge,
      .priority-badge,
      .approval-status {
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .type-expense {
        background: #fef3c7;
        color: #d97706;
      }
      .type-leave {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .type-purchase {
        background: #dcfce7;
        color: #15803d;
      }
      .type-travel {
        background: #f3e8ff;
        color: #7c3aed;
      }
      .type-access {
        background: #fee2e2;
        color: #dc2626;
      }
      .priority-low {
        background: #f3f4f6;
        color: #6b7280;
      }
      .priority-normal {
        background: #e0f2fe;
        color: #0369a1;
      }
      .priority-high {
        background: #fef3c7;
        color: #d97706;
      }
      .priority-urgent {
        background: #fee2e2;
        color: #dc2626;
      }
      .status-pending {
        background: #fef3c7;
        color: #d97706;
      }
      .status-in_review {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .status-approved {
        background: #dcfce7;
        color: #15803d;
      }
      .status-rejected {
        background: #fee2e2;
        color: #dc2626;
      }
      .status-draft {
        background: #f3f4f6;
        color: #6b7280;
      }
      .status-cancelled {
        background: #f3f4f6;
        color: #9ca3af;
      }
      .row-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.85rem;
        color: #6b7280;
      }
      .row-actions {
        display: flex;
        gap: 0.5rem;
      }
      .approve-btn {
        padding: 0.3rem 0.8rem;
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
        border-radius: 4px;
      }
      .reject-btn {
        padding: 0.3rem 0.8rem;
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
        border-radius: 4px;
      }
      .queue-summary {
        font-weight: 600;
        color: #374151;
        padding: 0.75rem 0;
      }
      .empty-state {
        color: #9ca3af;
        font-style: italic;
      }
    `,
  ],
})
export class QueueComponent implements OnInit {
  private readonly approvalService = inject(ApprovalService);

  activeStatus = signal<QueueFilter>('all');
  activeType: string = 'all';
  statusTabs: QueueFilter[] = ['all', 'pending', 'in_review', 'approved', 'rejected'];

  private allRequests: ApprovalRequest[] = [];

  ngOnInit(): void {
    this.approvalService.requests$.subscribe((reqs) => {
      this.allRequests = reqs;
    });
  }

  filteredRequests(): ApprovalRequest[] {
    let result = [...this.allRequests];
    const status = this.activeStatus();
    if (status !== 'all') {
      result = result.filter((r) => r.status === status);
    }
    if (this.activeType !== 'all') {
      result = result.filter((r) => r.type === (this.activeType as ApprovalType));
    }
    return result;
  }

  pendingCount(): number {
    return this.allRequests.filter((r) => r.status === 'pending').length;
  }

  approve(id: string): void {
    this.approvalService.approve(id, 'Queue Manager', 'Approved from queue');
  }

  reject(id: string): void {
    this.approvalService.reject(id, 'Queue Manager', 'Rejected from queue');
  }
}
