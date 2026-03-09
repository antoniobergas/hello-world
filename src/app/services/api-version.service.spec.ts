import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiVersionService } from './api-version.service';

describe('ApiVersionService', () => {
  let service: ApiVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return v3 as current version', () => {
    expect(service.currentVersion).toBe('v3');
  });

  it('should report v3 as supported', () => {
    expect(service.isSupported('v3')).toBe(true);
  });

  it('should report v2 as supported', () => {
    expect(service.isSupported('v2')).toBe(true);
  });

  it('should report v1 as deprecated', () => {
    expect(service.isDeprecated('v1')).toBe(true);
  });

  it('should report unknown version as not supported', () => {
    expect(service.isSupported('v99')).toBe(false);
  });

  it('should negotiate unsupported version to current', () => {
    expect(service.negotiate('v99')).toBe('v3');
  });

  it('should negotiate deprecated version to current', () => {
    expect(service.negotiate('v1')).toBe('v3');
  });

  it('should negotiate supported version to itself', () => {
    expect(service.negotiate('v2')).toBe('v2');
  });

  it('should get the latest version', () => {
    const latest = service.getLatestVersion();
    expect(latest.status).toBe('current');
    expect(latest.version).toBe('v3');
  });

  it('should get supported versions only', () => {
    const supported = service.getSupportedVersions();
    supported.forEach((v) => {
      expect(['current', 'supported']).toContain(v.status);
    });
  });

  it('should emit deprecated versions via deprecatedVersions$', async () => {
    const deprecated = await firstValueFrom(service.deprecatedVersions$);
    expect(deprecated.length).toBeGreaterThan(0);
    deprecated.forEach((v) => expect(v.status).toBe('deprecated'));
  });

  it('should get version details by key', () => {
    const v2 = service.getVersion('v2');
    expect(v2).toBeTruthy();
    expect(v2?.features).toContain('filtering');
  });
});
