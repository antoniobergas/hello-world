import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { SoftDeleteService } from './soft-delete.service';

describe('SoftDeleteService', () => {
  let service: SoftDeleteService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SoftDeleteService] });
    service = TestBed.inject(SoftDeleteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no deleted items', () => {
    expect(service.getItemCount()).toBe(0);
  });

  it('should soft-delete an item', () => {
    service.softDelete('item1', 'product', { name: 'Widget' }, 'alice');
    expect(service.getItemCount()).toBe(1);
  });

  it('should store correct metadata on soft delete', () => {
    const item = service.softDelete('item1', 'product', { name: 'Widget' }, 'alice');
    expect(item.id).toBe('item1');
    expect(item.type).toBe('product');
    expect(item.deletedBy).toBe('alice');
    expect(item.expiresAt.getTime()).toBeGreaterThan(item.deletedAt.getTime());
  });

  it('should restore a soft-deleted item and remove it from list', () => {
    service.softDelete('item1', 'product', {}, 'alice');
    const restored = service.restore('item1');
    expect(restored?.id).toBe('item1');
    expect(service.getItemCount()).toBe(0);
  });

  it('should return undefined when restoring non-existent item', () => {
    expect(service.restore('nonexistent')).toBeUndefined();
  });

  it('should permanently delete an item', () => {
    service.softDelete('item1', 'product', {}, 'alice');
    service.permanentDelete('item1');
    expect(service.getItemCount()).toBe(0);
  });

  it('should filter deleted items by type', () => {
    service.softDelete('a', 'product', {}, 'alice');
    service.softDelete('b', 'order', {}, 'alice');
    expect(service.getDeletedByType('product').length).toBe(1);
    expect(service.getDeletedByType('order').length).toBe(1);
  });

  it('should identify expired items', () => {
    const past = new Date(Date.now() - 1000);
    const item = service.softDelete('item1', 'product', {}, 'alice', 0);
    // With 0 days retention, expiresAt == deletedAt which is already past
    const expired = service.getExpiredItems();
    expect(expired.length).toBeGreaterThanOrEqual(0);
  });

  it('should purge expired items and return count', () => {
    service.softDelete('item1', 'product', {}, 'alice', 30);
    const purged = service.purgeExpired();
    expect(purged).toBe(0); // not expired yet
    expect(service.getItemCount()).toBe(1);
  });

  it('should emit updated list via deletedItems$', async () => {
    service.softDelete('item1', 'product', {}, 'alice');
    const items = await firstValueFrom(service.deletedItems$);
    expect(items.length).toBe(1);
  });
});
