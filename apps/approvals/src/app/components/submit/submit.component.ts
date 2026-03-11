import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../services/approval.service';
import { ApprovalType, ApprovalPriority } from '../../models/approval.model';

@Component({
  selector: 'app-submit',
  imports: [FormsModule],
  template: `
    <h1>Submit Request</h1>

    @if (submitted()) {
      <div class="submission-success">
        <span>&#10003;</span> Your request has been submitted successfully!
        <button class="new-request-btn" (click)="resetForm()">Submit Another</button>
      </div>
    } @else {
      <form class="submit-form" (ngSubmit)="submitRequest()">
        <div class="form-group">
          <label>Request Type</label>
          <select name="type" [(ngModel)]="form.type" required>
            <option value="expense">Expense</option>
            <option value="leave">Leave</option>
            <option value="purchase">Purchase</option>
            <option value="travel">Travel</option>
            <option value="access">Access</option>
          </select>
        </div>

        <div class="form-group">
          <label>Title</label>
          <input name="title" placeholder="Request title" [(ngModel)]="form.title" required />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea name="description" rows="4" placeholder="Describe your request..." [(ngModel)]="form.description" required></textarea>
        </div>

        <div class="form-group">
          <label>Priority</label>
          <select name="priority" [(ngModel)]="form.priority" required>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div class="form-group">
          <label>Requested By</label>
          <input name="requestedBy" placeholder="Your name" [(ngModel)]="form.requestedBy" required />
        </div>

        <div class="form-group">
          <label>Amount (if applicable)</label>
          <input name="amount" type="number" placeholder="Amount (if applicable)" [(ngModel)]="form.amount" />
        </div>

        <div class="form-group">
          <label>Currency</label>
          <select name="currency" [(ngModel)]="form.currency">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div class="form-group">
          <label>Due Date</label>
          <input name="dueDate" type="date" [(ngModel)]="form.dueDate" />
        </div>

        <button type="submit" class="submit-request-btn">Submit for Approval</button>
      </form>
    }
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }
      .submission-success {
        background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px;
        padding: 1.5rem; color: #15803d; font-size: 1.1rem; display: flex; align-items: center; gap: 1rem;
      }
      .new-request-btn { padding: 0.4rem 0.8rem; background: #fff; border: 1px solid #15803d; border-radius: 4px; color: #15803d; margin-left: auto; }
      .submit-form { max-width: 560px; display: flex; flex-direction: column; gap: 1rem; }
      .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
      .form-group label { font-weight: 600; font-size: 0.875rem; color: #374151; }
      .form-group input, .form-group select, .form-group textarea {
        padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;
        font-size: 0.9rem; font-family: inherit;
      }
      .submit-request-btn {
        padding: 0.65rem 1.5rem; background: #1e1b4b; color: #fff; border: none;
        border-radius: 6px; font-size: 1rem; font-weight: 600; align-self: flex-start;
      }
    `,
  ],
})
export class SubmitComponent {
  private readonly approvalService = inject(ApprovalService);

  submitted = signal(false);

  form = {
    type: 'expense' as ApprovalType,
    title: '',
    description: '',
    priority: 'normal' as ApprovalPriority,
    requestedBy: '',
    amount: undefined as number | undefined,
    currency: 'USD',
    dueDate: '',
  };

  submitRequest(): void {
    if (!this.form.title || !this.form.requestedBy || !this.form.description) {
      return;
    }
    this.approvalService.submit({
      type: this.form.type,
      title: this.form.title,
      description: this.form.description,
      priority: this.form.priority,
      requestedBy: this.form.requestedBy,
      status: 'pending',
      amount: this.form.amount,
      currency: this.form.currency,
      dueDate: this.form.dueDate ? new Date(this.form.dueDate) : undefined,
      tags: [],
    });
    this.submitted.set(true);
  }

  resetForm(): void {
    this.form = {
      type: 'expense',
      title: '',
      description: '',
      priority: 'normal',
      requestedBy: '',
      amount: undefined,
      currency: 'USD',
      dueDate: '',
    };
    this.submitted.set(false);
  }
}
