import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ServiceHealth = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface ServiceStatus {
  name: string;
  status: ServiceHealth;
  latencyMs: number;
  lastChecked: Date;
}

const SEED_SERVICES: ServiceStatus[] = [
  { name: 'API Gateway', status: 'operational', latencyMs: 42, lastChecked: new Date() },
  { name: 'Authentication', status: 'operational', latencyMs: 18, lastChecked: new Date() },
  { name: 'Billing Engine', status: 'operational', latencyMs: 95, lastChecked: new Date() },
  { name: 'Notification Service', status: 'degraded', latencyMs: 340, lastChecked: new Date() },
  { name: 'File Storage', status: 'operational', latencyMs: 60, lastChecked: new Date() },
];

@Injectable({ providedIn: 'root' })
export class StatusService {
  private servicesSubject = new BehaviorSubject<ServiceStatus[]>([...SEED_SERVICES]);
  readonly services$ = this.servicesSubject.asObservable();

  get services(): ServiceStatus[] {
    return this.servicesSubject.value;
  }

  get overallStatus(): ServiceHealth {
    const statuses = this.servicesSubject.value.map((s) => s.status);
    if (statuses.includes('outage')) return 'outage';
    if (statuses.includes('degraded')) return 'degraded';
    if (statuses.includes('maintenance')) return 'maintenance';
    return 'operational';
  }

  refresh(): void {
    // Simulate a status check by updating the lastChecked timestamp.
    const updated = this.servicesSubject.value.map((s) => ({
      ...s,
      lastChecked: new Date(),
    }));
    this.servicesSubject.next(updated);
  }
}
