import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExportJob, ExportFormat, ExportStatus } from '../models/reporting.model';

const SEED_JOBS: ExportJob[] = [
  {
    id: 'exp-001',
    reportId: 'rpt-001',
    reportName: 'Monthly Revenue Summary',
    format: 'csv',
    status: 'ready',
    createdAt: new Date('2025-01-31T10:00:00'),
    readyAt: new Date('2025-01-31T10:01:22'),
    fileSizeKb: 234,
  },
  {
    id: 'exp-002',
    reportId: 'rpt-002',
    reportName: 'Active User Cohorts',
    format: 'xlsx',
    status: 'ready',
    createdAt: new Date('2025-01-30T09:00:00'),
    readyAt: new Date('2025-01-30T09:02:00'),
    fileSizeKb: 512,
  },
  {
    id: 'exp-003',
    reportId: 'rpt-001',
    reportName: 'Monthly Revenue Summary',
    format: 'json',
    status: 'expired',
    createdAt: new Date('2024-12-31T10:00:00'),
    fileSizeKb: 0,
  },
];

@Injectable({ providedIn: 'root' })
export class ExportService {
  private jobsSubject = new BehaviorSubject<ExportJob[]>([...SEED_JOBS]);

  readonly jobs$ = this.jobsSubject.asObservable();

  get jobs(): ExportJob[] {
    return this.jobsSubject.value;
  }

  schedule(reportId: string, reportName: string, format: ExportFormat): ExportJob {
    const job: ExportJob = {
      id: `exp-${String(Date.now()).slice(-5)}`,
      reportId,
      reportName,
      format,
      status: 'pending',
      createdAt: new Date(),
    };
    this.jobsSubject.next([job, ...this.jobsSubject.value]);
    return job;
  }

  markReady(id: string, fileSizeKb: number): void {
    const jobs = this.jobsSubject.value.map((j) =>
      j.id === id ? { ...j, status: 'ready' as ExportStatus, readyAt: new Date(), fileSizeKb } : j,
    );
    this.jobsSubject.next(jobs);
  }

  delete(id: string): void {
    this.jobsSubject.next(this.jobsSubject.value.filter((j) => j.id !== id));
  }
}
