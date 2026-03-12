import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnnouncementService } from './announcement.service';

describe('AnnouncementService', () => {
  let service: AnnouncementService;

  beforeEach(() => {
    service = new AnnouncementService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 8 seed announcements', () => {
    expect(service.getAll().length).toBe(8);
  });

  it('should create an announcement with UUID', () => {
    const a = service.create({
      title: 'Test',
      body: 'body',
      type: 'info',
      targetAudience: 'all',
      active: false,
      startAt: new Date(),
      createdBy: 'u1',
    });
    expect(a.id).toBeTruthy();
  });

  it('should create adds to announcements list', () => {
    const before = service.getAll().length;
    service.create({
      title: 'Test',
      body: 'body',
      type: 'info',
      targetAudience: 'all',
      active: false,
      startAt: new Date(),
      createdBy: 'u1',
    });
    expect(service.getAll().length).toBe(before + 1);
  });

  it('should publish sets active to true', () => {
    service.publish('ann4');
    expect(service.announcements.find((a) => a.id === 'ann4')?.active).toBe(true);
  });

  it('should deactivate sets active to false', () => {
    service.deactivate('ann1');
    expect(service.announcements.find((a) => a.id === 'ann1')?.active).toBe(false);
  });

  it('should getActive returns only active announcements', () => {
    const active = service.getActive();
    expect(active.every((a) => a.active)).toBe(true);
    expect(active.length).toBeGreaterThan(0);
  });

  it('should getActive count decreases after deactivate', () => {
    const before = service.getActive().length;
    service.deactivate('ann1');
    expect(service.getActive().length).toBe(before - 1);
  });

  it('should getForAudience all returns only active announcements', () => {
    const forAll = service.getForAudience('all');
    expect(forAll.every((a) => a.active)).toBe(true);
  });

  it('should getForAudience admins includes all-targeted and admin-targeted active', () => {
    const forAdmins = service.getForAudience('admins');
    forAdmins.forEach((a) => {
      expect(a.targetAudience === 'all' || a.targetAudience === 'admins').toBe(true);
    });
  });

  it('should getForAudience tenant returns tenant-specific and all-targeted', () => {
    const forT1 = service.getForAudience('t1');
    expect(forT1.some((a) => a.targetAudience === 'all')).toBe(true);
    expect(forT1.some((a) => a.targetAudience === 't1')).toBe(true);
  });

  it('should dismiss marks announcement as dismissed for user', () => {
    service.dismiss('ann1', 'user1');
    expect(service.isDismissed('ann1', 'user1')).toBe(true);
  });

  it('should isDismissed returns false if not dismissed', () => {
    expect(service.isDismissed('ann1', 'user1')).toBe(false);
  });

  it('should isDismissed is per-user', () => {
    service.dismiss('ann1', 'user1');
    expect(service.isDismissed('ann1', 'user2')).toBe(false);
  });

  it('should getForUser excludes dismissed announcements', () => {
    service.dismiss('ann1', 'user1');
    const forUser = service.getForUser('user1', 'all');
    expect(forUser.some((a) => a.id === 'ann1')).toBe(false);
  });

  it('should getForUser includes non-dismissed announcements', () => {
    service.dismiss('ann1', 'user1');
    const forUser = service.getForUser('user1', 'all');
    expect(forUser.some((a) => a.id === 'ann2')).toBe(true);
  });

  it('should emit announcements via announcements$', async () => {
    const anns = await firstValueFrom(service.announcements$);
    expect(anns.length).toBe(8);
  });

  it('should emit active announcements via activeAnnouncements$', async () => {
    const active = await firstValueFrom(service.activeAnnouncements$);
    expect(active.every((a) => a.active)).toBe(true);
  });

  it('should getAll returns all including inactive', () => {
    expect(service.getAll().some((a) => !a.active)).toBe(true);
  });

  it('should publish makes previously inactive visible in getActive', () => {
    service.publish('ann7');
    expect(service.getActive().some((a) => a.id === 'ann7')).toBe(true);
  });

  it('should dismiss multiple announcements for same user', () => {
    service.dismiss('ann1', 'user1');
    service.dismiss('ann2', 'user1');
    expect(service.isDismissed('ann1', 'user1')).toBe(true);
    expect(service.isDismissed('ann2', 'user1')).toBe(true);
  });
});
