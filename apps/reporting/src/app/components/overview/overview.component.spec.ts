import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OverviewComponent } from './overview.component';
import { MetricsService } from '../../services/metrics.service';

describe('OverviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject MetricsService', () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    expect(fixture.componentInstance.metricsService).toBeTruthy();
  });

  it('should render h1 with "Business Overview"', async () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    await fixture.whenStable();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('Business Overview');
  });

  it('should render KPI cards', async () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    await fixture.whenStable();
    const cards = fixture.nativeElement.querySelectorAll('.kpi-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should render series cards', async () => {
    const fixture = TestBed.createComponent(OverviewComponent);
    await fixture.whenStable();
    const cards = fixture.nativeElement.querySelectorAll('.series-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
