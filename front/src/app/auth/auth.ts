import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { LoginRequest, LoginResponse } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'access_token';
  private readonly accessTokenState = signal<string | null>(null);

  readonly accessToken = this.accessTokenState.asReadonly();
  readonly isAuthenticated = computed(() => this.accessTokenState() !== null);

  restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedToken = localStorage.getItem(this.storageKey);

    if (storedToken && !this.isTokenExpired(storedToken)) {
      this.accessTokenState.set(storedToken);
      return;
    }

    localStorage.removeItem(this.storageKey);
    this.accessTokenState.set(null);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials)
      .pipe(tap(({ accessToken }) => this.saveToken(accessToken)));
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }

    this.accessTokenState.set(null);
  }

  getValidToken(): string | null {
    const token = this.accessTokenState();

    if (!token || this.isTokenExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  hasValidSession(): boolean {
    return this.getValidToken() !== null;
  }

  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, token);
    }

    this.accessTokenState.set(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return true;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(normalizedPayload)) as { exp?: number };

      return typeof decodedPayload.exp !== 'number' || decodedPayload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
