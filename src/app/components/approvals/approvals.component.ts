import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { ApprovalService } from '../../services/approval.service';

@Component({
  selector: 'app-approvals',
  imports: [AsyncPipe, DatePipe, NgClass, UpperCasePipe],
  template: `
    <section class="approvals-page" aria-label="Approval workflow">
      <h2>Approval Workflow</h2>

      <div class="section-header">
        <button
          class="submit-btn"
          (click)="submitSampleRequest()"
          aria-label="Submit a sample approval request"
        >
          + Submit Sample Request
        </button>
      </div>

      <!-- Pending Approvals -->
      <div class="approvals-section" aria-label="Pending approvals">
        <h3>Pending Approvals</h3>
        <ul class="approval-list">
          @for (req of approvalService.pendingRequests$ | async; track req.id) {
            <li class="approval-item pending" [attr.aria-label]="'Pending request: ' + req.title">
              <div class="approval-info">
                <span class="approval-title">{{ req.title }}</span>
                <span class="approval-meta"
                  >{{ req.type }} · by {{ req.requestedBy }} ·
                  {{ req.requestedAt | date: 'short' }}</span
                >
                <span class="approval-desc">{{ req.description }}</span>
              </div>
              <div class="approval-actions">
                <button
                  class="approve-btn"
                  (click)="approve(req.id)"
                  [attr.aria-label]="'Approve ' + req.title"
                >
                  ✓ Approve
                </button>
                <button
                  class="reject-btn"
                  (click)="reject(req.id)"
                  [attr.aria-label]="'Reject ' + req.title"
                >
                  ✕ Reject
                </button>
              </div>
            </li>
          }
          @if ((approvalService.pendingRequests$ | async)?.length === 0) {
            <li class="empty-state">No pending approvals</li>
          }
        </ul>
      </div>

      <!-- History -->
      <div class="approvals-section" aria-label="Approval history">
        <h3>History</h3>
        <ul class="approval-list">
          @for (req of approvalService.requests$ | async; track req.id) {
            @if (req.status !== 'pending') {
              <li
                class="approval-item"
                [ngClass]="'approval-' + req.status"
                [attr.aria-label]="req.status + ' request: ' + req.title"
              >
                <div class="approval-info">
                  <span class="approval-title">{{ req.title }}</span>
                  <span class="approval-meta">{{ req.type }} · by {{ req.requestedBy }}</span>
                </div>
                <div class="status-badge" [ngClass]="'badge-' + req.status">
                  {{ req.status | uppercase }}
                </div>
              </li>
            }
          }
          @if (historyEmpty()) {
            <li class="empty-state">No history yet</li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: [
    `
      .approvals-page {
        padding: 1.5rem;
        max-width: 800px;
        margin: 0 auto;
      }
      h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .section-header {
        margin-bottom: 1.5rem;
      }
      .submit-btn {
        padding: 0.45rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .submit-btn:hover {
        background: #2563eb;
      }
      .approvals-section {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
        background: white;
      }
      h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: #334155;
      }
      .approval-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .approval-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        border: 1px solid #e2e8f0;
      }
      .approval-item.pending {
        border-left: 4px solid #d97706;
      }
      .approval-approved {
        border-left: 4px solid #16a34a;
      }
      .approval-rejected {
        border-left: 4px solid #dc2626;
      }
      .approval-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }
      .approval-title {
        font-weight: 600;
        color: #1e293b;
      }
      .approval-meta {
        font-size: 0.8rem;
        color: #64748b;
      }
      .approval-desc {
        font-size: 0.875rem;
        color: #475569;
      }
      .approval-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-shrink: 0;
      }
      .approve-btn {
        padding: 0.35rem 0.75rem;
        background: #dcfce7;
        color: #16a34a;
        border: 1px solid #86efac;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .reject-btn {
        padding: 0.35rem 0.75rem;
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .status-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
      }
      .badge-approved {
        background: #dcfce7;
        color: #16a34a;
      }
      .badge-rejected {
        background: #fee2e2;
        color: #dc2626;
      }
      .empty-state {
        color: #94a3b8;
        font-style: italic;
        padding: 0.5rem 0;
      }
    `,
  ],
})
export class ApprovalsComponent {
  approvalService = inject(ApprovalService);

  private sampleCount = 0;

  submitSampleRequest(): void {
    this.sampleCount++;
    this.approvalService.submitRequest(
      'access',
      `Access Request #${this.sampleCount}`,
      `Request for access to resource #${this.sampleCount}`,
      'user-001',
    );
  }

  approve(id: string): void {
    this.approvalService.approve(id, 'admin', 'Approved via UI');
  }

  reject(id: string): void {
    this.approvalService.reject(id, 'admin', 'Rejected via UI');
  }

  historyEmpty(): boolean {
    return (
      this.approvalService.getByStatus('approved').length === 0 &&
      this.approvalService.getByStatus('rejected').length === 0
    );
  }
}
