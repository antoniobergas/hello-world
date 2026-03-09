import { TestBed } from '@angular/core/testing';
import { ItemListComponent } from './item-list.component';
import { ItemsService } from '../../services/items.service';
import { NotificationService } from '../../services/notification.service';

describe('ItemListComponent', () => {
  let itemsService: ItemsService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemListComponent],
    }).compileComponents();
    localStorage.clear();
    itemsService = TestBed.inject(ItemsService);
    notificationService = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render all 4 initial items', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(4);
  });

  it('should show the filter tabs', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.filter-tabs button');
    expect(tabs.length).toBe(3);
  });

  it('should show sort controls', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const sortSelect = fixture.nativeElement.querySelector('.filter-select[aria-label="Sort by"]');
    expect(sortSelect).toBeTruthy();
  });

  it('should show category and priority filter dropdowns', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const selects = fixture.nativeElement.querySelectorAll('.filter-select');
    expect(selects.length).toBeGreaterThanOrEqual(3); // category, priority, sort
  });

  it('should toggle the add form when the add button is clicked', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.showForm).toBe(false);
    const btn = fixture.nativeElement.querySelector('.add-btn') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.showForm).toBe(true);
  });

  it('should add an item via submitItem()', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.newTitle = 'New Task';
    comp.newDescription = 'Some description';
    comp.submitItem();
    fixture.detectChanges();
    expect(itemsService.items.find((i) => i.title === 'New Task')).toBeTruthy();
  });

  it('should not add an item when title is blank', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const initial = itemsService.items.length;
    fixture.componentInstance.newTitle = '   ';
    fixture.componentInstance.submitItem();
    expect(itemsService.items.length).toBe(initial);
  });

  it('should close the form and reset fields after submitting', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.showForm = true;
    comp.newTitle = 'Task X';
    comp.submitItem();
    fixture.detectChanges();
    expect(comp.showForm).toBe(false);
    expect(comp.newTitle).toBe('');
  });

  it('should add tags when provided in submitItem', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.componentInstance.newTitle = 'Tagged Task';
    fixture.componentInstance.newTags = 'alpha, beta, gamma';
    fixture.componentInstance.submitItem();
    const added = itemsService.items.find((i) => i.title === 'Tagged Task');
    expect(added?.tags).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('should remove an item via remove()', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const item = itemsService.items[0];
    fixture.componentInstance.remove(item);
    expect(itemsService.items.find((i) => i.id === item.id)).toBeUndefined();
  });

  it('should toggle item completion via toggle()', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const item = itemsService.items[1]; // second item starts as pending
    const initial = item.completed;
    fixture.componentInstance.toggle(item);
    expect(itemsService.items[1].completed).toBe(!initial);
  });

  it('should show only completed items when filter is "completed"', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    fixture.componentInstance.setStatusFilter('completed');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(1);
  });

  it('should show only pending items when filter is "pending"', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    fixture.componentInstance.setStatusFilter('pending');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(3);
  });

  it('should show all items when filter is reset to "all"', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    fixture.componentInstance.setStatusFilter('completed');
    fixture.detectChanges();
    fixture.componentInstance.setStatusFilter('all');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(4);
  });

  it('should filter by category', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    fixture.componentInstance.setCategoryFilter('design');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(1);
  });

  it('should filter by priority', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    fixture.componentInstance.setPriorityFilter('high');
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(2); // 2 high-priority items
  });

  it('should toggle sort direction', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.componentInstance.sortDirection.set('asc');
    fixture.componentInstance.toggleSortDirection();
    expect(fixture.componentInstance.sortDirection()).toBe('desc');
    fixture.componentInstance.toggleSortDirection();
    expect(fixture.componentInstance.sortDirection()).toBe('asc');
  });

  it('should start inline edit mode', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const item = itemsService.items[0];
    fixture.componentInstance.startEdit(item);
    expect(fixture.componentInstance.editingId).toBe(item.id);
    expect(fixture.componentInstance.editTitle).toBe(item.title);
  });

  it('should cancel inline edit', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const item = itemsService.items[0];
    fixture.componentInstance.startEdit(item);
    fixture.componentInstance.cancelEdit();
    expect(fixture.componentInstance.editingId).toBeNull();
  });

  it('should save inline edit and update item', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const item = itemsService.items[0];
    fixture.componentInstance.startEdit(item);
    fixture.componentInstance.editTitle = 'Edited Title';
    fixture.componentInstance.saveEdit(item);
    expect(itemsService.items[0].title).toBe('Edited Title');
    expect(fixture.componentInstance.editingId).toBeNull();
  });

  it('should not save edit with blank title', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const item = itemsService.items[0];
    const originalTitle = item.title;
    fixture.componentInstance.startEdit(item);
    fixture.componentInstance.editTitle = '';
    fixture.componentInstance.saveEdit(item);
    expect(itemsService.items[0].title).toBe(originalTitle);
  });

  it('should add item id to selectedIds on toggleSelect', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.componentInstance.toggleSelect('id1');
    expect(fixture.componentInstance.selectedIds.has('id1')).toBe(true);
  });

  it('should remove item id from selectedIds on second toggleSelect', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.componentInstance.toggleSelect('id1');
    fixture.componentInstance.toggleSelect('id1');
    expect(fixture.componentInstance.selectedIds.has('id1')).toBe(false);
  });

  it('should clear selection', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.componentInstance.toggleSelect('id1');
    fixture.componentInstance.toggleSelect('id2');
    fixture.componentInstance.clearSelection();
    expect(fixture.componentInstance.selectedIds.size).toBe(0);
  });

  it('should bulk delete selected items', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const id1 = itemsService.items[0].id;
    const id2 = itemsService.items[1].id;
    fixture.componentInstance.toggleSelect(id1);
    fixture.componentInstance.toggleSelect(id2);
    fixture.componentInstance.bulkDelete();
    expect(itemsService.items.length).toBe(2);
    expect(itemsService.items.find((i) => i.id === id1)).toBeUndefined();
    expect(fixture.componentInstance.selectedIds.size).toBe(0);
  });

  it('should bulk complete selected items', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const pendingItem = itemsService.items.find((i) => !i.completed)!;
    fixture.componentInstance.toggleSelect(pendingItem.id);
    fixture.componentInstance.bulkComplete();
    expect(itemsService.items.find((i) => i.id === pendingItem.id)?.completed).toBe(true);
    expect(fixture.componentInstance.selectedIds.size).toBe(0);
  });

  it('should emit a notification when removing an item', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const item = itemsService.items[0];
    fixture.componentInstance.remove(item);
    expect(notificationService.current.length).toBe(1);
    expect(notificationService.current[0].type).toBe('warning');
  });

  it('should detect overdue items correctly', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const overdueItem = {
      ...itemsService.items[0],
      dueDate: new Date('2020-01-01'),
      completed: false,
    };
    expect(fixture.componentInstance.isItemOverdue(overdueItem)).toBe(true);
  });

  it('should not flag completed items as overdue', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const item = { ...itemsService.items[0], dueDate: new Date('2020-01-01'), completed: true };
    expect(fixture.componentInstance.isItemOverdue(item)).toBe(false);
  });

  it('should format due date via formatDue()', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    const result = fixture.componentInstance.formatDue(new Date('2025-06-15'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
