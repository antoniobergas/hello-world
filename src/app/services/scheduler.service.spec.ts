import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { SchedulerService, CronJob } from './scheduler.service';

const makeJob = (id: string, enabled = true): CronJob => ({
  id,
  name: `Job ${id}`,
  expression: '0 * * * *',
  description: 'Test job',
  enabled,
  nextRun: new Date(Date.now() + 3600000),
  status: 'idle',
  runCount: 0,
});

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SchedulerService] });
    service = TestBed.inject(SchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no jobs', () => {
    expect(service.jobs.length).toBe(0);
  });

  it('should add a job', () => {
    service.addJob(makeJob('j1'));
    expect(service.jobs.length).toBe(1);
  });

  it('should remove a job', () => {
    service.addJob(makeJob('j1'));
    service.removeJob('j1');
    expect(service.jobs.length).toBe(0);
  });

  it('should enable a job', () => {
    service.addJob(makeJob('j1', false));
    service.enableJob('j1');
    expect(service.jobs[0].enabled).toBe(true);
  });

  it('should disable a job', () => {
    service.addJob(makeJob('j1', true));
    service.disableJob('j1');
    expect(service.jobs[0].enabled).toBe(false);
  });

  it('should run a job and increment runCount', () => {
    service.addJob(makeJob('j1'));
    service.runJobNow('j1');
    expect(service.jobs[0].runCount).toBe(1);
    expect(service.jobs[0].lastRun).toBeDefined();
  });

  it('should record job run in history', () => {
    service.addJob(makeJob('j1'));
    service.runJobNow('j1');
    service.runJobNow('j1');
    expect(service.getJobHistory('j1').length).toBe(2);
  });

  it('should return empty history for unknown job', () => {
    expect(service.getJobHistory('unknown')).toEqual([]);
  });

  it('should get enabled jobs only', () => {
    service.addJob(makeJob('j1', true));
    service.addJob(makeJob('j2', false));
    expect(service.getEnabledJobs().length).toBe(1);
    expect(service.getEnabledJobs()[0].id).toBe('j1');
  });

  it('should emit enabled jobs via enabledJobs$', async () => {
    service.addJob(makeJob('j1', true));
    service.addJob(makeJob('j2', false));
    const enabled = await firstValueFrom(service.enabledJobs$);
    expect(enabled.length).toBe(1);
  });

  it('should clear history when job is removed', () => {
    service.addJob(makeJob('j1'));
    service.runJobNow('j1');
    service.removeJob('j1');
    expect(service.getJobHistory('j1').length).toBe(0);
  });
});
