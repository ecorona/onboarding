import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../api.config';
import { AuthService } from './auth';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('restores a valid token from localStorage', () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 3600);
    localStorage.setItem('access_token', token);

    authService.restoreSession();

    expect(authService.accessToken()).toBe(token);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('removes an expired token during startup', () => {
    localStorage.setItem('access_token', createToken(1));

    authService.restoreSession();

    expect(authService.accessToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('sends credentials to the backend and persists the returned token', () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 3600);

    authService.login({ email: 'test@example.com', password: 'Secret123!' }).subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'test@example.com',
      password: 'Secret123!',
    });
    request.flush({ accessToken: token });

    expect(localStorage.getItem('access_token')).toBe(token);
    expect(authService.isAuthenticated()).toBe(true);
  });
});

function createToken(exp: number): string {
  return `header.${btoa(JSON.stringify({ exp }))}.signature`;
}
