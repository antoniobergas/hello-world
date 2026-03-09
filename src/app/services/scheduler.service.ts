import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CronJob {
  id: string;
  name: string;
  expression: string;
  description: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  status: 'idle' | 'running' | 'failed';
  runCount: number;
}

@Injectable({ providedIn: 'root' })
export class SchedulerService {
  private jobsSubject = new BehaviorSubject<CronJob[]>([]);
  private historyMap = new Map<string, Date[]>();

  readonly jobs$: Observable<CronJob[]> = this.jobsSubject.asObservable();

  readonly enabledJobs$: Observable<CronJob[]> = this.jobs$.pipe(
    map((jobs) => jobs.filter((j) => j.enabled)),
  );

  get jobs(): CronJob[] {
    return this.jobsSubject.value;
  }

  addJob(job: CronJob): void {
    this.jobsSubject.next([...this.jobsSubject.value, job]);
    this.historyMap.set(job.id, []);
  }

  removeJob(id: string): void {
    this.jobsSubject.next(this.jobsSubject.value.filter((j) => j.id !== id));
    this.historyMap.delete(id);
  }

  enableJob(id: string): void {
    this.jobsSubject.next(
      this.jobsSubject.value.map((j) => (j.id === id ? { ...j, enabled: true } : j)),
    );
  }

  disableJob(id: string): void {
    this.jobsSubject.next(
      this.jobsSubject.value.map((j) => (j.id === id ? { ...j, enabled: false } : j)),
    );
  }

  runJobNow(id: string): void {
    const now = new Date();
    const history = this.historyMap.get(id) ?? [];
    history.push(now);
    this.historyMap.set(id, history);
    this.jobsSubject.next(
      this.jobsSubject.value.map((j) =>
        j.id === id
          ? { ...j, lastRun: now, status: 'idle', runCount: j.runCount + 1 }
          : j,
      ),
    );
  }

  getJobHistory(id: string): Date[] {
    return this.historyMap.get(id) ?? [];
  }

  getEnabledJobs(): CronJob[] {
    return this.jobsSubject.value.filter((j) => j.enabled);
  }
}
