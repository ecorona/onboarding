import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { AppService } from '../app-service';
import { PerfilComponent } from './perfil';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilComponent],
      providers: [
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
            cargandoPerfil: signal(false),
            errorPerfil: signal(''),
            obtenerPerfil: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
