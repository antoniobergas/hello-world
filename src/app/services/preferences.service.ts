import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  dashboardLayout: 'grid' | 'list';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  itemsPerPage: 25,
  notifications: { email: true, push: true, sms: false },
  accessibility: { highContrast: false, fontSize: 'medium' },
  dashboardLayout: 'grid',
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private preferencesSubject = new BehaviorSubject<UserPreferences>({ ...DEFAULT_PREFERENCES });

  readonly preferences$: Observable<UserPreferences> = this.preferencesSubject.asObservable();

  readonly theme$: Observable<string> = this.preferences$.pipe(map((p) => p.theme));

  get preferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  getPreference<T>(key: keyof UserPreferences): T {
    return this.preferencesSubject.value[key] as T;
  }

  setPreference<T>(key: keyof UserPreferences, value: T): void {
    this.preferencesSubject.next({
      ...this.preferencesSubject.value,
      [key]: value,
    });
  }

  resetToDefaults(): void {
    this.preferencesSubject.next({ ...DEFAULT_PREFERENCES });
  }

  exportPreferences(): string {
    return JSON.stringify(this.preferencesSubject.value);
  }

  importPreferences(json: string): void {
    try {
      const parsed = JSON.parse(json) as UserPreferences;
      this.preferencesSubject.next({ ...DEFAULT_PREFERENCES, ...parsed });
    } catch {
      // invalid JSON - ignore
    }
  }

  getTheme(): UserPreferences['theme'] {
    return this.preferencesSubject.value.theme;
  }

  getLanguage(): string {
    return this.preferencesSubject.value.language;
  }

  getItemsPerPage(): number {
    return this.preferencesSubject.value.itemsPerPage;
  }
}
