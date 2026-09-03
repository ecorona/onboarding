import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api.config';
import { UsuariosApi } from './usuarios-api';

describe('UsuariosApi', () => {
  let api: UsuariosApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(UsuariosApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('envía los parámetros de paginación, búsqueda y orden', () => {
    api
      .obtenerTodos({
        page: 2,
        pageSize: 25,
        orderBy: 'nombre',
        order: 'DESC',
        search: 'ana',
      })
      .subscribe();

    const request = httpTesting.expectOne(
      `${API_BASE_URL}/usuarios?page=2&pageSize=25&orderBy=nombre&order=DESC&search=ana`,
    );

    expect(request.request.method).toBe('GET');
    request.flush({ items: [], total: 0 });
  });

  it('normaliza la respuesta anterior basada en un arreglo', () => {
    let resultado: { items: unknown[]; total: number } | undefined;

    api
      .obtenerTodos({
        page: 1,
        pageSize: 10,
        orderBy: 'id',
        order: 'ASC',
      })
      .subscribe((response) => {
        resultado = response;
      });

    const request = httpTesting.expectOne(
      `${API_BASE_URL}/usuarios?page=1&pageSize=10&orderBy=id&order=ASC`,
    );
    request.flush([
      {
        id: 1,
        nombre: 'Ana Pérez',
        email: 'ana@example.com',
        activo: true,
        emailValidated: false,
      },
    ]);

    expect(resultado?.items).toHaveLength(1);
    expect(resultado?.total).toBe(1);
  });

  it('usa los endpoints del CRUD de usuarios', () => {
    const usuario = {
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'Segura123!',
    };

    api.crear(usuario).subscribe();
    const crearRequest = httpTesting.expectOne(`${API_BASE_URL}/usuarios`);
    expect(crearRequest.request.method).toBe('POST');
    expect(crearRequest.request.body).toEqual(usuario);
    crearRequest.flush({ id: 1, ...usuario, activo: true, emailValidated: false });

    api.actualizar(1, { nombre: 'Ana López' }).subscribe();
    const editarRequest = httpTesting.expectOne(`${API_BASE_URL}/usuarios/1`);
    expect(editarRequest.request.method).toBe('PATCH');
    expect(editarRequest.request.body).toEqual({ nombre: 'Ana López' });
    editarRequest.flush({ affected: 1 });

    api.eliminar(1).subscribe();
    const eliminarRequest = httpTesting.expectOne(`${API_BASE_URL}/usuarios/1`);
    expect(eliminarRequest.request.method).toBe('DELETE');
    eliminarRequest.flush({ affected: 1 });
  });
});
