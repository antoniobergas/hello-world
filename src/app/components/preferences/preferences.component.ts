import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';

@Component({
  selector: 'app-preferences',
  imports: [AsyncPipe, FormsModule],
  template: `
    <section class="preferences-page" aria-label="User preferences">
      <h2>User Preferences</h2>

      @if (preferencesService.preferences$ | async; as prefs) {
        <!-- Theme Section -->
        <div class="pref-section" aria-label="Theme settings">
          <h3>Theme</h3>
          <div class="theme-options">
            @for (option of themeOptions; track option) {
              <label class="radio-label">
                <input
                  type="radio"
                  name="theme"
                  [value]="option"
                  [checked]="prefs.theme === option"
                  (change)="setTheme(option)"
                  [attr.aria-label]="'Set theme to ' + option"
                />
                {{ option }}
              </label>
            }
          </div>
        </div>

        <!-- Items Per Page Section -->
        <div class="pref-section" aria-label="Items per page settings">
          <h3>Items Per Page</h3>
          <div class="input-row">
            <input
              type="number"
              [value]="prefs.itemsPerPage"
              min="10"
              max="100"
              class="number-input"
              aria-label="Items per page"
              (change)="setItemsPerPage($event)"
            />
            <span class="hint">Min: 10 · Max: 100</span>
          </div>
        </div>

        <!-- Notifications Section -->
        <div class="pref-section" aria-label="Notification settings">
          <h3>Notifications</h3>
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="prefs.notifications.email"
              (change)="toggleNotification('email', $event)"
              aria-label="Toggle email notifications"
            />
            Email Notifications
          </label>
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="prefs.notifications.push"
              (change)="toggleNotification('push', $event)"
              aria-label="Toggle push notifications"
            />
            Push Notifications
          </label>
        </div>

        <!-- Read-only Info Section -->
        <div class="pref-section" aria-label="Additional settings">
          <h3>Additional Settings</h3>
          <div class="info-row">
            <span class="info-key">Language</span>
            <span class="info-value">{{ prefs.language }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Timezone</span>
            <span class="info-value">{{ prefs.timezone }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Date Format</span>
            <span class="info-value">{{ prefs.dateFormat }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Dashboard Layout</span>
            <span class="info-value">{{ prefs.dashboardLayout }}</span>
          </div>
        </div>
      }

      <div class="footer-actions">
        <button class="reset-btn" (click)="preferencesService.resetToDefaults()" aria-label="Reset to defaults">
          Reset to Defaults
        </button>
      </div>
    </section>
  `,
  styles: [
    `
      .preferences-page {
        padding: 1.5rem;
        max-width: 600px;
        margin: 0 auto;
      }
      h2 {
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .pref-section {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1.25rem;
        background: white;
      }
      h3 {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: #334155;
      }
      .theme-options {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .radio-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        cursor: pointer;
      }
      .input-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .number-input {
        width: 80px;
        padding: 0.35rem 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-size: 1rem;
      }
      .hint {
        font-size: 0.8rem;
        color: #94a3b8;
      }
      .toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
      .info-row {
        display: flex;
        gap: 1rem;
        padding: 0.35rem 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .info-key {
        font-weight: 600;
        min-width: 140px;
        color: #475569;
      }
      .info-value {
        color: #1e293b;
      }
      .footer-actions {
        margin-top: 0.5rem;
      }
      .reset-btn {
        padding: 0.5rem 1.25rem;
        border-radius: 4px;
        border: 1px solid #cbd5e1;
        cursor: pointer;
        background: #f8fafc;
        font-size: 0.95rem;
      }
      .reset-btn:hover {
        background: #f1f5f9;
      }
    `,
  ],
})
export class PreferencesComponent {
  preferencesService = inject(PreferencesService);

  readonly themeOptions: Array<UserPreferences['theme']> = ['light', 'dark', 'system'];

  setTheme(theme: UserPreferences['theme']): void {
    this.preferencesService.setPreference('theme', theme);
  }

  setItemsPerPage(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    const clamped = Math.min(100, Math.max(10, value));
    this.preferencesService.setPreference('itemsPerPage', clamped);
  }

  toggleNotification(channel: 'email' | 'push', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.preferencesService.preferences.notifications;
    this.preferencesService.setPreference('notifications', { ...current, [channel]: checked });
  }
}
