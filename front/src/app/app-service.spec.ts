import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from './api.config';
import { AppService } from './app-service';

describe('AppService', () => {
  let service: AppService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AppService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads the authenticated user profile from the backend', () => {
    const profile = {
      id: 7,
      nombre: 'Usuario real',
      email: 'user@example.com',
      activo: true,
      emailValidated: true,
    };

    service.obtenerPerfil().subscribe();

    const request = httpTesting.expectOne(`${API_BASE_URL}/auth/profile`);
    expect(request.request.method).toBe('GET');
    request.flush(profile);

    expect(service.perfil()).toEqual(profile);
    expect(service.cargandoPerfil()).toBe(false);
  });
});
