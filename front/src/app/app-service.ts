import { inject, Injectable, signal } from '@angular/core';
import { TituloResponse } from './dtos/titulo-response.dto';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { PerfilDTO } from './dtos/perfil.dto';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private http = inject(HttpClient);
  perfil = signal<PerfilDTO | null>(null);
  obtenerTitulo(): Observable<TituloResponse> {
    return this.http.get<TituloResponse>(`${API_BASE_URL}/app/titulo`);
  }
  obtenerPerfil(): Observable<PerfilDTO | null> {
    if (!this.perfil()) {
      return this.http.get<PerfilDTO>(`${API_BASE_URL}/app/perfil`).pipe(
        tap({
          next: (perfil: PerfilDTO) => {
            this.perfil.set(perfil);
          },
        }),
      );
    }
    return of(this.perfil());
  }

  limpiarPerfil(): void {
    this.perfil.set(null);
  }
}
