import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PreferencesComponent } from './preferences.component';
import { PreferencesService, DEFAULT_PREFERENCES } from '../../services/preferences.service';

describe('PreferencesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject PreferencesService', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    expect(fixture.componentInstance.preferencesService).toBeTruthy();
  });

  it('should display current theme options', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBe(3);
  });

  it('should update theme via setTheme', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    const service = TestBed.inject(PreferencesService);
    fixture.componentInstance.setTheme('dark');
    expect(service.getTheme()).toBe('dark');
  });

  it('should clamp itemsPerPage to valid range in setItemsPerPage', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    const service = TestBed.inject(PreferencesService);
    const fakeEvent = { target: { value: '5' } } as unknown as Event;
    fixture.componentInstance.setItemsPerPage(fakeEvent);
    expect(service.getItemsPerPage()).toBe(10);
    const fakeEvent2 = { target: { value: '200' } } as unknown as Event;
    fixture.componentInstance.setItemsPerPage(fakeEvent2);
    expect(service.getItemsPerPage()).toBe(100);
  });

  it('should toggle email notification via toggleNotification', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    const service = TestBed.inject(PreferencesService);
    const fakeEvent = { target: { checked: false } } as unknown as Event;
    fixture.componentInstance.toggleNotification('email', fakeEvent);
    expect(service.preferences.notifications.email).toBe(false);
  });

  it('should reset to defaults when resetToDefaults is called', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    const service = TestBed.inject(PreferencesService);
    service.setPreference('theme', 'dark');
    service.resetToDefaults();
    expect(service.getTheme()).toBe(DEFAULT_PREFERENCES.theme);
  });

  it('should render reset button with correct aria-label', () => {
    const fixture = TestBed.createComponent(PreferencesComponent);
    fixture.detectChanges();
    const resetBtn = fixture.nativeElement.querySelector('.reset-btn');
    expect(resetBtn).toBeTruthy();
    expect(resetBtn.getAttribute('aria-label')).toBe('Reset to defaults');
  });
});
