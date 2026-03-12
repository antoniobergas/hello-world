import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent as App } from './app';
import { routes } from './app.routes';

describe('App (Analytics)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render brand name "AppBench Analytics"', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const brand = fixture.nativeElement.querySelector('.brand') as HTMLElement;
    expect(brand.textContent).toContain('AppBench Analytics');
  });

  it('should render three navigation links', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('.nav-links a') as NodeListOf<HTMLElement>;
    expect(links.length).toBe(3);
  });

  it('should include a link to Dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-links a'),
    );
    expect(links.some((l) => l.textContent?.includes('Dashboard'))).toBe(true);
  });

  it('should include a link to Alerts', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.nav-links a'),
    );
    expect(links.some((l) => l.textContent?.includes('Alerts'))).toBe(true);
  });
});
