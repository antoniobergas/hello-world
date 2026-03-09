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
    itemsService = TestBed.inject(ItemsService);
    notificationService = TestBed.inject(NotificationService);
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
    // Initial data has exactly 1 completed item
    const rows = fixture.nativeElement.querySelectorAll('.item-row');
    expect(rows.length).toBe(1);
  });

  it('should show only pending items when filter is "pending"', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    fixture.componentInstance.setStatusFilter('pending');
    fixture.detectChanges();
    // Initial data has 3 pending items
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

  it('should emit a notification when removing an item', () => {
    const fixture = TestBed.createComponent(ItemListComponent);
    fixture.detectChanges();
    const item = itemsService.items[0];
    fixture.componentInstance.remove(item);
    expect(notificationService.current.length).toBe(1);
    expect(notificationService.current[0].type).toBe('warning');
  });
});
