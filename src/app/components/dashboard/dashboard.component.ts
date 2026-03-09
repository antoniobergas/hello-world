import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CounterComponent } from '../counter/counter.component';
import { GreetingComponent } from '../greeting/greeting.component';
import { ItemsService } from '../../services/items.service';
import { CounterService } from '../../services/counter.service';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, RouterLink, CounterComponent, GreetingComponent],
  template: `
    <section class="dashboard">
      <h1>Hello World — AppBench Dashboard</h1>
      <app-greeting name="developer" />

      <div class="stats">
        <div class="stat-card">
          <h3>Total Items</h3>
          <p class="stat-value">{{ (items$ | async)?.length ?? 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Completed</h3>
          <p class="stat-value">{{ completedCount$ | async }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending</h3>
          <p class="stat-value">{{ pendingCount$ | async }}</p>
        </div>
        <div class="stat-card">
          <h3>Counter</h3>
          <p class="stat-value">{{ counter$ | async }}</p>
        </div>
      </div>

      <div class="quick-actions">
        <a routerLink="/items" class="action-btn">Manage Items →</a>
      </div>

      <app-counter />
    </section>
  `,
  styles: [
    `
      .dashboard {
        padding: 1rem 0;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.75rem;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }
      .stat-card {
        background: #f1f5f9;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
      }
      .stat-card h3 {
        margin: 0 0 0.5rem;
        font-size: 0.875rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        color: #1e293b;
      }
      .quick-actions {
        margin: 1rem 0;
      }
      .action-btn {
        display: inline-block;
        padding: 0.5rem 1.25rem;
        background: #3b82f6;
        color: white;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
      }
      .action-btn:hover {
        background: #2563eb;
      }
    `,
  ],
})
export class DashboardComponent {
  private itemsService = inject(ItemsService);
  private counterService = inject(CounterService);

  readonly items$ = this.itemsService.items$;
  readonly completedCount$ = this.itemsService.completedCount$;
  readonly pendingCount$ = this.itemsService.pendingCount$;
  readonly counter$ = this.counterService.count$;
}
