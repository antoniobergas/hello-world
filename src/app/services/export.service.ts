import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ExportFormat = 'csv' | 'json' | 'tsv';

export interface ExportJob {
  id: string;
  format: ExportFormat;
  status: 'pending' | 'complete' | 'error';
  filename: string;
  recordCount: number;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private exportJobsSubject = new BehaviorSubject<ExportJob[]>([]);

  readonly exportJobs$: Observable<ExportJob[]> = this.exportJobsSubject.asObservable();

  get exportJobs(): ExportJob[] {
    return this.exportJobsSubject.value;
  }

  exportToCsv(data: object[], _filename: string): string {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((h) => {
          const val = String((row as Record<string, unknown>)[h] ?? '');
          return val.includes(',') ? `"${val}"` : val;
        })
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }

  exportToJson(data: object[], _filename: string): string {
    return JSON.stringify(data, null, 2);
  }

  exportToTsv(data: object[], _filename: string): string {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => String((row as Record<string, unknown>)[h] ?? '')).join('\t'),
    );
    return [headers.join('\t'), ...rows].join('\n');
  }

  scheduleExport(format: ExportFormat, data: object[], filename: string): ExportJob {
    const job: ExportJob = {
      id: crypto.randomUUID(),
      format,
      status: 'complete',
      filename,
      recordCount: data.length,
      createdAt: new Date(),
    };
    this.exportJobsSubject.next([...this.exportJobsSubject.value, job]);
    return job;
  }

  getExportJobs(): ExportJob[] {
    return this.exportJobsSubject.value;
  }

  clearExportJobs(): void {
    this.exportJobsSubject.next([]);
  }
}
