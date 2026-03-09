import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  apiBaseUrl: string;
  apiTimeout: number;
  maxItemsPerPage: number;
  enableDebugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  sessionTimeoutMs: number;
  maxUploadSizeMb: number;
  allowedOrigins: string[];
  features: Record<string, boolean>;
}

const DEFAULT_CONFIG: AppConfig = {
  environment: 'development',
  apiBaseUrl: 'http://localhost:3000/api',
  apiTimeout: 30_000,
  maxItemsPerPage: 50,
  enableDebugMode: true,
  logLevel: 'debug',
  sessionTimeoutMs: 3_600_000,
  maxUploadSizeMb: 10,
  allowedOrigins: ['http://localhost:4200'],
  features: {
    'bulk-operations': true,
    'advanced-search': true,
    'export-csv': false,
  },
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig>({ ...DEFAULT_CONFIG });

  readonly config$: Observable<AppConfig> = this.configSubject.asObservable();

  readonly environment$: Observable<Environment> = this.config$.pipe(map((c) => c.environment));

  readonly isProduction$: Observable<boolean> = this.environment$.pipe(
    map((env) => env === 'production'),
  );

  get config(): AppConfig {
    return this.configSubject.value;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.configSubject.value[key];
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.configSubject.next({ ...this.configSubject.value, [key]: value });
  }

  getSection<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.get(key);
  }

  isFeatureEnabled(featureKey: string): boolean {
    return this.configSubject.value.features[featureKey] ?? false;
  }

  setFeature(featureKey: string, enabled: boolean): void {
    const current = this.configSubject.value;
    this.configSubject.next({
      ...current,
      features: { ...current.features, [featureKey]: enabled },
    });
  }

  merge(partial: Partial<AppConfig>): void {
    this.configSubject.next({ ...this.configSubject.value, ...partial });
  }

  reset(): void {
    this.configSubject.next({ ...DEFAULT_CONFIG });
  }

  isEnvironment(env: Environment): boolean {
    return this.configSubject.value.environment === env;
  }

  getApiUrl(path: string): string {
    return `${this.configSubject.value.apiBaseUrl}/${path.replace(/^\//, '')}`;
  }
}
