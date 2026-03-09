import { TestBed } from '@angular/core/testing';
import { ItemsService } from './items.service';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemsService);
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
});
