import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReleaseService } from './release.service';

describe('ReleaseService', () => {
  let service: ReleaseService;

  beforeEach(() => {
    service = new ReleaseService();
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should have 10 seed releases', () => {
    expect(service.releases.length).toBe(10);
  });

  it('should expose releases$ observable', async () => {
    const releases = await firstValueFrom(service.releases$);
    expect(releases.length).toBe(10);
  });

  it('should create a release with UUID, status=draft, changes=[]', () => {
    const r = service.create({ version: '3.0.0', title: 'New', description: 'Desc', type: 'major', createdBy: 'u1', targetEnvironments: [] });
    expect(r.id).toBeTruthy();
    expect(r.status).toBe('draft');
    expect(r.changes).toEqual([]);
  });

  it('should add created release to list', () => {
    service.create({ version: '3.0.0', title: 'New', description: 'Desc', type: 'minor', createdBy: 'u1', targetEnvironments: [] });
    expect(service.releases.length).toBe(11);
  });

  it('should publish a release', () => {
    service.publish('rel6');
    const r = service.releases.find(r => r.id === 'rel6')!;
    expect(r.status).toBe('published');
    expect(r.releasedAt).toBeInstanceOf(Date);
  });

  it('should archive a release', () => {
    service.archive('rel6');
    expect(service.releases.find(r => r.id === 'rel6')?.status).toBe('archived');
  });

  it('should addChange to a release', () => {
    service.addChange('rel7', { type: 'fix', description: 'Fixed something' });
    expect(service.releases.find(r => r.id === 'rel7')?.changes.length).toBe(1);
  });

  it('should removeChange by index', () => {
    service.addChange('rel7', { type: 'fix', description: 'Fix1' });
    service.addChange('rel7', { type: 'feature', description: 'Feat1' });
    service.removeChange('rel7', 0);
    const changes = service.releases.find(r => r.id === 'rel7')?.changes!;
    expect(changes.length).toBe(1);
    expect(changes[0].description).toBe('Feat1');
  });

  it('should getByStatus draft', () => {
    const drafts = service.getByStatus('draft');
    expect(drafts.every(r => r.status === 'draft')).toBe(true);
    expect(drafts.length).toBe(3);
  });

  it('should getByStatus published', () => {
    const published = service.getByStatus('published');
    expect(published.length).toBe(5);
  });

  it('should getByStatus archived', () => {
    const archived = service.getByStatus('archived');
    expect(archived.length).toBe(2);
  });

  it('should getByVersion finds correct release', () => {
    const r = service.getByVersion('1.0.0');
    expect(r?.id).toBe('rel1');
  });

  it('should getByVersion returns undefined for unknown', () => {
    expect(service.getByVersion('99.0.0')).toBeUndefined();
  });

  it('should getLatestPublished returns most recently released', () => {
    const latest = service.getLatestPublished();
    expect(latest?.id).toBe('rel5');
    expect(latest?.releasedAt?.toISOString()).toBe(new Date('2024-04-01').toISOString());
  });

  it('should search by title case-insensitively', () => {
    const results = service.search('hotfix');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should search by description case-insensitively', () => {
    const results = service.search('redesign');
    expect(results.find(r => r.id === 'rel5')).toBeTruthy();
  });

  it('should search returns empty for no match', () => {
    expect(service.search('xyznonexistent')).toEqual([]);
  });

  it('should update observable after publish', async () => {
    service.publish('rel6');
    const releases = await firstValueFrom(service.releases$);
    expect(releases.find(r => r.id === 'rel6')?.status).toBe('published');
  });

  it('should have rel1 in seed data', () => {
    expect(service.releases.find(r => r.id === 'rel1')).toBeTruthy();
  });

  it('should getLatestPublished is undefined when no published releases', () => {
    service.getByStatus('published').forEach(r => service.archive(r.id));
    expect(service.getLatestPublished()).toBeUndefined();
  });
});
