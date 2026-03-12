import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { TenantService } from './tenant.service';
import { PreferencesService } from './preferences.service';
import { I18nService } from './i18n.service';

describe('Tenant + Preferences + I18n Integration', () => {
  let tenant: TenantService;
  let preferences: PreferencesService;
  let i18n: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TenantService, PreferencesService, I18nService],
    });
    tenant = TestBed.inject(TenantService);
    preferences = TestBed.inject(PreferencesService);
    i18n = TestBed.inject(I18nService);
  });

  it('should preserve user preferences when switching tenants', () => {
    preferences.setPreference('theme', 'dark');
    preferences.setPreference('itemsPerPage', 50);

    expect(tenant.currentTenant?.id).toBe('t1');
    tenant.switchTenant('t2');
    expect(tenant.currentTenant?.id).toBe('t2');

    expect(preferences.getTheme()).toBe('dark');
    expect(preferences.getItemsPerPage()).toBe(50);
  });

  it('should allow setting i18n locale in a per-tenant context', () => {
    expect(tenant.currentTenant?.id).toBe('t1');
    i18n.setLocale('fr');
    expect(i18n.currentLocale).toBe('fr');

    tenant.switchTenant('t2');
    i18n.setLocale('de');
    expect(i18n.currentLocale).toBe('de');
    expect(tenant.currentTenant?.id).toBe('t2');
  });

  it('should reflect tenant plan affecting available features', () => {
    const enterpriseTenant = tenant.getTenant('t1');
    expect(enterpriseTenant?.plan).toBe('enterprise');

    const proTenant = tenant.getTenant('t2');
    expect(proTenant?.plan).toBe('pro');

    const freeTenant = tenant.getTenant('t3');
    expect(freeTenant?.plan).toBe('free');
  });

  it('should clear tenant context when a tenant is deactivated', () => {
    expect(tenant.currentTenant?.id).toBe('t1');
    tenant.deactivateTenant('t1');
    expect(tenant.currentTenant).toBeNull();

    const deactivated = tenant.getTenant('t1');
    expect(deactivated?.active).toBe(false);
  });

  it('should export and import preferences correctly', () => {
    preferences.setPreference('theme', 'dark');
    preferences.setPreference('language', 'fr');
    preferences.setPreference('itemsPerPage', 100);

    const exported = preferences.exportPreferences();
    expect(exported).toBeTruthy();

    const parsed = JSON.parse(exported);
    expect(parsed.theme).toBe('dark');
    expect(parsed.language).toBe('fr');
    expect(parsed.itemsPerPage).toBe(100);

    preferences.resetToDefaults();
    expect(preferences.getTheme()).toBe('system');

    preferences.importPreferences(exported);
    expect(preferences.getTheme()).toBe('dark');
    expect(preferences.getLanguage()).toBe('fr');
    expect(preferences.getItemsPerPage()).toBe(100);
  });

  it('should change translation output when locale is changed', () => {
    i18n.setLocale('en');
    const enTitle = i18n.translate('app.title');
    expect(enTitle).toBe('My App');

    i18n.setLocale('es');
    const esTitle = i18n.translate('app.title');
    expect(esTitle).toBe('Mi Aplicación');

    i18n.setLocale('fr');
    const frTitle = i18n.translate('app.title');
    expect(frTitle).toBe('Mon Application');
  });

  it('should return correct list of available locales', () => {
    const locales = i18n.getAvailableLocales();
    expect(locales).toHaveLength(5);

    const codes = locales.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('es');
    expect(codes).toContain('fr');
    expect(codes).toContain('de');
    expect(codes).toContain('ja');
  });

  it('should format dates correctly with the current locale context', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024

    i18n.setLocale('en');
    expect(i18n.formatDate(date)).toBe('06/15/2024');

    i18n.setLocale('fr');
    expect(i18n.formatDate(date)).toBe('15/06/2024');

    i18n.setLocale('de');
    expect(i18n.formatDate(date)).toBe('15.06.2024');

    i18n.setLocale('ja');
    expect(i18n.formatDate(date)).toBe('2024/06/15');
  });

  it('should only switch to active tenants', () => {
    tenant.switchTenant('t3');
    expect(tenant.currentTenant?.id).toBe('t1');
  });

  it('should return only active tenants from getActiveTenants()', () => {
    const active = tenant.getActiveTenants();
    expect(active.every((t) => t.active)).toBe(true);
    const ids = active.map((t) => t.id);
    expect(ids).not.toContain('t3');
  });

  it('should translate text with parameter interpolation', () => {
    i18n.setLocale('en');
    const welcome = i18n.translate('msg.welcome', { name: 'Alice' });
    expect(welcome).toBe('Welcome, Alice!');

    i18n.setLocale('es');
    const esWelcome = i18n.translate('msg.welcome', { name: 'Alice' });
    expect(esWelcome).toBe('¡Bienvenido, Alice!');
  });
});
