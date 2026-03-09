import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  tenantId: string;
  lastLogin: Date;
  mfaEnabled: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const MOCK_USER: AuthUser = {
  id: 'u1',
  username: 'admin',
  email: 'admin@example.com',
  roles: ['admin', 'viewer'],
  tenantId: 't1',
  lastLogin: new Date(),
  mfaEnabled: false,
};

const INITIAL_STATE: AuthState = {
  user: MOCK_USER,
  isAuthenticated: true,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>(INITIAL_STATE);

  readonly authState$: Observable<AuthState> = this.authStateSubject.asObservable();

  readonly currentUser$: Observable<AuthUser | null> = this.authState$.pipe(map((s) => s.user));

  get state(): AuthState {
    return this.authStateSubject.value;
  }

  login(username: string, _password: string): Observable<AuthState> {
    return timer(500).pipe(
      switchMap(() => {
        const user: AuthUser = {
          id: crypto.randomUUID(),
          username,
          email: `${username}@example.com`,
          roles: ['viewer'],
          tenantId: 't1',
          lastLogin: new Date(),
          mfaEnabled: false,
        };
        const newState: AuthState = {
          user,
          isAuthenticated: true,
          accessToken: `token-${crypto.randomUUID()}`,
          refreshToken: `refresh-${crypto.randomUUID()}`,
        };
        this.authStateSubject.next(newState);
        return [newState];
      }),
    );
  }

  logout(): void {
    this.authStateSubject.next({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  }

  refreshToken(): Observable<AuthState> {
    return timer(500).pipe(
      switchMap(() => {
        const updated: AuthState = {
          ...this.authStateSubject.value,
          accessToken: `token-${crypto.randomUUID()}`,
        };
        this.authStateSubject.next(updated);
        return [updated];
      }),
    );
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  hasRole(role: string): boolean {
    return this.authStateSubject.value.user?.roles.includes(role) ?? false;
  }

  getCurrentUser(): AuthUser | null {
    return this.authStateSubject.value.user;
  }

  enableMfa(): void {
    const user = this.authStateSubject.value.user;
    if (user) {
      this.authStateSubject.next({
        ...this.authStateSubject.value,
        user: { ...user, mfaEnabled: true },
      });
    }
  }

  getTokenExpiry(): Date | null {
    if (!this.authStateSubject.value.accessToken) return null;
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    return expiry;
  }
}
