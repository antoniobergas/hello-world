import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StatusComponent } from './status.component';
import { StatusService } from '../../services/status.service';

describe('StatusComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject StatusService', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    expect(fixture.componentInstance.statusService).toBeTruthy();
  });

  it('should render h1 with "System Status"', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('System Status');
  });

  it('should render service status rows', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.service-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should show the overall status banner', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    fixture.detectChanges();
    const banner = fixture.nativeElement.querySelector('.overall-banner');
    expect(banner).toBeTruthy();
  });

  it('should render a refresh button', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.refresh-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBe('Refresh status');
  });

  it('should call statusService.refresh() when refresh button is clicked', () => {
    const fixture = TestBed.createComponent(StatusComponent);
    fixture.detectChanges();
    const service = TestBed.inject(StatusService);
    const spy = vi.spyOn(service, 'refresh');
    const btn = fixture.nativeElement.querySelector('.refresh-btn') as HTMLButtonElement;
    btn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
