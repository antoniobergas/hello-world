import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExportsComponent } from './exports.component';
import { ExportService } from '../../services/export.service';

describe('ExportsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExportsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should inject ExportService', () => {
    const fixture = TestBed.createComponent(ExportsComponent);
    expect(fixture.componentInstance.exportService).toBeTruthy();
  });

  it('should render h1 with "Exports"', async () => {
    const fixture = TestBed.createComponent(ExportsComponent);
    await fixture.whenStable();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('Exports');
  });

  it('should render seeded export job rows', async () => {
    const fixture = TestBed.createComponent(ExportsComponent);
    await fixture.whenStable();
    const rows = fixture.nativeElement.querySelectorAll('.export-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should render the export list with aria-label', async () => {
    const fixture = TestBed.createComponent(ExportsComponent);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('[aria-label="Export job list"]');
    expect(list).toBeTruthy();
  });
});
