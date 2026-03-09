import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Report, ReportStatus } from '../models/reporting.model';

const SEED_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    name: 'Monthly Revenue Summary',
    description: 'Total revenue breakdown by product line and region.',
    status: 'completed',
    createdAt: new Date('2025-01-01'),
    lastRunAt: new Date('2025-01-31'),
    schedule: '0 0 1 * *',
    rowCount: 4820,
  },
  {
    id: 'rpt-002',
    name: 'Active User Cohorts',
    description: 'DAU/WAU/MAU breakdown and cohort retention.',
    status: 'completed',
    createdAt: new Date('2025-01-01'),
    lastRunAt: new Date('2025-01-30'),
    schedule: '0 6 * * MON',
    rowCount: 12045,
  },
  {
    id: 'rpt-003',
    name: 'Support Ticket Trends',
    description: 'Open, resolved, and escalated ticket volumes over time.',
    status: 'scheduled',
    createdAt: new Date('2025-01-10'),
    schedule: '0 8 * * *',
  },
  {
    id: 'rpt-004',
    name: 'Churn Analysis',
    description: 'Identifies customers at risk of churning.',
    status: 'draft',
    createdAt: new Date('2025-01-15'),
  },
];

@Injectable({ providedIn: 'root' })
export class ReportService {
  private reportsSubject = new BehaviorSubject<Report[]>([...SEED_REPORTS]);

  readonly reports$ = this.reportsSubject.asObservable();
  readonly completedReports$ = this.reports$.pipe(
    map((rs) => rs.filter((r) => r.status === 'completed')),
  );

  get reports(): Report[] {
    return this.reportsSubject.value;
  }

  getById(id: string): Report | undefined {
    return this.reportsSubject.value.find((r) => r.id === id);
  }

  create(name: string, description: string): Report {
    const report: Report = {
      id: `rpt-${String(Date.now()).slice(-4)}`,
      name,
      description,
      status: 'draft',
      createdAt: new Date(),
    };
    this.reportsSubject.next([...this.reportsSubject.value, report]);
    return report;
  }

  run(id: string): void {
    const reports = this.reportsSubject.value.map((r) =>
      r.id === id ? { ...r, status: 'running' as ReportStatus, lastRunAt: new Date() } : r,
    );
    this.reportsSubject.next(reports);
    // Simulate completion.
    setTimeout(() => {
      const completed = this.reportsSubject.value.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'completed' as ReportStatus,
              rowCount: Math.floor(Math.random() * 10000) + 100,
            }
          : r,
      );
      this.reportsSubject.next(completed);
    }, 50);
  }

  delete(id: string): void {
    this.reportsSubject.next(this.reportsSubject.value.filter((r) => r.id !== id));
  }
}
