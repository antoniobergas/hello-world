import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthService] });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start authenticated with mock user', () => {
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getCurrentUser()?.username).toBe('admin');
  });

  it('should return correct auth state via state getter', () => {
    expect(service.state.isAuthenticated).toBe(true);
    expect(service.state.accessToken).toBe('mock-access-token');
  });

  it('should log out and clear state', () => {
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
    expect(service.state.accessToken).toBeNull();
  });

  it('should check role membership', () => {
    expect(service.hasRole('admin')).toBe(true);
    expect(service.hasRole('superuser')).toBe(false);
  });

  it('should enable MFA for current user', () => {
    service.enableMfa();
    expect(service.getCurrentUser()?.mfaEnabled).toBe(true);
  });

  it('should return null for token expiry when logged out', () => {
    service.logout();
    expect(service.getTokenExpiry()).toBeNull();
  });

  it('should return a future expiry date when authenticated', () => {
    const expiry = service.getTokenExpiry();
    expect(expiry).not.toBeNull();
    expect(expiry!.getTime()).toBeGreaterThan(Date.now());
  });

  it('should login and emit new state after delay', async () => {
    service.logout();
    const state = await firstValueFrom(service.login('bob', 'pass'));
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getCurrentUser()?.username).toBe('bob');
  });

  it('should refresh token and update accessToken', async () => {
    const oldToken = service.state.accessToken;
    await firstValueFrom(service.refreshToken());
    expect(service.state.accessToken).not.toBe(oldToken);
  });

  it('should emit authenticated state via authState$', async () => {
    const state = await firstValueFrom(service.authState$);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should emit current user via currentUser$', async () => {
    const user = await firstValueFrom(service.currentUser$);
    expect(user?.username).toBe('admin');
  });

  it('should return false for hasRole after logout', () => {
    service.logout();
    expect(service.hasRole('admin')).toBe(false);
  });
});
