import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { PreferencesService, DEFAULT_PREFERENCES } from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PreferencesService] });
    service = TestBed.inject(PreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with default preferences', () => {
    expect(service.preferences.theme).toBe('system');
    expect(service.preferences.language).toBe('en');
  });

  it('should get a preference by key', () => {
    expect(service.getPreference<string>('theme')).toBe('system');
    expect(service.getPreference<number>('itemsPerPage')).toBe(25);
  });

  it('should set a preference', () => {
    service.setPreference('theme', 'dark');
    expect(service.getTheme()).toBe('dark');
  });

  it('should reset to defaults', () => {
    service.setPreference('theme', 'dark');
    service.setPreference('itemsPerPage', 100);
    service.resetToDefaults();
    expect(service.preferences.theme).toBe(DEFAULT_PREFERENCES.theme);
    expect(service.preferences.itemsPerPage).toBe(DEFAULT_PREFERENCES.itemsPerPage);
  });

  it('should export preferences as JSON string', () => {
    const exported = service.exportPreferences();
    const parsed = JSON.parse(exported);
    expect(parsed.theme).toBe('system');
  });

  it('should import preferences from JSON', () => {
    const prefs = { ...DEFAULT_PREFERENCES, theme: 'dark', language: 'fr' };
    service.importPreferences(JSON.stringify(prefs));
    expect(service.getTheme()).toBe('dark');
    expect(service.getLanguage()).toBe('fr');
  });

  it('should ignore invalid JSON on import', () => {
    service.importPreferences('not-valid-json');
    expect(service.preferences.theme).toBe('system');
  });

  it('should get theme', () => {
    expect(service.getTheme()).toBe('system');
  });

  it('should get language', () => {
    expect(service.getLanguage()).toBe('en');
  });

  it('should get items per page', () => {
    expect(service.getItemsPerPage()).toBe(25);
    service.setPreference('itemsPerPage', 50);
    expect(service.getItemsPerPage()).toBe(50);
  });

  it('should emit preferences via preferences$', async () => {
    const prefs = await firstValueFrom(service.preferences$);
    expect(prefs.dashboardLayout).toBe('grid');
  });

  it('should emit theme changes via theme$', async () => {
    service.setPreference('theme', 'light');
    const theme = await firstValueFrom(service.theme$);
    expect(theme).toBe('light');
  });
});
