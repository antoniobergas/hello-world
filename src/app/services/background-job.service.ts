import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'export' | 'import' | 'sync' | 'cleanup' | 'report' | 'notification';

export interface BackgroundJob {
  id: string;
  type: JobType;
  name: string;
  status: JobStatus;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: unknown;
  metadata: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class BackgroundJobService {
  private jobsSubject = new BehaviorSubject<BackgroundJob[]>([]);

  readonly jobs$: Observable<BackgroundJob[]> = this.jobsSubject.asObservable();

  readonly runningJobs$: Observable<BackgroundJob[]> = this.jobs$.pipe(
    map((jobs) => jobs.filter((j) => j.status === 'running')),
  );

  readonly pendingJobs$: Observable<BackgroundJob[]> = this.jobs$.pipe(
    map((jobs) => jobs.filter((j) => j.status === 'pending')),
  );

  get jobs(): BackgroundJob[] {
    return this.jobsSubject.value;
  }

  enqueue(type: JobType, name: string, metadata: Record<string, unknown> = {}): BackgroundJob {
    const job: BackgroundJob = {
      id: crypto.randomUUID(),
      type,
      name,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      metadata,
    };
    this.jobsSubject.next([...this.jobsSubject.value, job]);
    return job;
  }

  start(jobId: string): void {
    this.updateJob(jobId, { status: 'running', startedAt: new Date(), progress: 0 });
  }

  updateProgress(jobId: string, progress: number): void {
    const clamped = Math.max(0, Math.min(100, progress));
    this.updateJob(jobId, { progress: clamped });
  }

  complete(jobId: string, result?: unknown): void {
    this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      result,
    });
  }

  fail(jobId: string, error: string): void {
    this.updateJob(jobId, { status: 'failed', completedAt: new Date(), error });
  }

  cancel(jobId: string): void {
    this.updateJob(jobId, { status: 'cancelled', completedAt: new Date() });
  }

  getJob(jobId: string): BackgroundJob | undefined {
    return this.jobsSubject.value.find((j) => j.id === jobId);
  }

  getByStatus(status: JobStatus): BackgroundJob[] {
    return this.jobsSubject.value.filter((j) => j.status === status);
  }

  getByType(type: JobType): BackgroundJob[] {
    return this.jobsSubject.value.filter((j) => j.type === type);
  }

  clearCompleted(): void {
    this.jobsSubject.next(
      this.jobsSubject.value.filter((j) => j.status !== 'completed' && j.status !== 'failed'),
    );
  }

  private updateJob(jobId: string, changes: Partial<BackgroundJob>): void {
    const updated = this.jobsSubject.value.map((j) => (j.id === jobId ? { ...j, ...changes } : j));
    this.jobsSubject.next(updated);
  }

  runNow(type: JobType, name: string, durationMs = 100): Promise<BackgroundJob> {
    const job = this.enqueue(type, name);
    this.start(job.id);
    return new Promise((resolve) => {
      const steps = 5;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        this.updateProgress(job.id, (step / steps) * 100);
        if (step >= steps) {
          clearInterval(interval);
          this.complete(job.id, { completedAt: new Date() });
          resolve(this.getJob(job.id)!);
        }
      }, durationMs / steps);
    });
  }
}
