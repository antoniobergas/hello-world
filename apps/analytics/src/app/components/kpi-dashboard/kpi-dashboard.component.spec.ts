import { TestBed } from '@angular/core/testing';
import { KpiDashboardComponent } from './kpi-dashboard.component';
import { provideRouter } from '@angular/router';

describe('KpiDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiDashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(KpiDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show h1 "Analytics Dashboard"', () => {
    const fixture = TestBed.createComponent(KpiDashboardComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Analytics Dashboard');
  });

  it('should show .metric-card elements', () => {
    const fixture = TestBed.createComponent(KpiDashboardComponent);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.metric-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should show .dashboard-summary', () => {
    const fixture = TestBed.createComponent(KpiDashboardComponent);
    fixture.detectChanges();
    const summary = fixture.nativeElement.querySelector('.dashboard-summary');
    expect(summary).toBeTruthy();
  });

  it('should show category tabs', () => {
    const fixture = TestBed.createComponent(KpiDashboardComponent);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.category-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(6);
  });
});
