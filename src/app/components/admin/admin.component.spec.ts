import { TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { RbacService } from '../../services/rbac.service';
import { AuditLogService } from '../../services/audit-log.service';
import { BackgroundJobService } from '../../services/background-job.service';

describe('AdminComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the main heading "Enterprise Admin"', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const h2 = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(h2.textContent).toContain('Enterprise Admin');
  });

  it('should render the RBAC section', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('[aria-label="RBAC section"]');
    expect(section).toBeTruthy();
  });

  it('should render feature flags section', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('[aria-label="Feature flags section"]');
    expect(section).toBeTruthy();
  });

  it('should render health check section', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('[aria-label="Health check section"]');
    expect(section).toBeTruthy();
  });

  it('should render background jobs section', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('[aria-label="Background jobs section"]');
    expect(section).toBeTruthy();
  });

  it('should render audit log section', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('[aria-label="Audit log section"]');
    expect(section).toBeTruthy();
  });

  it('should render config section', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('[aria-label="Config section"]');
    expect(section).toBeTruthy();
  });

  it('enqueueExportJob() should add a job and an audit log entry', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const jobs = TestBed.inject(BackgroundJobService);
    const audit = TestBed.inject(AuditLogService);
    const beforeJobs = jobs.jobs.length;
    const beforeAudit = audit.entries.length;

    fixture.componentInstance.enqueueExportJob();

    expect(jobs.jobs.length).toBe(beforeJobs + 1);
    expect(jobs.jobs[jobs.jobs.length - 1].name).toContain('Export');
    expect(audit.entries.length).toBe(beforeAudit + 1);
  });

  it('should render role-switch buttons for all RBAC roles', async () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const rbac = TestBed.inject(RbacService);
    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('.role-btn');
    expect(buttons.length).toBe(rbac.getAllRoles().length);
  });
});
