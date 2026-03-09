import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ThemeService } from '../../services/theme.service';
import { routes } from '../../app.routes';

describe('NavbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand name', async () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    await fixture.whenStable();
    const brand = fixture.nativeElement.querySelector('.brand-name') as HTMLElement;
    expect(brand.textContent).toContain('AppBench');
  });

  it('should render two navigation links', async () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('.nav-links a');
    expect(links.length).toBe(2);
  });

  it('should render the theme toggle button', async () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.theme-toggle')).toBeTruthy();
  });

  it('should show "Switch to dark mode" label in light theme', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    expect(fixture.componentInstance.themeLabel).toBe('Switch to dark mode');
  });

  it('should toggle to dark theme and update label', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const themeService = TestBed.inject(ThemeService);

    fixture.componentInstance.toggleTheme();

    expect(themeService.isDark).toBe(true);
    expect(fixture.componentInstance.themeLabel).toBe('Switch to light mode');
  });

  it('should toggle back to light theme', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.componentInstance.toggleTheme();
    fixture.componentInstance.toggleTheme();
    expect(TestBed.inject(ThemeService).isDark).toBe(false);
  });
});
