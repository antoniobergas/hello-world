import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportJob {
  id: string;
  name: string;
  entity: 'customers' | 'items' | 'tickets';
  status: 'pending' | 'validating' | 'importing' | 'completed' | 'failed';
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ImportError[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

const SEED_JOBS: ImportJob[] = [
  {
    id: 'imp1',
    name: 'Customer Import Jan',
    entity: 'customers',
    status: 'completed',
    totalRows: 100,
    validRows: 98,
    invalidRows: 2,
    errors: [],
    createdBy: 'u1',
    createdAt: new Date('2024-01-01'),
    completedAt: new Date('2024-01-01'),
  },
  {
    id: 'imp2',
    name: 'Item Import Feb',
    entity: 'items',
    status: 'failed',
    totalRows: 50,
    validRows: 0,
    invalidRows: 50,
    errors: [{ row: 1, field: 'price', message: 'Required' }],
    createdBy: 'u1',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'imp3',
    name: 'Ticket Import Mar',
    entity: 'tickets',
    status: 'pending',
    totalRows: 200,
    validRows: 0,
    invalidRows: 0,
    errors: [],
    createdBy: 'u2',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: 'imp4',
    name: 'Customer Import Apr',
    entity: 'customers',
    status: 'completed',
    totalRows: 75,
    validRows: 75,
    invalidRows: 0,
    errors: [],
    createdBy: 'u2',
    createdAt: new Date('2024-04-01'),
    completedAt: new Date('2024-04-01'),
  },
  {
    id: 'imp5',
    name: 'Item Import May',
    entity: 'items',
    status: 'failed',
    totalRows: 30,
    validRows: 0,
    invalidRows: 30,
    errors: [{ row: 1, field: 'name', message: 'Required' }],
    createdBy: 'u3',
    createdAt: new Date('2024-05-01'),
  },
];

@Injectable({ providedIn: 'root' })
export class ImportService {
  private jobsSubject = new BehaviorSubject<ImportJob[]>(SEED_JOBS);

  readonly jobs$: Observable<ImportJob[]> = this.jobsSubject.asObservable();

  get jobs(): ImportJob[] {
    return this.jobsSubject.getValue();
  }

  validateRow(entity: ImportJob['entity'], row: Record<string, unknown>): ImportError[] {
    const errors: ImportError[] = [];
    const required: Record<ImportJob['entity'], string[]> = {
      customers: ['name', 'email'],
      items: ['name', 'price'],
      tickets: ['title', 'status'],
    };
    for (const field of required[entity]) {
      if (!row[field]) {
        errors.push({ row: 0, field, message: `${field} is required` });
      }
    }
    return errors;
  }

  processImport(jobId: string): void {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return;
    if (job.validRows > 0) {
      this.jobsSubject.next(
        this.jobs.map((j) =>
          j.id === jobId ? { ...j, status: 'completed', completedAt: new Date() } : j,
        ),
      );
    } else {
      this.jobsSubject.next(
        this.jobs.map((j) => (j.id === jobId ? { ...j, status: 'failed' } : j)),
      );
    }
  }

  startImport(
    name: string,
    entity: ImportJob['entity'],
    rows: Record<string, unknown>[],
    createdBy: string,
  ): ImportJob {
    const id = crypto.randomUUID();
    const allErrors: ImportError[] = [];
    let validRows = 0;
    let invalidRows = 0;

    rows.forEach((row, index) => {
      const rowErrors = this.validateRow(entity, row).map((e) => ({ ...e, row: index + 1 }));
      if (rowErrors.length === 0) {
        validRows++;
      } else {
        invalidRows++;
        allErrors.push(...rowErrors);
      }
    });

    const job: ImportJob = {
      id,
      name,
      entity,
      status: 'validating',
      totalRows: rows.length,
      validRows,
      invalidRows,
      errors: allErrors,
      createdBy,
      createdAt: new Date(),
    };

    this.jobsSubject.next([...this.jobs, job]);
    this.processImport(id);
    return this.jobs.find((j) => j.id === id)!;
  }

  cancel(jobId: string): void {
    this.jobsSubject.next(this.jobs.map((j) => (j.id === jobId ? { ...j, status: 'failed' } : j)));
  }

  getByStatus(status: ImportJob['status']): ImportJob[] {
    return this.jobs.filter((j) => j.status === status);
  }

  retry(jobId: string): ImportJob | undefined {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return undefined;
    this.jobsSubject.next(
      this.jobs.map((j) => (j.id === jobId ? { ...j, errors: [], status: 'validating' } : j)),
    );
    this.processImport(jobId);
    return this.jobs.find((j) => j.id === jobId);
  }
}
