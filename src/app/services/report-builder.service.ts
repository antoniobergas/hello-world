import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  visible: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'in';
  value: unknown;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  entity: 'tickets' | 'customers' | 'invoices' | 'items';
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  status: 'draft' | 'saved' | 'scheduled';
  createdBy: string;
  createdAt: Date;
  lastRunAt?: Date;
  runCount: number;
  schedule?: string;
}

const SEED_REPORTS: Report[] = [
  {
    id: 'rep1', name: 'Ticket Summary', description: 'Summary of all tickets', entity: 'tickets',
    columns: [{ field: 'id', label: 'ID', type: 'string', visible: true }, { field: 'status', label: 'Status', type: 'string', visible: true }],
    filters: [{ field: 'status', operator: 'eq', value: 'open' }],
    sortBy: 'createdAt', sortDir: 'desc', status: 'saved', createdBy: 'u1', createdAt: new Date('2024-01-01'), runCount: 10,
  },
  {
    id: 'rep2', name: 'Customer Report', description: 'All customers', entity: 'customers',
    columns: [{ field: 'name', label: 'Name', type: 'string', visible: true }],
    filters: [],
    sortBy: 'name', sortDir: 'asc', status: 'saved', createdBy: 'u1', createdAt: new Date('2024-02-01'), runCount: 25,
  },
  {
    id: 'rep3', name: 'Invoice Report', description: 'All invoices', entity: 'invoices',
    columns: [{ field: 'amount', label: 'Amount', type: 'number', visible: true }],
    filters: [{ field: 'status', operator: 'neq', value: 'paid' }],
    sortBy: 'dueDate', sortDir: 'asc', status: 'scheduled', createdBy: 'u2', createdAt: new Date('2024-03-01'), runCount: 50, schedule: '0 8 * * 1',
  },
  {
    id: 'rep4', name: 'Item Catalog', description: 'Product catalog', entity: 'items',
    columns: [],
    filters: [],
    sortBy: 'name', sortDir: 'asc', status: 'draft', createdBy: 'u2', createdAt: new Date('2024-04-01'), runCount: 0,
  },
  {
    id: 'rep5', name: 'Open Tickets', description: 'Tickets by status', entity: 'tickets',
    columns: [{ field: 'title', label: 'Title', type: 'string', visible: true }],
    filters: [{ field: 'priority', operator: 'gt', value: 2 }],
    sortBy: 'priority', sortDir: 'desc', status: 'saved', createdBy: 'u3', createdAt: new Date('2024-05-01'), runCount: 8,
  },
  {
    id: 'rep6', name: 'Revenue Report', description: 'Revenue by period', entity: 'invoices',
    columns: [],
    filters: [],
    sortBy: 'amount', sortDir: 'desc', status: 'draft', createdBy: 'u1', createdAt: new Date('2024-06-01'), runCount: 3,
  },
  {
    id: 'rep7', name: 'Customer Churn', description: 'Churn analysis', entity: 'customers',
    columns: [],
    filters: [],
    sortBy: 'churnedAt', sortDir: 'desc', status: 'saved', createdBy: 'u2', createdAt: new Date('2024-07-01'), runCount: 15,
  },
  {
    id: 'rep8', name: 'Low Stock', description: 'Items low on stock', entity: 'items',
    columns: [{ field: 'stock', label: 'Stock', type: 'number', visible: true }],
    filters: [{ field: 'stock', operator: 'lt', value: 10 }],
    sortBy: 'stock', sortDir: 'asc', status: 'scheduled', createdBy: 'u3', createdAt: new Date('2024-08-01'), runCount: 30, schedule: '0 6 * * *',
  },
];

@Injectable({ providedIn: 'root' })
export class ReportBuilderService {
  private reportsSubject = new BehaviorSubject<Report[]>(SEED_REPORTS);

  readonly reports$: Observable<Report[]> = this.reportsSubject.asObservable();

  get reports(): Report[] {
    return this.reportsSubject.getValue();
  }

  create(data: Omit<Report, 'id' | 'createdAt' | 'runCount' | 'columns' | 'filters' | 'status'>): Report {
    const report: Report = { ...data, id: crypto.randomUUID(), createdAt: new Date(), runCount: 0, columns: [], filters: [], status: 'draft' };
    this.reportsSubject.next([...this.reports, report]);
    return report;
  }

  save(id: string): void {
    this.reportsSubject.next(this.reports.map(r => r.id === id ? { ...r, status: 'saved' } : r));
  }

  addColumn(id: string, column: ReportColumn): void {
    this.reportsSubject.next(this.reports.map(r => r.id === id ? { ...r, columns: [...r.columns, column] } : r));
  }

  removeColumn(id: string, field: string): void {
    this.reportsSubject.next(this.reports.map(r => r.id === id ? { ...r, columns: r.columns.filter(c => c.field !== field) } : r));
  }

  addFilter(id: string, filter: ReportFilter): void {
    this.reportsSubject.next(this.reports.map(r => r.id === id ? { ...r, filters: [...r.filters, filter] } : r));
  }

  removeFilter(id: string, field: string): void {
    this.reportsSubject.next(this.reports.map(r => r.id === id ? { ...r, filters: r.filters.filter(f => f.field !== field) } : r));
  }

  run(id: string): Report | undefined {
    const report = this.reports.find(r => r.id === id);
    if (!report) return undefined;
    this.reportsSubject.next(
      this.reports.map(r => r.id === id ? { ...r, runCount: r.runCount + 1, lastRunAt: new Date() } : r)
    );
    return this.reports.find(r => r.id === id);
  }

  schedule(id: string, cronExpression: string): void {
    this.reportsSubject.next(
      this.reports.map(r => r.id === id ? { ...r, status: 'scheduled', schedule: cronExpression } : r)
    );
  }

  getByEntity(entity: Report['entity']): Report[] {
    return this.reports.filter(r => r.entity === entity);
  }

  getMostRun(limit = 5): Report[] {
    return [...this.reports].sort((a, b) => b.runCount - a.runCount).slice(0, limit);
  }
}
