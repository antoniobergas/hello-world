import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, DatePipe, UpperCasePipe } from '@angular/common';
import { RbacService } from '../../services/rbac.service';
import { AuditLogService } from '../../services/audit-log.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { HealthCheckService } from '../../services/health-check.service';
import { BackgroundJobService } from '../../services/background-job.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-admin',
  imports: [AsyncPipe, NgClass, DatePipe, UpperCasePipe],
  template: `
    <section class="admin-page">
      <h2>Enterprise Admin</h2>

      <!-- RBAC Section -->
      <div class="admin-section" aria-label="RBAC section">
        <h3>Role Management</h3>
        <div class="role-info">
          <span class="role-label">Current Role:</span>
          <span class="role-value" [ngClass]="'role-' + (rbac.currentUser$ | async)?.role">
            {{ (rbac.currentUser$ | async)?.role | uppercase }}
          </span>
        </div>
        <div class="role-buttons">
          @for (role of rbac.getAllRoles(); track role) {
            <button
              class="role-btn"
              [class.active]="(rbac.currentRole$ | async) === role"
              (click)="rbac.setRole(role)"
              [attr.aria-label]="'Switch to ' + role + ' role'"
            >
              {{ role }}
            </button>
          }
        </div>
      </div>

      <!-- Feature Flags Section -->
      <div class="admin-section" aria-label="Feature flags section">
        <h3>Feature Flags</h3>
        <ul class="flag-list">
          @for (flag of featureFlags.flags$ | async; track flag.key) {
            <li class="flag-item" [attr.data-flag-key]="flag.key">
              <span class="flag-name">{{ flag.name }}</span>
              <span class="flag-desc">{{ flag.description }}</span>
              <button
                class="flag-toggle"
                [class.enabled]="flag.enabled"
                (click)="featureFlags.toggle(flag.key)"
                [attr.aria-label]="'Toggle ' + flag.name"
              >
                {{ flag.enabled ? 'ON' : 'OFF' }}
              </button>
            </li>
          }
        </ul>
      </div>

      <!-- Health Check Section -->
      <div class="admin-section" aria-label="Health check section">
        <h3>System Health</h3>
        <div class="health-status" [ngClass]="'health-' + (health.status$ | async)">
          Overall: {{ health.status$ | async | uppercase }}
        </div>
        <button class="refresh-btn" (click)="health.check()">Refresh Health</button>
        <ul class="indicator-list">
          @for (indicator of (health.report$ | async)?.indicators; track indicator.name) {
            <li class="indicator-item" [ngClass]="'indicator-' + indicator.status">
              <span class="indicator-name">{{ indicator.name }}</span>
              <span class="indicator-status">{{ indicator.status }}</span>
              <span class="indicator-message">{{ indicator.message }}</span>
            </li>
          }
        </ul>
      </div>

      <!-- Background Jobs Section -->
      <div class="admin-section" aria-label="Background jobs section">
        <h3>Background Jobs</h3>
        <div class="job-controls">
          <button class="run-job-btn" (click)="enqueueExportJob()">Run Export Job</button>
          <button class="clear-jobs-btn" (click)="jobs.clearCompleted()">Clear Completed</button>
        </div>
        <ul class="job-list">
          @for (job of jobs.jobs$ | async; track job.id) {
            <li class="job-item" [ngClass]="'job-' + job.status">
              <span class="job-name">{{ job.name }}</span>
              <span class="job-status">{{ job.status }}</span>
              <span class="job-progress">{{ job.progress }}%</span>
            </li>
          }
          @if ((jobs.jobs$ | async)?.length === 0) {
            <li class="no-jobs">No jobs</li>
          }
        </ul>
      </div>

      <!-- Audit Log Section -->
      <div class="admin-section" aria-label="Audit log section">
        <h3>Audit Log</h3>
        <button class="clear-audit-btn" (click)="audit.clear()">Clear Log</button>
        <ul class="audit-list">
          @for (entry of audit.recentEntries$ | async; track entry.id) {
            <li class="audit-entry">
              <span class="audit-action">{{ entry.action }}</span>
              <span class="audit-resource">{{ entry.resource }}</span>
              <span class="audit-user">{{ entry.username }}</span>
              <span class="audit-time">{{ entry.timestamp | date: 'HH:mm:ss' }}</span>
            </li>
          }
          @if ((audit.recentEntries$ | async)?.length === 0) {
            <div class="no-entries">No audit entries</div>
          }
        </ul>
      </div>

      <!-- Config Section -->
      <div class="admin-section" aria-label="Config section">
        <h3>Configuration</h3>
        <div class="config-item">
          <span class="config-key">Environment</span>
          <span class="config-value env-badge">{{ config.get('environment') }}</span>
        </div>
        <div class="config-item">
          <span class="config-key">API Base URL</span>
          <span class="config-value">{{ config.get('apiBaseUrl') }}</span>
        </div>
        <div class="config-item">
          <span class="config-key">Max Items Per Page</span>
          <span class="config-value">{{ config.get('maxItemsPerPage') }}</span>
        </div>
        <div class="config-item">
          <span class="config-key">Debug Mode</span>
          <span class="config-value">{{
            config.get('enableDebugMode') ? 'Enabled' : 'Disabled'
          }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .admin-page {
        padding: 1.5rem;
        max-width: 900px;
        margin: 0 auto;
      }
      h2 {
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .admin-section {
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
      .role-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .role-value {
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 4px;
        background: #f1f5f9;
      }
      .role-admin {
        color: #dc2626;
      }
      .role-editor {
        color: #d97706;
      }
      .role-viewer {
        color: #2563eb;
      }
      .role-buttons {
        display: flex;
        gap: 0.5rem;
      }
      .role-btn {
        padding: 0.4rem 0.8rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        cursor: pointer;
        background: white;
      }
      .role-btn.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      .flag-list,
      .audit-list,
      .job-list,
      .indicator-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .flag-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .flag-name {
        font-weight: 600;
        min-width: 140px;
      }
      .flag-desc {
        color: #64748b;
        font-size: 0.875rem;
        flex: 1;
      }
      .flag-toggle {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        border: 1px solid #cbd5e1;
        cursor: pointer;
        background: #fee2e2;
        color: #dc2626;
        font-weight: 600;
      }
      .flag-toggle.enabled {
        background: #dcfce7;
        color: #16a34a;
      }
      .health-status {
        font-weight: 700;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        display: inline-block;
        margin-bottom: 0.75rem;
      }
      .health-healthy {
        background: #dcfce7;
        color: #16a34a;
      }
      .health-degraded {
        background: #fef9c3;
        color: #ca8a04;
      }
      .health-unhealthy {
        background: #fee2e2;
        color: #dc2626;
      }
      .indicator-item {
        display: flex;
        gap: 1rem;
        padding: 0.4rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .indicator-name {
        font-weight: 600;
        min-width: 100px;
      }
      .indicator-healthy {
        color: #16a34a;
      }
      .indicator-degraded {
        color: #ca8a04;
      }
      .indicator-unhealthy {
        color: #dc2626;
      }
      .refresh-btn,
      .run-job-btn,
      .clear-jobs-btn,
      .clear-audit-btn {
        margin-bottom: 0.75rem;
        padding: 0.4rem 1rem;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
        cursor: pointer;
        background: #f8fafc;
        margin-right: 0.5rem;
      }
      .job-item {
        display: flex;
        gap: 1rem;
        padding: 0.4rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .job-name {
        font-weight: 600;
        flex: 1;
      }
      .job-completed {
        color: #16a34a;
      }
      .job-running {
        color: #2563eb;
      }
      .job-failed {
        color: #dc2626;
      }
      .job-pending {
        color: #64748b;
      }
      .no-jobs,
      .no-entries {
        color: #94a3b8;
        padding: 0.5rem 0;
        font-style: italic;
      }
      .audit-entry {
        display: flex;
        gap: 0.75rem;
        padding: 0.4rem 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.875rem;
      }
      .audit-action {
        font-weight: 600;
        min-width: 80px;
      }
      .audit-resource {
        color: #475569;
        min-width: 80px;
      }
      .audit-user {
        color: #2563eb;
        min-width: 60px;
      }
      .audit-time {
        color: #94a3b8;
      }
      .config-item {
        display: flex;
        gap: 1rem;
        padding: 0.4rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .config-key {
        font-weight: 600;
        min-width: 160px;
      }
      .config-value {
        color: #475569;
      }
      .env-badge {
        font-weight: 600;
        padding: 0.1rem 0.5rem;
        border-radius: 4px;
        background: #e0f2fe;
        color: #0369a1;
      }
    `,
  ],
})
export class AdminComponent {
  rbac = inject(RbacService);
  audit = inject(AuditLogService);
  featureFlags = inject(FeatureFlagService);
  health = inject(HealthCheckService);
  jobs = inject(BackgroundJobService);
  config = inject(ConfigService);

  enqueueExportJob(): void {
    this.jobs.enqueue('export', 'Export Items to CSV', { format: 'csv' });
    this.audit.log('user-001', 'admin', 'EXPORT', 'jobs', 'Enqueued export job');
  }
}
