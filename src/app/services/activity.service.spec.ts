import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ActivityService] });
    service = TestBed.inject(ActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no activities', () => {
    expect(service.activities.length).toBe(0);
  });

  it('should log an activity', () => {
    const entry = service.logActivity('u1', 'alice', 'CREATE', 'item', 'item1');
    expect(entry.userId).toBe('u1');
    expect(entry.action).toBe('CREATE');
    expect(service.activities.length).toBe(1);
  });

  it('should include metadata in activity', () => {
    const entry = service.logActivity('u1', 'alice', 'UPDATE', 'item', 'item1', { field: 'name' });
    expect(entry.metadata['field']).toBe('name');
  });

  it('should add a comment as activity', () => {
    const entry = service.addComment('item', 'item1', 'u1', 'alice', 'Nice item!');
    expect(entry.action).toBe('COMMENT');
    expect(entry.metadata['comment']).toBe('Nice item!');
  });

  it('should get activities for a specific entity', () => {
    service.logActivity('u1', 'alice', 'CREATE', 'item', 'item1');
    service.logActivity('u1', 'alice', 'UPDATE', 'order', 'order1');
    const itemActivities = service.getActivitiesForEntity('item', 'item1');
    expect(itemActivities.length).toBe(1);
  });

  it('should get activities by user', () => {
    service.logActivity('u1', 'alice', 'CREATE', 'item', 'item1');
    service.logActivity('u2', 'bob', 'DELETE', 'item', 'item2');
    expect(service.getActivitiesByUser('u1').length).toBe(1);
    expect(service.getActivitiesByUser('u2').length).toBe(1);
  });

  it('should get recent activities in reverse order with limit', () => {
    service.logActivity('u1', 'alice', 'CREATE', 'item', '1');
    service.logActivity('u1', 'alice', 'UPDATE', 'item', '2');
    service.logActivity('u1', 'alice', 'DELETE', 'item', '3');
    const recent = service.getRecentActivities(2);
    expect(recent.length).toBe(2);
    expect(recent[0].entityId).toBe('3');
  });

  it('should clear activities older than a date', () => {
    service.logActivity('u1', 'alice', 'CREATE', 'item', '1');
    const cleared = service.clearOldActivities(new Date(Date.now() + 1000));
    expect(cleared).toBe(1);
    expect(service.activities.length).toBe(0);
  });

  it('should not clear recent activities', () => {
    service.logActivity('u1', 'alice', 'CREATE', 'item', '1');
    const cleared = service.clearOldActivities(new Date(Date.now() - 1000));
    expect(cleared).toBe(0);
  });

  it('should emit activities via activities$', async () => {
    service.logActivity('u1', 'alice', 'CREATE', 'item', '1');
    const activities = await firstValueFrom(service.activities$);
    expect(activities.length).toBe(1);
  });
});
