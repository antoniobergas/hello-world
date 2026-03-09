import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { StatsService } from './stats.service';
import { ItemsService } from './items.service';

describe('StatsService', () => {
  let service: StatsService;
  let itemsService: ItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = TestBed.inject(StatsService);
    itemsService = TestBed.inject(ItemsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute completionRate$ as a percentage (25% for 1/4 initial)', async () => {
    const rate = await firstValueFrom(service.completionRate$);
    expect(rate).toBe(25);
  });

  it('should return 0 completion rate when no items', async () => {
    for (const item of [...itemsService.items]) {
      itemsService.remove(item.id);
    }
    const rate = await firstValueFrom(service.completionRate$);
    expect(rate).toBe(0);
  });

  it('should return 100 when all items completed', async () => {
    for (const item of itemsService.items) {
      if (!item.completed) itemsService.toggle(item.id);
    }
    const rate = await firstValueFrom(service.completionRate$);
    expect(rate).toBe(100);
  });

  it('should compute categoryStats$ with per-category totals', async () => {
    const stats = await firstValueFrom(service.categoryStats$);
    const catNames = stats.map((s) => s.category);
    expect(catNames).toContain('design');
    expect(catNames).toContain('development');
  });

  it('should reflect completed count in categoryStats$', async () => {
    const stats = await firstValueFrom(service.categoryStats$);
    const design = stats.find((s) => s.category === 'design');
    expect(design?.completed).toBe(1);
    expect(design?.total).toBe(1);
  });

  it('should list distinct categories in categories$', async () => {
    const cats = await firstValueFrom(service.categories$);
    expect(cats.length).toBeGreaterThan(0);
    expect([...new Set(cats)].length).toBe(cats.length);
  });

  it('should count overdue items correctly', async () => {
    itemsService.add({
      title: 'Overdue task',
      description: '',
      category: 'test',
      priority: 'high',
      completed: false,
      dueDate: new Date('2020-01-01'),
    });
    const count = await firstValueFrom(service.overdueCount$);
    expect(count).toBeGreaterThan(0);
  });

  it('should not count completed items as overdue', async () => {
    itemsService.add({
      title: 'Completed overdue',
      description: '',
      category: 'test',
      priority: 'low',
      completed: true,
      dueDate: new Date('2020-01-01'),
    });
    const count = await firstValueFrom(service.overdueCount$);
    const expected = itemsService.items.filter(
      (i) => !i.completed && i.dueDate !== undefined && i.dueDate < new Date(),
    ).length;
    expect(count).toBe(expected);
  });

  it('should update completionRate$ when an item is toggled', async () => {
    const before = await firstValueFrom(service.completionRate$);
    // toggle a pending item to completed
    const pendingItem = itemsService.items.find((i) => !i.completed)!;
    itemsService.toggle(pendingItem.id);
    const after = await firstValueFrom(service.completionRate$);
    expect(after).toBeGreaterThan(before);
  });
});
