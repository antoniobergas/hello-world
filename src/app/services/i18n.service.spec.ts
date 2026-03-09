import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [I18nService] });
    service = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with English locale', () => {
    expect(service.currentLocale).toBe('en');
  });

  it('should change locale', () => {
    service.setLocale('fr');
    expect(service.currentLocale).toBe('fr');
  });

  it('should translate a key in English', () => {
    expect(service.translate('action.save')).toBe('Save');
  });

  it('should translate a key in Spanish', () => {
    service.setLocale('es');
    expect(service.translate('action.save')).toBe('Guardar');
  });

  it('should translate with params', () => {
    const result = service.translate('msg.welcome', { name: 'Alice' });
    expect(result).toBe('Welcome, Alice!');
  });

  it('should return key if translation not found', () => {
    expect(service.translate('unknown.key')).toBe('unknown.key');
  });

  it('should add and retrieve a new translation', () => {
    service.addTranslation('custom.greeting', {
      en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは',
    });
    expect(service.translate('custom.greeting')).toBe('Hello');
    service.setLocale('de');
    expect(service.translate('custom.greeting')).toBe('Hallo');
  });

  it('should return all available locales', () => {
    const locales = service.getAvailableLocales();
    expect(locales.length).toBe(5);
    expect(locales.map((l) => l.code)).toContain('en');
    expect(locales.map((l) => l.code)).toContain('ja');
  });

  it('should get current locale config', () => {
    const config = service.getCurrentLocale();
    expect(config.code).toBe('en');
    expect(config.direction).toBe('ltr');
  });

  it('should format a date according to locale', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    service.setLocale('en');
    expect(service.formatDate(date)).toBe('01/15/2024');
    service.setLocale('de');
    expect(service.formatDate(date)).toBe('15.01.2024');
  });

  it('should format a number', () => {
    service.setLocale('en');
    const result = service.formatNumber(1234567);
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  it('should emit locale changes via currentLocale$', async () => {
    service.setLocale('ja');
    const locale = await firstValueFrom(service.currentLocale$);
    expect(locale).toBe('ja');
  });
});
