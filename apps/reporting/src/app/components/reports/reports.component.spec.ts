import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ReportService } from '../../services/report.service';
import { ExportService } from '../../services/export.service';

describe('ReportsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render h1 with "Reports"', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toContain('Reports');
  });

  it('should render seeded report rows', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.report-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should toggle showForm when new report button is clicked', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.showForm()).toBe(false);
    const btn = fixture.nativeElement.querySelector('.new-report-btn') as HTMLButtonElement;
    btn.click();
    expect(fixture.componentInstance.showForm()).toBe(true);
  });

  it('createReport() should not create a report when name is empty', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    const service = TestBed.inject(ReportService);
    const before = service.reports.length;
    fixture.componentInstance.form = { name: '', description: '' };
    fixture.componentInstance.createReport();
    expect(service.reports.length).toBe(before);
  });

  it('createReport() should add a report and hide the form', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    const service = TestBed.inject(ReportService);
    const before = service.reports.length;
    fixture.componentInstance.showForm.set(true);
    fixture.componentInstance.form = { name: 'Q1 Sales', description: 'Q1 breakdown' };
    fixture.componentInstance.createReport();
    expect(service.reports.length).toBe(before + 1);
    expect(fixture.componentInstance.showForm()).toBe(false);
  });

  it('deleteReport() should remove the report from the service', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    const service = TestBed.inject(ReportService);
    const id = service.reports[0].id;
    const before = service.reports.length;
    fixture.componentInstance.deleteReport(id);
    expect(service.reports.length).toBe(before - 1);
    expect(service.getById(id)).toBeUndefined();
  });

  it('exportReport() should schedule an export job', () => {
    const fixture = TestBed.createComponent(ReportsComponent);
    const exportService = TestBed.inject(ExportService);
    const reportService = TestBed.inject(ReportService);
    const before = exportService.jobs.length;
    const report = reportService.reports[0];
    fixture.componentInstance.exportReport(report.id, report.name);
    expect(exportService.jobs.length).toBe(before + 1);
  });
});
