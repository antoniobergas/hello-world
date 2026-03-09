import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorReportingService } from './error-reporting.service';

describe('ErrorReportingService', () => {
  let service: ErrorReportingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ErrorReportingService] });
    service = TestBed.inject(ErrorReportingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no reports', () => {
    expect(service.getErrorCount()).toBe(0);
  });

  it('should report an error', () => {
    const report = service.reportError('Something failed');
    expect(report.message).toBe('Something failed');
    expect(report.level).toBe('error');
    expect(report.resolved).toBe(false);
  });

  it('should report info', () => {
    const report = service.reportInfo('App started');
    expect(report.level).toBe('info');
  });

  it('should report warning', () => {
    const report = service.reportWarning('Low memory');
    expect(report.level).toBe('warn');
  });

  it('should resolve an error', () => {
    const report = service.reportError('Boom');
    service.resolveError(report.id);
    expect(service.reports.find((r) => r.id === report.id)?.resolved).toBe(true);
  });

  it('should get unresolved reports', () => {
    const r1 = service.reportError('Error 1');
    service.reportError('Error 2');
    service.resolveError(r1.id);
    expect(service.getUnresolved().length).toBe(1);
  });

  it('should get reports by level', () => {
    service.reportError('Fatal!', undefined, 'fatal');
    service.reportInfo('Info msg');
    expect(service.getByLevel('fatal').length).toBe(1);
    expect(service.getByLevel('info').length).toBe(1);
  });

  it('should clear resolved reports', () => {
    const r1 = service.reportError('Error 1');
    service.reportError('Error 2');
    service.resolveError(r1.id);
    service.clearResolved();
    expect(service.getErrorCount()).toBe(1);
    expect(service.reports[0].resolved).toBe(false);
  });

  it('should include stack trace when provided', () => {
    const report = service.reportError('Error', 'at line 42', 'error', {});
    expect(report.stack).toBe('at line 42');
  });

  it('should include context in report', () => {
    const report = service.reportError('Error', undefined, 'error', { page: '/home' });
    expect(report.context['page']).toBe('/home');
  });

  it('should emit unresolvedCount$ correctly', async () => {
    service.reportError('E1');
    service.reportError('E2');
    const count = await firstValueFrom(service.unresolvedCount$);
    expect(count).toBe(2);
  });
});
