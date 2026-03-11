import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetricsService } from '../../services/metrics.service';
import { AnalyticsAlert, AlertSeverity, AlertStatus } from '../../models/metrics.model';

type SeverityFilter = 'all' | AlertSeverity;
type StatusFilter = 'all' | AlertStatus;

@Component({
  selector: 'app-alerts',
  imports: [NgClass, DatePipe, FormsModule],
  template: `
    <h1>Analytics Alerts</h1>

    <div class="severity-tabs">
      @for (sev of severityFilters; track sev) {
        <button
          class="severity-tab"
          [ngClass]="{ active: activeSeverity() === sev }"
          (click)="activeSeverity.set(sev)">
          {{ sev === 'all' ? 'All' : sev }}
        </button>
      }
    </div>

    <div class="status-tabs">
      @for (st of statusFilters; track st) {
        <button
          class="status-tab"
          [ngClass]="{ active: activeStatus() === st }"
          (click)="activeStatus.set(st)">
          {{ st === 'all' ? 'All' : st }}
        </button>
      }
    </div>

    @if (showAddForm()) {
      <div class="add-form-panel">
        <h2>Create Alert</h2>
        <form (ngSubmit)="createAlert()">
          <input name="alertTitle" placeholder="Alert title" [(ngModel)]="newAlert.title" required />
          <select name="alertSeverity" [(ngModel)]="newAlert.severity">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <textarea name="alertDescription" placeholder="Description..." [(ngModel)]="newAlert.description" rows="3"></textarea>
          <div class="form-actions">
            <button type="submit" class="save-alert-btn">Create Alert</button>
            <button type="button" class="cancel-btn" (click)="showAddForm.set(false)">Cancel</button>
          </div>
        </form>
      </div>
    }

    <div class="alerts-list">
      @for (alert of filteredAlerts(); track alert.id) {
        <div class="alert-row sev-{{ alert.severity }}">
          <div class="alert-main">
            <span class="alert-title">{{ alert.title }}</span>
            <span class="alert-severity sev-badge-{{ alert.severity }}">{{ alert.severity }}</span>
            <span class="alert-status status-{{ alert.status }}">{{ alert.status }}</span>
          </div>
          <div class="alert-description">{{ alert.description }}</div>
          <div class="alert-meta">
            Created: {{ alert.createdAt | date: 'mediumDate' }}
            @if (alert.acknowledgedBy) {
              · Acknowledged by {{ alert.acknowledgedBy }}
            }
          </div>
          @if (alert.status === 'active') {
            <div class="alert-actions">
              <button class="ack-btn" (click)="acknowledge(alert.id)">Acknowledge</button>
              <button class="resolve-btn" (click)="resolve(alert.id)">Resolve</button>
            </div>
          }
          @if (alert.status === 'acknowledged') {
            <div class="alert-actions">
              <button class="resolve-btn" (click)="resolve(alert.id)">Resolve</button>
            </div>
          }
        </div>
      }
      @if (filteredAlerts().length === 0) {
        <p class="empty-state">No alerts match the current filters.</p>
      }
    </div>

    <div class="alerts-summary">
      {{ activeCount() }} active alerts, {{ criticalCount() }} critical
    </div>

    <button class="add-alert-btn" (click)="showAddForm.set(true)">+ Add Alert</button>
  `,
  styles: [
    `
      h1 { font-size: 1.5rem; margin-bottom: 1rem; }
      .severity-tabs, .status-tabs { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
      .severity-tab, .status-tab {
        padding: 0.35rem 0.8rem; border: 1px solid #d1d5db; border-radius: 20px;
        background: #f9fafb; font-size: 0.82rem; cursor: pointer; text-transform: capitalize;
      }
      .severity-tab.active, .status-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
      .alerts-list { display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0; }
      .alert-row {
        background: #fff; border: 1px solid #e5e7eb; border-left: 4px solid #6b7280;
        border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;
      }
      .sev-critical { border-left-color: #dc2626; }
      .sev-warning { border-left-color: #d97706; }
      .sev-info { border-left-color: #0369a1; }
      .alert-main { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
      .alert-title { font-weight: 700; flex: 1; min-width: 180px; }
      .sev-badge-critical { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #fee2e2; color: #dc2626; }
      .sev-badge-warning { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #fef3c7; color: #d97706; }
      .sev-badge-info { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #dbeafe; color: #1d4ed8; }
      .alert-status { padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
      .status-active { background: #fee2e2; color: #dc2626; }
      .status-acknowledged { background: #fef3c7; color: #d97706; }
      .status-resolved { background: #dcfce7; color: #15803d; }
      .alert-description { font-size: 0.875rem; color: #6b7280; }
      .alert-meta { font-size: 0.8rem; color: #9ca3af; }
      .alert-actions { display: flex; gap: 0.5rem; }
      .ack-btn { padding: 0.3rem 0.8rem; background: #fef3c7; color: #d97706; border: 1px solid #fde68a; border-radius: 4px; }
      .resolve-btn { padding: 0.3rem 0.8rem; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; border-radius: 4px; }
      .alerts-summary { font-weight: 600; color: #374151; margin-bottom: 0.75rem; }
      .add-alert-btn { padding: 0.6rem 1.2rem; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; }
      .add-form-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
      .add-form-panel h2 { margin-top: 0; }
      .add-form-panel form { display: flex; flex-direction: column; gap: 0.75rem; max-width: 420px; }
      .add-form-panel input, .add-form-panel select, .add-form-panel textarea {
        padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem; font-family: inherit;
      }
      .form-actions { display: flex; gap: 0.75rem; }
      .save-alert-btn { padding: 0.5rem 1rem; background: #1a1a2e; color: #fff; border: none; border-radius: 4px; }
      .cancel-btn { padding: 0.5rem 1rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; }
      .empty-state { color: #9ca3af; font-style: italic; }
    `,
  ],
})
export class AlertsComponent implements OnInit {
  private readonly metricsService = inject(MetricsService);

  activeSeverity = signal<SeverityFilter>('all');
  activeStatus = signal<StatusFilter>('all');
  showAddForm = signal(false);
  severityFilters: SeverityFilter[] = ['all', 'info', 'warning', 'critical'];
  statusFilters: StatusFilter[] = ['all', 'active', 'acknowledged', 'resolved'];

  private allAlerts: AnalyticsAlert[] = [];

  newAlert = {
    title: '',
    severity: 'warning' as AlertSeverity,
    description: '',
  };

  ngOnInit(): void {
    this.metricsService.alerts$.subscribe((a) => (this.allAlerts = a));
  }

  filteredAlerts(): AnalyticsAlert[] {
    let result = [...this.allAlerts];
    const sev = this.activeSeverity();
    if (sev !== 'all') result = result.filter((a) => a.severity === sev);
    const st = this.activeStatus();
    if (st !== 'all') result = result.filter((a) => a.status === st);
    return result;
  }

  activeCount(): number {
    return this.allAlerts.filter((a) => a.status === 'active').length;
  }

  criticalCount(): number {
    return this.allAlerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  }

  acknowledge(id: string): void {
    this.metricsService.acknowledgeAlert(id, 'Analyst');
  }

  resolve(id: string): void {
    this.metricsService.resolveAlert(id);
  }

  createAlert(): void {
    if (!this.newAlert.title) return;
    this.metricsService.addAlert({
      title: this.newAlert.title,
      description: this.newAlert.description,
      severity: this.newAlert.severity,
      status: 'active',
    });
    this.newAlert = { title: '', severity: 'warning', description: '' };
    this.showAddForm.set(false);
  }
}
