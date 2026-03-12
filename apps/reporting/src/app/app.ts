import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="brand">AppBench Reporting</div>
      <ul class="nav-links">
        <li><a routerLink="/overview" routerLinkActive="active">Overview</a></li>
        <li><a routerLink="/reports" routerLinkActive="active">Reports</a></li>
        <li><a routerLink="/exports" routerLinkActive="active">Exports</a></li>
      </ul>
    </nav>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding: 0.75rem 2rem;
        background: #020617;
        border-bottom: 1px solid #1e293b;
      }
      .brand {
        font-weight: 700;
        font-size: 1.125rem;
        color: #38bdf8;
      }
      .nav-links {
        display: flex;
        gap: 1.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .nav-links a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .nav-links a.active {
        color: #e2e8f0;
        font-weight: 600;
      }
      .content {
        padding: 1.5rem 2rem;
        max-width: 1100px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppComponent {}
