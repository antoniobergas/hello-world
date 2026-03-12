import { Injectable } from '@angular/core';
import { Subject, Observable, filter, map } from 'rxjs';

export interface AppEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
  source: string;
}

export type EventHandler<T = unknown> = (payload: T) => void;

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private bus$ = new Subject<AppEvent>();
  private eventHistory: AppEvent[] = [];
  private readonly MAX_HISTORY = 100;

  emit<T>(type: string, payload: T, source = 'app'): void {
    const event: AppEvent<T> = { type, payload, timestamp: new Date(), source };
    if (this.eventHistory.length >= this.MAX_HISTORY) {
      this.eventHistory.shift();
    }
    this.eventHistory.push(event as AppEvent);
    this.bus$.next(event as AppEvent);
  }

  on<T>(type: string): Observable<T> {
    return this.bus$.pipe(
      filter((e) => e.type === type),
      map((e) => e.payload as T),
    );
  }

  onAny(): Observable<AppEvent> {
    return this.bus$.asObservable();
  }

  onSource(source: string): Observable<AppEvent> {
    return this.bus$.pipe(filter((e) => e.source === source));
  }

  getHistory(): AppEvent[] {
    return [...this.eventHistory];
  }

  getHistoryByType(type: string): AppEvent[] {
    return this.eventHistory.filter((e) => e.type === type);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getEventTypes(): string[] {
    return [...new Set(this.eventHistory.map((e) => e.type))];
  }
}
