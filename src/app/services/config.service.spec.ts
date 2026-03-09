import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return development environment by default', () => {
    expect(service.get('environment')).toBe('development');
  });

  it('should get a config value', () => {
    expect(service.get('maxItemsPerPage')).toBe(50);
  });

  it('should set a config value', () => {
    service.set('maxItemsPerPage', 100);
    expect(service.get('maxItemsPerPage')).toBe(100);
  });

  it('should emit updated config via config$', async () => {
    service.set('environment', 'production');
    const config = await firstValueFrom(service.config$);
    expect(config.environment).toBe('production');
  });

  it('should emit environment via environment$', async () => {
    const env = await firstValueFrom(service.environment$);
    expect(env).toBe('development');
  });

  it('should identify production environment', async () => {
    service.set('environment', 'production');
    const isProd = await firstValueFrom(service.isProduction$);
    expect(isProd).toBe(true);
  });

  it('should identify non-production environment', async () => {
    const isProd = await firstValueFrom(service.isProduction$);
    expect(isProd).toBe(false);
  });

  it('should check feature enabled from config', () => {
    expect(service.isFeatureEnabled('bulk-operations')).toBe(true);
    expect(service.isFeatureEnabled('export-csv')).toBe(false);
  });

  it('should set feature flag in config', () => {
    service.setFeature('export-csv', true);
    expect(service.isFeatureEnabled('export-csv')).toBe(true);
  });

  it('should merge partial config', () => {
    service.merge({ maxItemsPerPage: 200, enableDebugMode: false });
    expect(service.get('maxItemsPerPage')).toBe(200);
    expect(service.get('enableDebugMode')).toBe(false);
    expect(service.get('environment')).toBe('development');
  });

  it('should reset to defaults', () => {
    service.set('maxItemsPerPage', 999);
    service.reset();
    expect(service.get('maxItemsPerPage')).toBe(50);
  });

  it('should check environment with isEnvironment()', () => {
    expect(service.isEnvironment('development')).toBe(true);
    expect(service.isEnvironment('production')).toBe(false);
  });

  it('should build api url', () => {
    const url = service.getApiUrl('items');
    expect(url).toContain('/items');
  });

  it('should get section same as get', () => {
    const section = service.getSection('allowedOrigins');
    expect(section).toBeTruthy();
    expect(Array.isArray(section)).toBe(true);
  });
});
