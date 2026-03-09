import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [AsyncPipe, NgClass],
  template: `
    <section class="notifications-page" aria-label="Notification center">
      <div class="page-header">
        <h2>
          Notifications
          @if ((notificationService.notifications$ | async)?.length; as count) {
            <span class="badge" aria-label="{{ count }} notifications">{{ count }}</span>
          }
        </h2>
        <button class="clear-btn" (click)="clearAll()" aria-label="Clear all notifications">
          Clear All
        </button>
      </div>

      <ul class="notification-list" aria-label="Notifications list">
        @for (notification of notificationService.notifications$ | async; track notification.id) {
          <li
            class="notification-item"
            [ngClass]="'notification-' + notification.type"
            [attr.aria-label]="notification.type + ' notification: ' + notification.message"
          >
            <span class="notification-type-badge">{{ notification.type }}</span>
            <span class="notification-message">{{ notification.message }}</span>
            <button
              class="dismiss-btn"
              (click)="notificationService.dismiss(notification.id)"
              [attr.aria-label]="'Dismiss notification: ' + notification.message"
            >
              ✕
            </button>
          </li>
        }
        @if ((notificationService.notifications$ | async)?.length === 0) {
          <li class="empty-state" aria-label="No notifications">No notifications</li>
        }
      </ul>

      <div class="demo-section" aria-label="Add sample notifications">
        <h3>Add Sample Notification</h3>
        <div class="demo-buttons">
          <button class="demo-btn success" (click)="addSample('success')">+ Success</button>
          <button class="demo-btn error" (click)="addSample('error')">+ Error</button>
          <button class="demo-btn info" (click)="addSample('info')">+ Info</button>
          <button class="demo-btn warning" (click)="addSample('warning')">+ Warning</button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .notifications-page {
        padding: 1.5rem;
        max-width: 700px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }
      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .badge {
        background: #3b82f6;
        color: white;
        border-radius: 999px;
        padding: 0.1rem 0.55rem;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .clear-btn {
        padding: 0.4rem 1rem;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
        cursor: pointer;
        background: #f8fafc;
      }
      .notification-list {
        list-style: none;
        padding: 0;
        margin: 0 0 1.5rem;
      }
      .notification-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        border: 1px solid #e2e8f0;
        background: white;
      }
      .notification-success { border-left: 4px solid #16a34a; }
      .notification-error { border-left: 4px solid #dc2626; }
      .notification-info { border-left: 4px solid #2563eb; }
      .notification-warning { border-left: 4px solid #d97706; }
      .notification-type-badge {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        min-width: 60px;
      }
      .notification-message {
        flex: 1;
        font-size: 0.95rem;
      }
      .dismiss-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #94a3b8;
        font-size: 0.875rem;
        padding: 0.2rem 0.4rem;
      }
      .dismiss-btn:hover { color: #475569; }
      .empty-state {
        color: #94a3b8;
        font-style: italic;
        padding: 1rem 0;
      }
      .demo-section {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        background: white;
      }
      h3 {
        margin: 0 0 0.75rem;
        font-size: 1rem;
        font-weight: 600;
        color: #334155;
      }
      .demo-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .demo-btn {
        padding: 0.35rem 0.85rem;
        border-radius: 4px;
        border: 1px solid transparent;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .demo-btn.success { background: #dcfce7; color: #16a34a; border-color: #86efac; }
      .demo-btn.error { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }
      .demo-btn.info { background: #dbeafe; color: #2563eb; border-color: #93c5fd; }
      .demo-btn.warning { background: #fef9c3; color: #d97706; border-color: #fde047; }
    `,
  ],
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);

  clearAll(): void {
    for (const n of this.notificationService.current) {
      this.notificationService.dismiss(n.id);
    }
  }

  addSample(type: 'success' | 'error' | 'info' | 'warning'): void {
    const messages = {
      success: 'Operation completed successfully.',
      error: 'An error occurred. Please try again.',
      info: 'Here is some useful information.',
      warning: 'Please review this warning.',
    };
    this.notificationService.show(messages[type], type, 10000);
  }
}
