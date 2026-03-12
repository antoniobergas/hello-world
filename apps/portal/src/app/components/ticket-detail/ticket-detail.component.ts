import { Component, inject, computed } from '@angular/core';
import { NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-detail',
  imports: [NgClass, DatePipe, UpperCasePipe, FormsModule, RouterLink],
  template: `
    <section class="ticket-detail-page" aria-label="Ticket detail">
      <a routerLink="/tickets" class="back-link">← Back to My Tickets</a>

      @if (ticket(); as t) {
        <div class="ticket-header">
          <div class="ticket-id-row">
            <span class="ticket-id">{{ t.id }}</span>
            <span class="ticket-status badge-{{ t.status }}">{{ t.status | uppercase }}</span>
            <span class="ticket-priority priority-{{ t.priority }}">{{ t.priority }}</span>
          </div>
          <h1 class="ticket-subject">{{ t.subject }}</h1>
          <p class="ticket-desc">{{ t.description }}</p>
          <div class="ticket-meta-row">
            <span
              >Category: <strong>{{ t.category }}</strong></span
            >
            <span
              >Submitted: <strong>{{ t.createdAt | date: 'medium' }}</strong></span
            >
            @if (t.assignedTo) {
              <span
                >Assigned to: <strong>{{ t.assignedTo }}</strong></span
              >
            }
          </div>
        </div>

        <!-- Status Actions -->
        @if (t.status === 'open' || t.status === 'in_progress') {
          <div class="actions" aria-label="Ticket actions">
            <button
              class="resolve-btn"
              (click)="resolve(t.id)"
              aria-label="Mark ticket as resolved"
            >
              ✓ Mark as Resolved
            </button>
            <button class="close-btn" (click)="close(t.id)" aria-label="Close ticket">
              ✕ Close Ticket
            </button>
          </div>
        }

        <!-- Comments -->
        <div class="comments-section" aria-label="Ticket comments">
          <h3>Conversation</h3>
          @if (comments().length === 0) {
            <p class="empty-state">No comments yet.</p>
          }
          @for (comment of comments(); track comment.id) {
            <div
              class="comment"
              [class.staff-comment]="comment.isStaff"
              [attr.aria-label]="
                (comment.isStaff ? 'Staff' : 'Customer') + ' comment by ' + comment.author
              "
            >
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                @if (comment.isStaff) {
                  <span class="staff-badge">Staff</span>
                }
                <span class="comment-date">{{ comment.createdAt | date: 'short' }}</span>
              </div>
              <p class="comment-body">{{ comment.body }}</p>
            </div>
          }
          <!-- Add comment form -->
          <div class="add-comment" aria-label="Add comment form">
            <textarea
              name="newComment"
              [(ngModel)]="newComment"
              rows="3"
              placeholder="Add a reply…"
              aria-label="Comment text"
            ></textarea>
            <button
              class="comment-btn"
              (click)="addComment(t.id)"
              [disabled]="!newComment.trim()"
              aria-label="Submit comment"
            >
              Send Reply
            </button>
          </div>
        </div>
      } @else {
        <p class="not-found" aria-label="Ticket not found">Ticket not found.</p>
      }
    </section>
  `,
  styles: [
    `
      .ticket-detail-page {
        max-width: 720px;
        margin: 0 auto;
      }
      .back-link {
        color: #3b82f6;
        text-decoration: none;
        font-size: 0.9rem;
        display: inline-block;
        margin-bottom: 1rem;
      }
      .ticket-id-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .ticket-id {
        font-size: 0.85rem;
        font-weight: 700;
        color: #64748b;
      }
      .ticket-subject {
        margin: 0 0 0.75rem;
        font-size: 1.5rem;
      }
      .ticket-desc {
        color: #475569;
        margin-bottom: 1rem;
      }
      .ticket-meta-row {
        display: flex;
        gap: 1.5rem;
        font-size: 0.85rem;
        color: #64748b;
        margin-bottom: 1.5rem;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      .resolve-btn {
        background: #22c55e;
        color: white;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
      }
      .close-btn {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
      }
      .comments-section h3 {
        margin-bottom: 1rem;
      }
      .comment {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        margin-bottom: 0.75rem;
      }
      .staff-comment {
        background: #eff6ff;
        border-color: #bfdbfe;
      }
      .comment-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.4rem;
      }
      .comment-author {
        font-weight: 600;
        font-size: 0.875rem;
      }
      .staff-badge {
        background: #3b82f6;
        color: white;
        font-size: 0.7rem;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
      }
      .comment-date {
        font-size: 0.75rem;
        color: #94a3b8;
        margin-left: auto;
      }
      .comment-body {
        margin: 0;
        font-size: 0.9rem;
        color: #374151;
      }
      .add-comment {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .add-comment textarea {
        padding: 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.9rem;
        resize: vertical;
      }
      .comment-btn {
        align-self: flex-end;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
        font-size: 0.875rem;
      }
      .comment-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .empty-state,
      .not-found {
        color: #94a3b8;
        font-size: 0.9rem;
      }
      .badge-open {
        background: #dbeafe;
        color: #1d4ed8;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .badge-in_progress {
        background: #fef3c7;
        color: #d97706;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .badge-resolved {
        background: #dcfce7;
        color: #15803d;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .badge-closed {
        background: #f1f5f9;
        color: #64748b;
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .priority-critical {
        color: #dc2626;
        font-weight: 600;
        font-size: 0.8rem;
      }
      .priority-high {
        color: #ea580c;
        font-size: 0.8rem;
      }
      .priority-medium {
        color: #d97706;
        font-size: 0.8rem;
      }
      .priority-low {
        color: #16a34a;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class TicketDetailComponent {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);

  newComment = '';

  ticket = computed(() => {
    const params = this.route.snapshot.paramMap;
    return this.ticketService.getById(params.get('id') ?? '');
  });

  comments = computed(() => {
    const params = this.route.snapshot.paramMap;
    return this.ticketService.commentsFor(params.get('id') ?? '');
  });

  resolve(id: string): void {
    this.ticketService.updateStatus(id, 'resolved');
  }

  close(id: string): void {
    this.ticketService.updateStatus(id, 'closed');
  }

  addComment(ticketId: string): void {
    if (!this.newComment.trim()) return;
    this.ticketService.addComment(ticketId, 'You', this.newComment.trim());
    this.newComment = '';
  }
}
