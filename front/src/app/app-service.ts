import { inject, Injectable, signal } from '@angular/core';
import { TituloResponse } from './dtos/titulo-response.dto';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { PerfilDTO } from './dtos/perfil.dto';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly http = inject(HttpClient);
  readonly perfil = signal<PerfilDTO | null>(null);
  readonly cargandoPerfil = signal(false);
  readonly errorPerfil = signal('');

  obtenerTitulo(): Observable<TituloResponse> {
    return this.http.get<TituloResponse>(`${API_BASE_URL}/app/titulo`);
  }

  obtenerPerfil(): Observable<PerfilDTO | null> {
    if (!this.perfil()) {
      this.cargandoPerfil.set(true);
      this.errorPerfil.set('');

      return this.http.get<PerfilDTO>(`${API_BASE_URL}/auth/profile`).pipe(
        tap({
          next: (perfil: PerfilDTO) => {
            this.perfil.set(perfil);
          },
          error: () => {
            this.errorPerfil.set('No fue posible cargar la información de tu perfil.');
          },
        }),
        finalize(() => this.cargandoPerfil.set(false)),
      );
    }

    return of(this.perfil());
  }

  limpiarPerfil(): void {
    this.perfil.set(null);
    this.errorPerfil.set('');
  }
}
