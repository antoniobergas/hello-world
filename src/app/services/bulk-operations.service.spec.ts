import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { BulkOperationsService } from './bulk-operations.service';

describe('BulkOperationsService', () => {
  let service: BulkOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BulkOperationsService] });
    service = TestBed.inject(BulkOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty selection', () => {
    expect(service.getSelectedCount()).toBe(0);
  });

  it('should select an item', () => {
    service.selectItem('id1');
    expect(service.selectedIds.has('id1')).toBe(true);
  });

  it('should deselect an item', () => {
    service.selectItem('id1');
    service.deselectItem('id1');
    expect(service.selectedIds.has('id1')).toBe(false);
  });

  it('should select all items', () => {
    service.selectAll(['a', 'b', 'c']);
    expect(service.getSelectedCount()).toBe(3);
  });

  it('should clear selection', () => {
    service.selectAll(['a', 'b', 'c']);
    service.clearSelection();
    expect(service.getSelectedCount()).toBe(0);
  });

  it('should execute delete and record operation', () => {
    const op = service.executeDelete(['id1', 'id2']);
    expect(op.type).toBe('delete');
    expect(op.affectedCount).toBe(2);
    expect(op.status).toBe('complete');
  });

  it('should execute update and record operation', () => {
    const op = service.executeUpdate(['id1'], { name: 'new' });
    expect(op.type).toBe('update');
    expect(op.affectedCount).toBe(1);
  });

  it('should execute tag and record operation', () => {
    const op = service.executeTag(['id1', 'id2', 'id3'], 'important');
    expect(op.type).toBe('tag');
    expect(op.affectedCount).toBe(3);
  });

  it('should retrieve operation history', () => {
    service.executeDelete(['a']);
    service.executeUpdate(['b'], {});
    expect(service.getOperationHistory().length).toBe(2);
  });

  it('should emit updated selection via selectedIds$', async () => {
    service.selectItem('x');
    const ids = await firstValueFrom(service.selectedIds$);
    expect(ids.has('x')).toBe(true);
  });

  it('should emit operations via operations$', async () => {
    service.executeDelete(['a', 'b']);
    const ops = await firstValueFrom(service.operations$);
    expect(ops.length).toBe(1);
  });
});
