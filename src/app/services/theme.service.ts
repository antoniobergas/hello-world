import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>('light');
  readonly theme = this.themeSignal.asReadonly();

  toggle(): void {
    const next: Theme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  get isDark(): boolean {
    return this.themeSignal() === 'dark';
  }
}
