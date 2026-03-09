import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemsService } from '../../services/items.service';
import { StatsService } from '../../services/stats.service';
import { NotificationService } from '../../services/notification.service';
import { FuzzySearchService } from '../../services/fuzzy-search.service';
import { SortPipe, SortField, SortDirection } from '../../pipes/sort.pipe';
import { Item, Priority } from '../../models/item.model';
import { isOverdue, formatDueDate } from '../../utils/format';

type StatusFilter = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-item-list',
  imports: [AsyncPipe, NgClass, FormsModule, SortPipe],
  template: `
    <section class="item-list">
      <!-- Header row -->
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

      <!-- Filter & sort toolbar -->
      <div class="toolbar">
        <!-- Status tabs -->
        <div class="filter-tabs">
          <button [class.active]="statusFilter === 'all'" (click)="setStatusFilter('all')">
            All
          </button>
          <button [class.active]="statusFilter === 'pending'" (click)="setStatusFilter('pending')">
            Pending
          </button>
          <button
            [class.active]="statusFilter === 'completed'"
            (click)="setStatusFilter('completed')"
          >
            Completed
          </button>
        </div>

        <!-- Category filter -->
        <select
          class="filter-select"
          [(ngModel)]="categoryFilter"
          (ngModelChange)="setCategoryFilter($event)"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          @for (cat of categories$ | async; track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>

        <!-- Priority filter -->
        <select
          class="filter-select"
          [(ngModel)]="priorityFilter"
          (ngModelChange)="setPriorityFilter($event)"
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <!-- Sort controls -->
        <select
          class="filter-select"
          [ngModel]="sortField()"
          (ngModelChange)="setSortField($event)"
          aria-label="Sort by"
        >
          <option value="createdAt">Date</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due date</option>
        </select>
        <button
          class="sort-dir-btn"
          (click)="toggleSortDirection()"
          [title]="sortDirection() === 'asc' ? 'Ascending' : 'Descending'"
        >
          {{ sortDirection() === 'asc' ? '↑' : '↓' }}
        </button>
      </div>

      <!-- Bulk action bar -->
      @if (selectedIds.size > 0) {
        <div class="bulk-bar">
          <span>{{ selectedIds.size }} selected</span>
          <button class="bulk-btn complete-btn" (click)="bulkComplete()">✔ Complete</button>
          <button class="bulk-btn delete-btn" (click)="bulkDelete()">🗑 Delete</button>
          <button class="bulk-btn" (click)="clearSelection()">Clear selection</button>
        </div>
      }

      <!-- Add item form -->
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
          <input [(ngModel)]="newDueDate" name="dueDate" type="date" placeholder="Due date" />
          <input [(ngModel)]="newTags" name="tags" placeholder="Tags (comma-separated)" />
          <button type="submit">Add</button>
        </form>
      }

      <!-- Items list -->
      <ul class="items">
        @for (
          item of filteredItems$ | async | sortItems: sortField() : sortDirection();
          track item.id
        ) {
          <!-- Edit mode -->
          @if (editingId === item.id) {
            <li class="item-row item-edit-row">
              <form class="inline-edit-form" (ngSubmit)="saveEdit(item)">
                <input [(ngModel)]="editTitle" name="editTitle" placeholder="Title" required />
                <input
                  [(ngModel)]="editDescription"
                  name="editDescription"
                  placeholder="Description"
                />
                <select [(ngModel)]="editPriority" name="editPriority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input [(ngModel)]="editCategory" name="editCategory" placeholder="Category" />
                <input [(ngModel)]="editDueDate" name="editDueDate" type="date" />
                <button type="submit" class="save-btn">Save</button>
                <button type="button" class="cancel-btn" (click)="cancelEdit()">Cancel</button>
              </form>
            </li>
          } @else {
            <!-- View mode -->
            <li
              [ngClass]="{ completed: item.completed, overdue: isItemOverdue(item) }"
              class="item-row"
            >
              <input
                class="row-checkbox"
                type="checkbox"
                [checked]="selectedIds.has(item.id)"
                (change)="toggleSelect(item.id)"
                aria-label="Select item"
              />
              <label class="item-check">
                <input type="checkbox" [checked]="item.completed" (change)="toggle(item)" />
                <span class="item-title">{{ item.title }}</span>
              </label>
              <span class="item-meta">
                <span [ngClass]="'badge badge-' + item.priority">{{ item.priority }}</span>
                <span class="item-category">{{ item.category }}</span>
                @if (item.dueDate) {
                  <span class="item-due" [ngClass]="{ 'due-overdue': isItemOverdue(item) }"
                    >Due {{ formatDue(item.dueDate) }}</span
                  >
                }
                @if (item.tags?.length) {
                  @for (tag of item.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                }
                <span class="item-date">{{ itemsService.getFormattedDate(item) }}</span>
              </span>
              <div class="row-actions">
                <button class="edit-btn" (click)="startEdit(item)" aria-label="Edit item">
                  ✏️
                </button>
                <button class="remove-btn" (click)="remove(item)" aria-label="Remove item">
                  ✕
                </button>
              </div>
            </li>
          }
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
      .toolbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .filter-tabs {
        display: flex;
        gap: 0.5rem;
      }
      .filter-tabs button {
        padding: 0.25rem 0.75rem;
        border: 1px solid #cbd5e1;
        background: transparent;
        border-radius: 9999px;
        cursor: pointer;
        font-size: 0.875rem;
        color: #64748b;
      }
      .filter-tabs button.active {
        background: #1e293b;
        border-color: #1e293b;
        color: white;
      }
      .filter-select {
        padding: 0.25rem 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.875rem;
        background: white;
        color: #1e293b;
      }
      .sort-dir-btn {
        padding: 0.25rem 0.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 1rem;
      }
      .bulk-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        background: #fef3c7;
        border: 1px solid #fcd34d;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #92400e;
      }
      .bulk-btn {
        padding: 0.25rem 0.75rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        background: #1e293b;
        color: white;
      }
      .complete-btn {
        background: #22c55e;
      }
      .delete-btn {
        background: #ef4444;
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
      .item-row.overdue {
        border-color: #fca5a5;
        background: #fff5f5;
      }
      .item-row.completed .item-title {
        text-decoration: line-through;
        color: #94a3b8;
      }
      .row-checkbox {
        flex-shrink: 0;
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
        flex-wrap: wrap;
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
      .item-due {
        font-size: 0.75rem;
        color: #64748b;
      }
      .due-overdue {
        color: #dc2626;
        font-weight: 600;
      }
      .tag {
        font-size: 0.7rem;
        padding: 0.1rem 0.4rem;
        background: #e0f2fe;
        color: #0369a1;
        border-radius: 9999px;
      }
      .row-actions {
        display: flex;
        gap: 0.25rem;
      }
      .remove-btn,
      .edit-btn {
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
      .edit-btn:hover {
        color: #3b82f6;
      }
      .item-edit-row {
        flex-direction: column;
        align-items: stretch;
      }
      .inline-edit-form {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        width: 100%;
      }
      .inline-edit-form input,
      .inline-edit-form select {
        padding: 0.3rem 0.6rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.875rem;
      }
      .save-btn {
        padding: 0.3rem 0.75rem;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      .cancel-btn {
        padding: 0.3rem 0.75rem;
        background: #94a3b8;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
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
  private fuzzySearch = inject(FuzzySearchService);
  readonly categories$ = inject(StatsService).categories$;

  // --- filter state ---
  private statusFilterSubject = new BehaviorSubject<StatusFilter>('all');
  statusFilter: StatusFilter = 'all';
  categoryFilter = '';
  private categoryFilterSubject = new BehaviorSubject<string>('');
  priorityFilter = '';
  private priorityFilterSubject = new BehaviorSubject<string>('');

  // --- sort state (signals — required for zoneless change detection) ---
  sortField = signal<SortField>('createdAt');
  sortDirection = signal<SortDirection>('asc');

  // --- search (reactive BehaviorSubject in combineLatest) ---
  private searchQuerySubject = new BehaviorSubject<string>('');
  private _searchQuery = '';
  get searchQuery(): string {
    return this._searchQuery;
  }
  set searchQuery(value: string) {
    this._searchQuery = value;
    this.searchQuerySubject.next(value);
  }

  readonly filteredItems$ = combineLatest([
    this.itemsService.items$,
    this.statusFilterSubject,
    this.categoryFilterSubject,
    this.priorityFilterSubject,
    this.searchQuerySubject,
  ]).pipe(
    map(([items, status, category, priority, query]) => {
      let result = items;
      if (status === 'pending') result = result.filter((i) => !i.completed);
      else if (status === 'completed') result = result.filter((i) => i.completed);
      if (category) result = result.filter((i) => i.category === category);
      if (priority) result = result.filter((i) => i.priority === priority);
      if (query.trim()) result = this.fuzzySearch.search(result, query);
      return result;
    }),
  );

  // --- add form state ---
  showForm = false;
  newTitle = '';
  newDescription = '';
  newCategory = 'general';
  newPriority: Priority = 'medium';
  newDueDate = '';
  newTags = '';

  // --- edit state ---
  editingId: string | null = null;
  editTitle = '';
  editDescription = '';
  editPriority: Priority = 'medium';
  editCategory = '';
  editDueDate = '';

  // --- bulk select state ---
  selectedIds = new Set<string>();

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
    this.statusFilterSubject.next(filter);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter = category;
    this.categoryFilterSubject.next(category);
  }

  setPriorityFilter(priority: string): void {
    this.priorityFilter = priority;
    this.priorityFilterSubject.next(priority);
  }

  setSortField(field: SortField): void {
    this.sortField.set(field);
  }

  toggleSortDirection(): void {
    this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    // trigger change detection by reassigning
    this.selectedIds = new Set(this.selectedIds);
  }

  clearSelection(): void {
    this.selectedIds = new Set();
  }

  bulkDelete(): void {
    const count = this.selectedIds.size;
    this.itemsService.removeMany([...this.selectedIds]);
    this.notificationService.show(`${count} item(s) deleted`, 'warning');
    this.clearSelection();
  }

  bulkComplete(): void {
    const count = this.selectedIds.size;
    this.itemsService.completeMany([...this.selectedIds]);
    this.notificationService.show(`${count} item(s) marked complete`, 'success');
    this.clearSelection();
  }

  toggle(item: Item): void {
    this.itemsService.toggle(item.id);
    const msg = item.completed ? `"${item.title}" marked as pending` : `"${item.title}" completed`;
    this.notificationService.show(msg, item.completed ? 'info' : 'success');
  }

  remove(item: Item): void {
    this.itemsService.remove(item.id);
    this.notificationService.show(`"${item.title}" removed`, 'warning');
  }

  startEdit(item: Item): void {
    this.editingId = item.id;
    this.editTitle = item.title;
    this.editDescription = item.description;
    this.editPriority = item.priority;
    this.editCategory = item.category;
    this.editDueDate = item.dueDate ? item.dueDate.toISOString().split('T')[0] : '';
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(item: Item): void {
    if (!this.editTitle.trim()) return;
    const changes: Partial<Omit<Item, 'id' | 'createdAt'>> = {
      title: this.editTitle.trim(),
      description: this.editDescription.trim(),
      priority: this.editPriority,
      category: this.editCategory.trim() || 'general',
      dueDate: this.editDueDate ? new Date(this.editDueDate) : undefined,
    };
    this.itemsService.update(item.id, changes);
    this.notificationService.show(`"${changes.title}" updated`, 'info');
    this.cancelEdit();
  }

  submitItem(): void {
    if (!this.newTitle.trim()) return;
    const tags = this.newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    this.itemsService.add({
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      category: this.newCategory.trim() || 'general',
      priority: this.newPriority,
      completed: false,
      dueDate: this.newDueDate ? new Date(this.newDueDate) : undefined,
      tags: tags.length ? tags : undefined,
    });
    this.notificationService.show(`"${this.newTitle}" added`, 'success');
    this.newTitle = '';
    this.newDescription = '';
    this.newCategory = 'general';
    this.newPriority = 'medium';
    this.newDueDate = '';
    this.newTags = '';
    this.showForm = false;
  }

  isItemOverdue(item: Item): boolean {
    return !!item.dueDate && isOverdue(item.dueDate, item.completed);
  }

  formatDue(date: Date): string {
    return formatDueDate(date);
  }
}
