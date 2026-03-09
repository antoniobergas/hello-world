import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthIndicator {
  name: string;
  status: HealthStatus;
  message: string;
  latencyMs: number;
  lastChecked: Date;
  details?: Record<string, unknown>;
}

export interface HealthReport {
  status: HealthStatus;
  version: string;
  uptime: number;
  timestamp: Date;
  indicators: HealthIndicator[];
}

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  private storageService = inject(StorageService);
  private startTime = Date.now();
  private reportSubject = new BehaviorSubject<HealthReport>(this.buildReport());

  readonly report$: Observable<HealthReport> = this.reportSubject.asObservable();

  readonly status$: Observable<HealthStatus> = this.report$.pipe(map((r) => r.status));

  readonly isHealthy$: Observable<boolean> = this.status$.pipe(
    map((s) => s === 'healthy'),
  );

  get report(): HealthReport {
    return this.reportSubject.value;
  }

  check(): HealthReport {
    const report = this.buildReport();
    this.reportSubject.next(report);
    return report;
  }

  private buildReport(): HealthReport {
    const indicators = [
      this.checkStorage(),
      this.checkMemory(),
      this.checkApplication(),
    ];

    const hasUnhealthy = indicators.some((i) => i.status === 'unhealthy');
    const hasDegraded = indicators.some((i) => i.status === 'degraded');
    const overallStatus: HealthStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    return {
      status: overallStatus,
      version: '1.0.0',
      uptime: Date.now() - this.startTime,
      timestamp: new Date(),
      indicators,
    };
  }

  private checkStorage(): HealthIndicator {
    const start = Date.now();
    try {
      const testKey = '__health_check__';
      this.storageService.set(testKey, 'ok');
      const val = this.storageService.get<string>(testKey, '');
      this.storageService.remove(testKey);
      return {
        name: 'storage',
        status: val === 'ok' ? 'healthy' : 'degraded',
        message: val === 'ok' ? 'Storage is operational' : 'Storage read/write mismatch',
        latencyMs: Date.now() - start,
        lastChecked: new Date(),
      };
    } catch {
      return {
        name: 'storage',
        status: 'unhealthy',
        message: 'Storage is unavailable',
        latencyMs: Date.now() - start,
        lastChecked: new Date(),
      };
    }
  }

  private checkMemory(): HealthIndicator {
    const start = Date.now();
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memoryGB = nav.deviceMemory ?? 4;
    const status: HealthStatus = memoryGB >= 2 ? 'healthy' : 'degraded';
    return {
      name: 'memory',
      status,
      message: status === 'healthy' ? 'Memory adequate' : 'Low memory detected',
      latencyMs: Date.now() - start,
      lastChecked: new Date(),
      details: { deviceMemoryGB: memoryGB },
    };
  }

  private checkApplication(): HealthIndicator {
    const start = Date.now();
    return {
      name: 'application',
      status: 'healthy',
      message: 'Application is running',
      latencyMs: Date.now() - start,
      lastChecked: new Date(),
      details: { uptime: Date.now() - this.startTime },
    };
  }

  getMetrics(): Record<string, unknown> {
    const report = this.reportSubject.value;
    return {
      status: report.status,
      uptime: report.uptime,
      version: report.version,
      indicatorCount: report.indicators.length,
      healthyIndicators: report.indicators.filter((i) => i.status === 'healthy').length,
    };
  }
}
