import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="brand">AppBench Approvals</div>
      <ul class="nav-links">
        <li><a routerLink="/queue" routerLinkActive="active">Queue</a></li>
        <li><a routerLink="/submit" routerLinkActive="active">Submit Request</a></li>
        <li><a routerLink="/history" routerLinkActive="active">History</a></li>
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
        background: #1e1b4b;
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
        color: #c7d2fe;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .nav-links a.active {
        color: #ffffff;
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
