import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { BulkOperationsService } from './bulk-operations.service';
import { SoftDeleteService } from './soft-delete.service';
import { ActivityService } from './activity.service';
import { ExportService } from './export.service';

describe('BulkOperations + SoftDelete + Activity Integration', () => {
  let bulk: BulkOperationsService;
  let softDelete: SoftDeleteService;
  let activity: ActivityService;
  let exportSvc: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BulkOperationsService, SoftDeleteService, ActivityService, ExportService],
    });
    bulk = TestBed.inject(BulkOperationsService);
    softDelete = TestBed.inject(SoftDeleteService);
    activity = TestBed.inject(ActivityService);
    exportSvc = TestBed.inject(ExportService);
  });

  it('should add items to soft-delete store when bulk delete is executed', () => {
    const ids = ['item-1', 'item-2', 'item-3'];
    bulk.executeDelete(ids);
    ids.forEach((id) => softDelete.softDelete(id, 'item', { id }, 'admin'));

    expect(softDelete.getItemCount()).toBe(3);
    const deleted = softDelete.getDeletedByType('item');
    expect(deleted).toHaveLength(3);
    expect(deleted.map((d) => d.id)).toEqual(expect.arrayContaining(ids));
  });

  it('should remove items from soft-delete store when restore is called', () => {
    softDelete.softDelete('item-1', 'item', { title: 'Item 1' }, 'admin');
    softDelete.softDelete('item-2', 'item', { title: 'Item 2' }, 'admin');
    expect(softDelete.getItemCount()).toBe(2);

    const restored = softDelete.restore('item-1');
    expect(restored).toBeDefined();
    expect(restored?.id).toBe('item-1');
    expect(softDelete.getItemCount()).toBe(1);
  });

  it('should process all selected items when bulk delete is executed', () => {
    const ids = ['a', 'b', 'c', 'd'];
    bulk.selectAll(ids);
    expect(bulk.getSelectedCount()).toBe(4);

    const selected = [...bulk.selectedIds];
    const op = bulk.executeDelete(selected);
    selected.forEach((id) => softDelete.softDelete(id, 'item', { id }, 'user'));

    expect(op.affectedCount).toBe(4);
    expect(op.targetIds).toHaveLength(4);
    expect(softDelete.getItemCount()).toBe(4);
  });

  it('should log activity when bulk operations are executed', () => {
    const ids = ['x1', 'x2'];
    const op = bulk.executeDelete(ids);
    activity.logActivity('u1', 'admin', 'BULK_DELETE', 'item', op.id, {
      targetIds: ids,
      count: ids.length,
    });

    const entries = activity.getActivitiesForEntity('item', op.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('BULK_DELETE');
    expect(entries[0].metadata['count']).toBe(2);
  });

  it('should generate CSV for selected items via bulk export', () => {
    const items = [
      { id: 'i1', name: 'Alpha', status: 'active' },
      { id: 'i2', name: 'Beta', status: 'inactive' },
    ];
    bulk.selectAll(items.map((i) => i.id));

    const csv = exportSvc.exportToCsv(items, 'bulk-export.csv');
    expect(csv).toContain('id,name,status');
    expect(csv).toContain('i1,Alpha,active');
    expect(csv).toContain('i2,Beta,inactive');
  });

  it('should reset selected count to 0 after clearing selection', () => {
    bulk.selectItem('a');
    bulk.selectItem('b');
    bulk.selectItem('c');
    expect(bulk.getSelectedCount()).toBe(3);

    bulk.clearSelection();
    expect(bulk.getSelectedCount()).toBe(0);
    expect(bulk.selectedIds.size).toBe(0);
  });

  it('should apply bulk tag operation to multiple items', () => {
    const ids = ['t1', 't2', 't3'];
    const op = bulk.executeTag(ids, 'featured');
    activity.logActivity('u1', 'admin', 'BULK_TAG', 'item', op.id, { tag: 'featured' });

    expect(op.type).toBe('tag');
    expect(op.affectedCount).toBe(3);
    expect(op.targetIds).toEqual(ids);

    const tagActivities = activity.getActivitiesForEntity('item', op.id);
    expect(tagActivities[0].metadata['tag']).toBe('featured');
  });

  it('should purge expired soft-deleted items', () => {
    const pastDate = new Date(Date.now() - 1000);
    const expiredItem: import('./soft-delete.service').DeletedItem = {
      id: 'expired-1',
      type: 'item',
      data: {},
      deletedAt: pastDate,
      deletedBy: 'admin',
      expiresAt: pastDate,
    };

    softDelete.softDelete('active-1', 'item', {}, 'admin', 30);
    const deletedItems = (
      softDelete as unknown as {
        deletedItemsSubject: {
          value: import('./soft-delete.service').DeletedItem[];
          next: (v: import('./soft-delete.service').DeletedItem[]) => void;
        };
      }
    ).deletedItemsSubject;
    deletedItems.next([...deletedItems.value, expiredItem]);

    expect(softDelete.getItemCount()).toBe(2);
    const purgedCount = softDelete.purgeExpired();
    expect(purgedCount).toBe(1);
    expect(softDelete.getItemCount()).toBe(1);
    expect(softDelete.deletedItems[0].id).toBe('active-1');
  });

  it('should track operation history across multiple bulk operations', () => {
    bulk.executeDelete(['d1', 'd2']);
    bulk.executeTag(['t1'], 'urgent');
    bulk.executeUpdate(['u1', 'u2', 'u3'], { status: 'archived' });

    const history = bulk.getOperationHistory();
    expect(history).toHaveLength(3);
    expect(history[0].type).toBe('delete');
    expect(history[1].type).toBe('tag');
    expect(history[2].type).toBe('update');
  });
});
