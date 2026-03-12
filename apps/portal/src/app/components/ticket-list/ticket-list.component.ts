import { Component, inject, signal } from '@angular/core';
import { NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { TicketCategory, TicketPriority } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  imports: [DatePipe, UpperCasePipe, FormsModule, RouterLink],
  template: `
    <section class="ticket-list-page" aria-label="My tickets">
      <div class="page-header">
        <h1>My Tickets</h1>
        <button
          class="new-ticket-btn"
          (click)="showForm.set(!showForm())"
          aria-label="Submit new ticket"
        >
          {{ showForm() ? 'Cancel' : '+ New Ticket' }}
        </button>
      </div>

      @if (showForm()) {
        <form class="ticket-form" (ngSubmit)="submitTicket()" aria-label="New ticket form">
          <h3>Submit a Support Request</h3>
          <div class="field">
            <label for="subject">Subject *</label>
            <input
              id="subject"
              name="subject"
              [(ngModel)]="form.subject"
              required
              placeholder="Brief description of your issue"
            />
          </div>
          <div class="field">
            <label for="description">Description *</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="form.description"
              required
              rows="4"
              placeholder="Provide as much detail as possible"
            ></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="category">Category</label>
              <select id="category" name="category" [(ngModel)]="form.category">
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="feature_request">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="field">
              <label for="priority">Priority</label>
              <select id="priority" name="priority" [(ngModel)]="form.priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <button type="submit" class="submit-btn" [disabled]="!form.subject || !form.description">
            Submit Ticket
          </button>
        </form>
      }

      <!-- Status filter tabs -->
      <div class="filter-tabs" role="tablist" aria-label="Filter tickets by status">
        @for (tab of statusTabs; track tab.value) {
          <button
            role="tab"
            [class.active]="statusFilter === tab.value"
            (click)="statusFilter = tab.value"
            [attr.aria-label]="'Show ' + tab.label + ' tickets'"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <ul class="ticket-list" aria-label="Ticket list">
        @for (ticket of filteredTickets(); track ticket.id) {
          <li
            class="ticket-row"
            [attr.data-ticket-id]="ticket.id"
            [attr.aria-label]="'Ticket ' + ticket.id + ': ' + ticket.subject"
          >
            <div class="ticket-meta">
              <span class="ticket-id">{{ ticket.id }}</span>
              <span class="ticket-status badge-{{ ticket.status }}">{{
                ticket.status | uppercase
              }}</span>
              <span class="ticket-priority priority-{{ ticket.priority }}">{{
                ticket.priority
              }}</span>
            </div>
            <div class="ticket-subject">
              <a class="ticket-link" [routerLink]="['/tickets', ticket.id]">{{ ticket.subject }}</a>
            </div>
            <div class="ticket-date">{{ ticket.createdAt | date: 'mediumDate' }}</div>
          </li>
        }
        @if (filteredTickets().length === 0) {
          <li class="empty-state" aria-label="No tickets">No tickets to display.</li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .ticket-list-page {
        max-width: 800px;
        margin: 0 auto;
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
      .new-ticket-btn {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1.25rem;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .ticket-form {
        background: #f1f5f9;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .ticket-form h3 {
        margin: 0 0 1rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 0.75rem;
      }
      .field label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #475569;
      }
      .field input,
      .field textarea,
      .field select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .field-row {
        display: flex;
        gap: 1rem;
      }
      .field-row .field {
        flex: 1;
      }
      .submit-btn {
        background: #22c55e;
        color: white;
        border: none;
        padding: 0.6rem 1.5rem;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .filter-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .filter-tabs button {
        padding: 0.4rem 1rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: white;
        font-size: 0.875rem;
      }
      .filter-tabs button.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      .ticket-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .ticket-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }
      .ticket-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .ticket-id {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 600;
      }
      .ticket-link {
        text-decoration: none;
        color: #1e293b;
        font-weight: 500;
      }
      .ticket-link:hover {
        color: #3b82f6;
      }
      .ticket-date {
        font-size: 0.8rem;
        color: #94a3b8;
      }
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
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
export class TicketListComponent {
  readonly ticketService = inject(TicketService);
  showForm = signal(false);
  statusFilter: 'all' | 'open' | 'resolved' = 'all';
  readonly statusTabs = [
    { value: 'all' as const, label: 'All' },
    { value: 'open' as const, label: 'Open' },
    { value: 'resolved' as const, label: 'Resolved' },
  ];

  form: {
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  } = {
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium',
  };

  filteredTickets() {
    const tickets = this.ticketService.tickets;
    if (this.statusFilter === 'all') return tickets;
    if (this.statusFilter === 'resolved')
      return tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');
    return tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  }

  submitTicket(): void {
    if (!this.form.subject || !this.form.description) return;
    this.ticketService.submit(
      this.form.subject,
      this.form.description,
      this.form.category,
      this.form.priority,
    );
    this.form = { subject: '', description: '', category: 'technical', priority: 'medium' };
    this.showForm.set(false);
  }
}
