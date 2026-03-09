import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="brand">AppBench Portal</div>
      <ul class="nav-links">
        <li><a routerLink="/tickets" routerLinkActive="active">My Tickets</a></li>
        <li><a routerLink="/kb" routerLinkActive="active">Knowledge Base</a></li>
        <li><a routerLink="/status" routerLinkActive="active">System Status</a></li>
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
        background: #0f172a;
        color: #f1f5f9;
      }
      .brand {
        font-weight: 700;
        font-size: 1.125rem;
      }
      .nav-links {
        display: flex;
        gap: 1.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .nav-links a {
        color: #cbd5e1;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .nav-links a.active {
        color: #38bdf8;
        font-weight: 600;
      }
      .content {
        padding: 1.5rem 2rem;
        max-width: 900px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppComponent {}
