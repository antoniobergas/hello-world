import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FeatureFlagService } from './feature-flag.service';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureFlagService);
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load default flags', () => {
    expect(service.flags.length).toBeGreaterThan(0);
  });

  it('should return true for enabled flag', () => {
    expect(service.isEnabled('bulk-operations')).toBe(true);
  });

  it('should return false for disabled flag', () => {
    expect(service.isEnabled('export-csv')).toBe(false);
  });

  it('should return false for unknown flag', () => {
    expect(service.isEnabled('nonexistent-flag')).toBe(false);
  });

  it('should toggle a flag', () => {
    const before = service.isEnabled('bulk-operations');
    service.toggle('bulk-operations');
    expect(service.isEnabled('bulk-operations')).toBe(!before);
  });

  it('should set a flag enabled', () => {
    service.setEnabled('export-csv', true);
    expect(service.isEnabled('export-csv')).toBe(true);
  });

  it('should set a flag disabled', () => {
    service.setEnabled('bulk-operations', false);
    expect(service.isEnabled('bulk-operations')).toBe(false);
  });

  it('should emit updated flags via flags$', async () => {
    service.toggle('export-csv');
    const flags = await firstValueFrom(service.flags$);
    const exportFlag = flags.find((f) => f.key === 'export-csv');
    expect(exportFlag?.enabled).toBe(true);
  });

  it('should get flag by key', () => {
    const flag = service.getFlag('dark-mode');
    expect(flag).toBeTruthy();
    expect(flag?.name).toBe('Dark Mode');
  });

  it('should set rollout percentage (clamped to 0-100)', () => {
    service.setRollout('export-csv', 50);
    expect(service.getFlag('export-csv')?.rolloutPercentage).toBe(50);
    service.setRollout('export-csv', 200);
    expect(service.getFlag('export-csv')?.rolloutPercentage).toBe(100);
    service.setRollout('export-csv', -10);
    expect(service.getFlag('export-csv')?.rolloutPercentage).toBe(0);
  });

  it('should add a new flag', () => {
    service.addFlag({
      key: 'new-feature',
      name: 'New Feature',
      description: 'A brand new feature',
      enabled: false,
      rolloutPercentage: 0,
      tags: ['test'],
    });
    expect(service.getFlag('new-feature')).toBeTruthy();
  });

  it('should get flags by tag', () => {
    const uiFlags = service.getFlagsByTag('ui');
    expect(uiFlags.length).toBeGreaterThan(0);
    uiFlags.forEach((f) => expect(f.tags).toContain('ui'));
  });

  it('should reset to default state', () => {
    service.toggle('bulk-operations');
    service.reset();
    expect(service.isEnabled('bulk-operations')).toBe(true);
    expect(service.isEnabled('export-csv')).toBe(false);
  });
});
