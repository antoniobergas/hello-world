import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light theme', () => {
    expect(service.theme()).toBe('light');
    expect(service.isDark).toBe(false);
  });

  it('should toggle to dark theme', () => {
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(service.isDark).toBe(true);
  });

  it('should toggle back to light theme', () => {
    service.toggle();
    service.toggle();
    expect(service.theme()).toBe('light');
    expect(service.isDark).toBe(false);
  });

  it('should set theme directly to dark', () => {
    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
  });

  it('should set theme directly to light', () => {
    service.setTheme('dark');
    service.setTheme('light');
    expect(service.theme()).toBe('light');
  });

  it('should set the data-theme attribute on the document element', () => {
    service.setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    service.setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
