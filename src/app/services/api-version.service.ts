import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ApiVersionStatus = 'current' | 'supported' | 'deprecated' | 'unsupported';

export interface ApiVersion {
  version: string;
  status: ApiVersionStatus;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  features: string[];
  breakingChanges: string[];
}

const VERSIONS: ApiVersion[] = [
  {
    version: 'v1',
    status: 'deprecated',
    releaseDate: new Date('2023-01-01'),
    deprecationDate: new Date('2024-01-01'),
    sunsetDate: new Date('2025-01-01'),
    features: ['items-crud', 'basic-auth'],
    breakingChanges: [],
  },
  {
    version: 'v2',
    status: 'supported',
    releaseDate: new Date('2024-01-01'),
    deprecationDate: new Date('2025-06-01'),
    features: ['items-crud', 'basic-auth', 'filtering', 'pagination'],
    breakingChanges: ['removed-xml-support'],
  },
  {
    version: 'v3',
    status: 'current',
    releaseDate: new Date('2025-01-01'),
    features: ['items-crud', 'jwt-auth', 'filtering', 'pagination', 'bulk-ops', 'webhooks'],
    breakingChanges: ['jwt-required', 'removed-basic-auth'],
  },
];

@Injectable({ providedIn: 'root' })
export class ApiVersionService {
  private versionsSubject = new BehaviorSubject<ApiVersion[]>(VERSIONS);
  private currentVersionSubject = new BehaviorSubject<string>('v3');

  readonly versions$: Observable<ApiVersion[]> = this.versionsSubject.asObservable();

  readonly currentVersion$: Observable<string> = this.currentVersionSubject.asObservable();

  readonly deprecatedVersions$: Observable<ApiVersion[]> = this.versions$.pipe(
    map((versions) => versions.filter((v) => v.status === 'deprecated')),
  );

  get currentVersion(): string {
    return this.currentVersionSubject.value;
  }

  get versions(): ApiVersion[] {
    return this.versionsSubject.value;
  }

  getVersion(version: string): ApiVersion | undefined {
    return this.versionsSubject.value.find((v) => v.version === version);
  }

  isSupported(version: string): boolean {
    const v = this.getVersion(version);
    return v?.status === 'current' || v?.status === 'supported';
  }

  isDeprecated(version: string): boolean {
    return this.getVersion(version)?.status === 'deprecated';
  }

  negotiate(requested: string): string {
    if (this.isSupported(requested)) return requested;
    if (this.isDeprecated(requested)) return this.currentVersionSubject.value;
    return this.currentVersionSubject.value;
  }

  getSupportedVersions(): ApiVersion[] {
    return this.versionsSubject.value.filter(
      (v) => v.status === 'current' || v.status === 'supported',
    );
  }

  getLatestVersion(): ApiVersion {
    return this.versionsSubject.value.find((v) => v.status === 'current')!;
  }

  setCurrentVersion(version: string): void {
    if (this.getVersion(version)) {
      this.currentVersionSubject.next(version);
    }
  }
}
