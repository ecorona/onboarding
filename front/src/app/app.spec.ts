import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppService } from './app-service';
import { AppComponent } from './app';
import { AuthService } from './auth/auth';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: AppService,
          useValue: {
            obtenerTitulo: () =>
              of({ titulo: 'Aplicación de prueba', fechaCreacion: new Date('2026-01-01') }),
            limpiarPerfil: () => undefined,
          },
        },
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(false),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aplicación de prueba');
  });
});
