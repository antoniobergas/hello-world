import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
  timestamp: Date;
  userId?: string;
  context: Record<string, unknown>;
  resolved: boolean;
}

@Injectable({ providedIn: 'root' })
export class ErrorReportingService {
  private reportsSubject = new BehaviorSubject<ErrorReport[]>([]);

  readonly reports$: Observable<ErrorReport[]> = this.reportsSubject.asObservable();

  readonly unresolvedCount$: Observable<number> = this.reports$.pipe(
    map((reports) => reports.filter((r) => !r.resolved).length),
  );

  get reports(): ErrorReport[] {
    return this.reportsSubject.value;
  }

  reportError(
    message: string,
    stack?: string,
    level: ErrorReport['level'] = 'error',
    context: Record<string, unknown> = {},
    userId?: string,
  ): ErrorReport {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      message,
      stack,
      level,
      timestamp: new Date(),
      userId,
      context,
      resolved: false,
    };
    this.reportsSubject.next([...this.reportsSubject.value, report]);
    return report;
  }

  reportInfo(message: string, context: Record<string, unknown> = {}): ErrorReport {
    return this.reportError(message, undefined, 'info', context);
  }

  reportWarning(message: string, context: Record<string, unknown> = {}): ErrorReport {
    return this.reportError(message, undefined, 'warn', context);
  }

  resolveError(id: string): void {
    this.reportsSubject.next(
      this.reportsSubject.value.map((r) => (r.id === id ? { ...r, resolved: true } : r)),
    );
  }

  getUnresolved(): ErrorReport[] {
    return this.reportsSubject.value.filter((r) => !r.resolved);
  }

  getByLevel(level: ErrorReport['level']): ErrorReport[] {
    return this.reportsSubject.value.filter((r) => r.level === level);
  }

  clearResolved(): void {
    this.reportsSubject.next(this.reportsSubject.value.filter((r) => !r.resolved));
  }

  getErrorCount(): number {
    return this.reportsSubject.value.length;
  }
}
