import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, AsyncPipe, NgClass],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <div class="notifications" aria-live="polite">
      @for (n of notificationService.notifications$ | async; track n.id) {
        <div class="toast" [ngClass]="'toast-' + n.type">{{ n.message }}</div>
      }
    </div>
  `,
  styles: [
    `
      .main-content {
        padding: 1rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .notifications {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
      }
      .toast {
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        color: white;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 240px;
      }
      .toast-success {
        background: #22c55e;
      }
      .toast-error {
        background: #ef4444;
      }
      .toast-warning {
        background: #f59e0b;
      }
      .toast-info {
        background: #3b82f6;
      }
    `,
  ],
})
export class App {
  notificationService = inject(NotificationService);
}
