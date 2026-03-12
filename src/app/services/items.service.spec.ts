import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ItemsService } from './items.service';
import { StorageService } from './storage.service';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(ItemsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 4 initial items', () => {
    expect(service.items.length).toBe(4);
  });

  it('should add an item', () => {
    service.add({
      title: 'Test item',
      description: 'desc',
      category: 'test',
      priority: 'low',
      completed: false,
    });
    expect(service.items.length).toBe(5);
    expect(service.items.at(-1)?.title).toBe('Test item');
  });

  it('should toggle item completion', () => {
    const firstId = service.items[0].id;
    const initialState = service.items[0].completed;
    service.toggle(firstId);
    expect(service.items[0].completed).toBe(!initialState);
  });

  it('should remove an item', () => {
    const firstId = service.items[0].id;
    service.remove(firstId);
    expect(service.items.length).toBe(3);
    expect(service.items.find((i) => i.id === firstId)).toBeUndefined();
  });

  it('should group items by category', () => {
    const grouped = service.groupedByCategory();
    expect(grouped['design']).toHaveLength(1);
    expect(grouped['development']).toHaveLength(1);
  });

  it('should update an item', () => {
    const firstId = service.items[0].id;
    service.update(firstId, { title: 'Updated Title', priority: 'low' });
    const updated = service.items.find((i) => i.id === firstId)!;
    expect(updated.title).toBe('Updated Title');
    expect(updated.priority).toBe('low');
  });

  it('should not modify other items when updating', () => {
    const firstId = service.items[0].id;
    service.update(firstId, { title: 'Changed' });
    expect(service.items.length).toBe(4);
    expect(service.items[1].title).not.toBe('Changed');
  });

  it('should preserve createdAt when updating', () => {
    const item = service.items[0];
    const originalDate = item.createdAt;
    service.update(item.id, { title: 'New Title' });
    expect(service.items[0].createdAt).toEqual(originalDate);
  });

  it('should remove multiple items at once with removeMany', () => {
    const ids = [service.items[0].id, service.items[1].id];
    service.removeMany(ids);
    expect(service.items.length).toBe(2);
    for (const id of ids) {
      expect(service.items.find((i) => i.id === id)).toBeUndefined();
    }
  });

  it('should not remove other items when using removeMany', () => {
    const idToKeep = service.items[2].id;
    service.removeMany([service.items[0].id]);
    expect(service.items.find((i) => i.id === idToKeep)).toBeTruthy();
  });

  it('should mark multiple items as completed with completeMany', () => {
    const pendingIds = service.items.filter((i) => !i.completed).map((i) => i.id);
    service.completeMany(pendingIds);
    expect(service.items.every((i) => i.completed)).toBe(true);
  });

  it('should not affect non-targeted items in completeMany', () => {
    const firstItem = service.items[0]; // already completed
    service.completeMany([service.items[1].id]);
    // first item should remain unchanged
    expect(service.items.find((i) => i.id === firstItem.id)?.completed).toBe(firstItem.completed);
  });

  it('should compute overdueItems$ for past due uncompleted items', async () => {
    service.add({
      title: 'Overdue',
      description: '',
      category: 'test',
      priority: 'high',
      completed: false,
      dueDate: new Date('2020-01-01'),
    });
    const overdue = await firstValueFrom(service.overdueItems$);
    expect(overdue.some((i) => i.title === 'Overdue')).toBe(true);
  });

  it('should not include completed items in overdueItems$', async () => {
    service.add({
      title: 'CompletedOverdue',
      description: '',
      category: 'test',
      priority: 'high',
      completed: true,
      dueDate: new Date('2020-01-01'),
    });
    const overdue = await firstValueFrom(service.overdueItems$);
    expect(overdue.some((i) => i.title === 'CompletedOverdue')).toBe(false);
  });

  it('should persist items to storage on add', () => {
    const storageService = TestBed.inject(StorageService);
    service.add({
      title: 'Stored',
      description: '',
      category: 'c',
      priority: 'low',
      completed: false,
    });
    const stored = storageService.get<unknown[]>('appbench_items', []);
    expect(stored.length).toBe(5);
  });

  it('should persist items to storage on remove', () => {
    const storageService = TestBed.inject(StorageService);
    service.remove(service.items[0].id);
    const stored = storageService.get<unknown[]>('appbench_items', []);
    expect(stored.length).toBe(3);
  });

  it('should group items by priority', () => {
    const grouped = service.groupedByPriority();
    expect(grouped['high']).toBeDefined();
    expect(grouped['low']).toBeDefined();
  });

  it('should return formatted date string', () => {
    const item = service.items[0];
    expect(typeof service.getFormattedDate(item)).toBe('string');
    expect(service.getFormattedDate(item).length).toBeGreaterThan(0);
  });

  it('should support tags on items', () => {
    service.add({
      title: 'Tagged',
      description: '',
      category: 'c',
      priority: 'low',
      completed: false,
      tags: ['one', 'two'],
    });
    const added = service.items.find((i) => i.title === 'Tagged')!;
    expect(added.tags).toEqual(['one', 'two']);
  });
});
