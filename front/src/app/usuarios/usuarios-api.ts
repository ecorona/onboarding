import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export type UsuarioOrderBy = 'id' | 'nombre' | 'email';
export type SortOrder = 'ASC' | 'DESC';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  emailValidated: boolean;
}

export interface CrearUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface ActualizarUsuarioRequest {
  nombre: string;
}

export interface UsuariosQuery {
  page: number;
  pageSize: number;
  orderBy: UsuarioOrderBy;
  order: SortOrder;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/usuarios`;

  obtenerTodos(query: UsuariosQuery): Observable<Usuario[]> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('orderBy', query.orderBy)
      .set('order', query.order);

    if (query.search) {
      params = params.set('search', query.search);
    }

    return this.http.get<Usuario[]>(this.endpoint, { params });
  }

  crear(usuario: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.endpoint, usuario);
  }

  actualizar(id: number, usuario: ActualizarUsuarioRequest): Observable<unknown> {
    return this.http.patch(`${this.endpoint}/${id}`, usuario);
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}
