import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BackgroundJobService } from './background-job.service';

describe('BackgroundJobService', () => {
  let service: BackgroundJobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundJobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no jobs', () => {
    expect(service.jobs.length).toBe(0);
  });

  it('should enqueue a job', () => {
    const job = service.enqueue('export', 'Export CSV');
    expect(job.status).toBe('pending');
    expect(job.type).toBe('export');
    expect(job.name).toBe('Export CSV');
    expect(job.progress).toBe(0);
  });

  it('should store enqueued jobs', () => {
    service.enqueue('export', 'Job 1');
    service.enqueue('import', 'Job 2');
    expect(service.jobs.length).toBe(2);
  });

  it('should start a job', () => {
    const job = service.enqueue('export', 'Export CSV');
    service.start(job.id);
    expect(service.getJob(job.id)?.status).toBe('running');
    expect(service.getJob(job.id)?.startedAt).toBeTruthy();
  });

  it('should update job progress', () => {
    const job = service.enqueue('export', 'Export CSV');
    service.start(job.id);
    service.updateProgress(job.id, 50);
    expect(service.getJob(job.id)?.progress).toBe(50);
  });

  it('should clamp progress to 0-100', () => {
    const job = service.enqueue('export', 'Export CSV');
    service.updateProgress(job.id, 150);
    expect(service.getJob(job.id)?.progress).toBe(100);
    service.updateProgress(job.id, -10);
    expect(service.getJob(job.id)?.progress).toBe(0);
  });

  it('should complete a job', () => {
    const job = service.enqueue('export', 'Export CSV');
    service.start(job.id);
    service.complete(job.id, { rows: 42 });
    const completed = service.getJob(job.id);
    expect(completed?.status).toBe('completed');
    expect(completed?.progress).toBe(100);
    expect(completed?.completedAt).toBeTruthy();
  });

  it('should fail a job', () => {
    const job = service.enqueue('export', 'Export CSV');
    service.start(job.id);
    service.fail(job.id, 'Out of memory');
    const failed = service.getJob(job.id);
    expect(failed?.status).toBe('failed');
    expect(failed?.error).toBe('Out of memory');
  });

  it('should cancel a job', () => {
    const job = service.enqueue('export', 'Export CSV');
    service.cancel(job.id);
    expect(service.getJob(job.id)?.status).toBe('cancelled');
  });

  it('should get jobs by status', () => {
    service.enqueue('export', 'Job A');
    const job = service.enqueue('import', 'Job B');
    service.start(job.id);
    expect(service.getByStatus('pending').length).toBe(1);
    expect(service.getByStatus('running').length).toBe(1);
  });

  it('should get jobs by type', () => {
    service.enqueue('export', 'Export 1');
    service.enqueue('export', 'Export 2');
    service.enqueue('import', 'Import 1');
    expect(service.getByType('export').length).toBe(2);
    expect(service.getByType('import').length).toBe(1);
  });

  it('should clear completed jobs', () => {
    const job = service.enqueue('export', 'Job');
    service.complete(job.id);
    const pending = service.enqueue('import', 'Pending job');
    service.clearCompleted();
    expect(service.jobs.length).toBe(1);
    expect(service.jobs[0].id).toBe(pending.id);
  });

  it('should emit running jobs via runningJobs$', async () => {
    const job = service.enqueue('export', 'Job');
    service.start(job.id);
    const running = await firstValueFrom(service.runningJobs$);
    expect(running.length).toBe(1);
  });
});
