import { TestBed } from '@angular/core/testing';
import { AlertsComponent } from './alerts.component';
import { provideRouter } from '@angular/router';

describe('AlertsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show h1 "Analytics Alerts"', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Analytics Alerts');
  });

  it('should show .alert-row elements', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.alert-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show .alerts-summary', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('.alerts-summary');
    expect(summary).toBeTruthy();
  });

  it('should show severity tabs', () => {
    const fixture = TestBed.createComponent(AlertsComponent);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.severity-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(4);
  });
});
