import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../../services/items.service';
import { NotificationService } from '../../services/notification.service';
import { SearchPipe } from '../../pipes/search.pipe';
import { Item, Priority } from '../../models/item.model';

@Component({
  selector: 'app-item-list',
  imports: [AsyncPipe, NgClass, FormsModule, SearchPipe],
  template: `
    <section class="item-list">
      <div class="list-header">
        <h2>Items</h2>
        <input
          class="search-input"
          [(ngModel)]="searchQuery"
          placeholder="Search items…"
          aria-label="Search items"
        />
        <button class="add-btn" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Add Item' }}
        </button>
      </div>

      @if (showForm) {
        <form class="item-form" (ngSubmit)="submitItem()">
          <input [(ngModel)]="newTitle" name="title" placeholder="Title" required />
          <input [(ngModel)]="newDescription" name="description" placeholder="Description" />
          <select [(ngModel)]="newPriority" name="priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input [(ngModel)]="newCategory" name="category" placeholder="Category" />
          <button type="submit">Add</button>
        </form>
      }

      <ul class="items">
        @for (item of (items$ | async) | search : searchQuery; track item.id) {
          <li [ngClass]="{ completed: item.completed }" class="item-row">
            <label class="item-check">
              <input
                type="checkbox"
                [checked]="item.completed"
                (change)="toggle(item)"
              />
              <span class="item-title">{{ item.title }}</span>
            </label>
            <span class="item-meta">
              <span [ngClass]="'badge badge-' + item.priority">{{ item.priority }}</span>
              <span class="item-category">{{ item.category }}</span>
              <span class="item-date">{{ itemsService.getFormattedDate(item) }}</span>
            </span>
            <button class="remove-btn" (click)="remove(item)" aria-label="Remove item">
              ✕
            </button>
          </li>
        } @empty {
          <li class="empty">No items found.</li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .item-list {
        padding: 1rem 0;
      }
      .list-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .list-header h2 {
        margin: 0;
      }
      .search-input {
        padding: 0.4rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        flex: 1;
        min-width: 200px;
      }
      .add-btn {
        padding: 0.4rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      .item-form {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 8px;
      }
      .item-form input,
      .item-form select {
        padding: 0.4rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
      }
      .item-form button {
        padding: 0.4rem 1rem;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      .items {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .item-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .item-row.completed .item-title {
        text-decoration: line-through;
        color: #94a3b8;
      }
      .item-check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        cursor: pointer;
      }
      .item-meta {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .badge {
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .badge-high {
        background: #fee2e2;
        color: #dc2626;
      }
      .badge-medium {
        background: #fef3c7;
        color: #d97706;
      }
      .badge-low {
        background: #dcfce7;
        color: #16a34a;
      }
      .item-category {
        font-size: 0.75rem;
        color: #64748b;
      }
      .item-date {
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #94a3b8;
        font-size: 1rem;
        padding: 0.25rem;
      }
      .remove-btn:hover {
        color: #ef4444;
      }
      .empty {
        padding: 2rem;
        text-align: center;
        color: #94a3b8;
        font-style: italic;
      }
    `,
  ],
})
export class ItemListComponent {
  itemsService = inject(ItemsService);
  private notificationService = inject(NotificationService);

  readonly items$ = this.itemsService.items$;
  searchQuery = '';
  showForm = false;
  newTitle = '';
  newDescription = '';
  newCategory = 'general';
  newPriority: Priority = 'medium';

  toggle(item: Item): void {
    this.itemsService.toggle(item.id);
    const msg = item.completed
      ? `"${item.title}" marked as pending`
      : `"${item.title}" completed`;
    this.notificationService.show(msg, item.completed ? 'info' : 'success');
  }

  remove(item: Item): void {
    this.itemsService.remove(item.id);
    this.notificationService.show(`"${item.title}" removed`, 'warning');
  }

  submitItem(): void {
    if (!this.newTitle.trim()) return;
    this.itemsService.add({
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      category: this.newCategory.trim() || 'general',
      priority: this.newPriority,
      completed: false,
    });
    this.notificationService.show(`"${this.newTitle}" added`, 'success');
    this.newTitle = '';
    this.newDescription = '';
    this.newCategory = 'general';
    this.newPriority = 'medium';
    this.showForm = false;
  }
}
