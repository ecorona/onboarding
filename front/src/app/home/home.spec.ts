import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { AppService } from '../app-service';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: AppService,
          useValue: {
            perfil: signal({
              id: 1,
              nombre: 'Usuario de prueba',
              email: 'test@example.com',
              activo: true,
              emailValidated: true,
            }),
            obtenerPerfil: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
