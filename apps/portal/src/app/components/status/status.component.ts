import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, DatePipe } from '@angular/common';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-status',
  imports: [AsyncPipe, NgClass, DatePipe],
  template: `
    <section class="status-page" aria-label="System status">
      <div class="page-header">
        <h1>System Status</h1>
        <button class="refresh-btn" (click)="statusService.refresh()" aria-label="Refresh status">
          ↻ Refresh
        </button>
      </div>

      <div
        class="overall-banner"
        [ngClass]="'banner-' + statusService.overallStatus"
        aria-label="Overall system status"
      >
        @if (statusService.overallStatus === 'operational') {
          <span>✅ All systems operational</span>
        } @else if (statusService.overallStatus === 'degraded') {
          <span>⚠️ Some services are experiencing degraded performance</span>
        } @else if (statusService.overallStatus === 'outage') {
          <span>🔴 Active outage — our team is working on a fix</span>
        } @else {
          <span>🔧 Scheduled maintenance in progress</span>
        }
      </div>

      <ul class="service-list" aria-label="Service status list">
        @for (svc of statusService.services$ | async; track svc.name) {
          <li class="service-row" [attr.aria-label]="svc.name + ': ' + svc.status">
            <span class="service-name">{{ svc.name }}</span>
            <span class="service-latency">{{ svc.latencyMs }} ms</span>
            <span class="service-status status-{{ svc.status }}">{{ svc.status }}</span>
            <span class="service-checked">Checked {{ svc.lastChecked | date: 'mediumTime' }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .status-page {
        max-width: 700px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }
      h1 {
        margin: 0;
        font-size: 1.75rem;
      }
      .refresh-btn {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 0.4rem 1rem;
        font-size: 0.875rem;
      }
      .overall-banner {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }
      .banner-operational {
        background: #dcfce7;
        color: #15803d;
      }
      .banner-degraded {
        background: #fef9c3;
        color: #854d0e;
      }
      .banner-outage {
        background: #fee2e2;
        color: #991b1b;
      }
      .banner-maintenance {
        background: #ede9fe;
        color: #6d28d9;
      }
      .service-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .service-row {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }
      .service-name {
        font-weight: 600;
      }
      .service-latency {
        font-size: 0.8rem;
        color: #64748b;
      }
      .service-status {
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
      }
      .status-operational {
        background: #dcfce7;
        color: #15803d;
      }
      .status-degraded {
        background: #fef9c3;
        color: #854d0e;
      }
      .status-outage {
        background: #fee2e2;
        color: #991b1b;
      }
      .status-maintenance {
        background: #ede9fe;
        color: #6d28d9;
      }
      .service-checked {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    `,
  ],
})
export class StatusComponent {
  readonly statusService = inject(StatusService);
}
