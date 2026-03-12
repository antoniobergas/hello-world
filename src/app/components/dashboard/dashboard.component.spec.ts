import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { routes } from '../../app.routes';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the main heading', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('Hello World');
  });

  it('should display five stat cards', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const cards = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(cards.length).toBe(5);
  });

  it('should render the embedded counter component', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-counter')).toBeTruthy();
  });

  it('should render the greeting component', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-greeting')).toBeTruthy();
  });

  it('should show a link to the items page', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('a.action-btn') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Items');
  });

  it('should render the progress bar component', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-progress-bar')).toBeTruthy();
  });

  it('should show an Overdue stat card', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();
    const cards = fixture.nativeElement.querySelectorAll(
      '.stat-card h3',
    ) as NodeListOf<HTMLElement>;
    const titles = Array.from(cards).map((c) => c.textContent?.trim().toLowerCase());
    expect(titles.some((t) => t?.includes('overdue'))).toBe(true);
  });
});
