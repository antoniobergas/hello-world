import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="brand-name">AppBench</span>
      </div>
      <ul class="nav-links">
        <li>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            Dashboard
          </a>
        </li>
        <li>
          <a routerLink="/items" routerLinkActive="active">Items</a>
        </li>
        <li>
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
        </li>
        <li>
          <a routerLink="/notifications" routerLinkActive="active">Notifications</a>
        </li>
        <li>
          <a routerLink="/preferences" routerLinkActive="active">Preferences</a>
        </li>
        <li>
          <a routerLink="/approvals" routerLinkActive="active">Approvals</a>
        </li>
        <li>
          <a routerLink="/analytics" routerLinkActive="active">Analytics</a>
        </li>
      </ul>
      <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="themeLabel">
        {{ themeService.isDark ? '☀️' : '🌙' }}
      </button>
    </nav>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        align-items: center;
        padding: 0.75rem 2rem;
        background: #1e293b;
        color: #f1f5f9;
        gap: 2rem;
      }
      .brand-name {
        font-size: 1.25rem;
        font-weight: 700;
      }
      .nav-links {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 1rem;
      }
      .nav-links a {
        color: #cbd5e1;
        text-decoration: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
      .nav-links a.active {
        color: #f1f5f9;
        background: #334155;
      }
      .theme-toggle {
        margin-left: auto;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.25rem;
      }
    `,
  ],
})
export class NavbarComponent {
  themeService = inject(ThemeService);

  get themeLabel(): string {
    return this.themeService.isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
