import { inject, Injectable, signal } from '@angular/core';
import { TituloResponse } from './dtos/titulo-response.dto';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { PerfilDTO } from './dtos/perfil.dto';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private http = inject(HttpClient);
  perfil = signal<PerfilDTO | null>(null);
  obtenerTitulo(): Observable<TituloResponse> {
    return this.http.get<TituloResponse>('http://localhost:3000/app/titulo');
  }
  obtenerPerfil(): Observable<PerfilDTO | null> {
    if (!this.perfil()) {
      return this.http.get<PerfilDTO>('http://localhost:3000/app/perfil').pipe(
        tap({
          next: (perfil: PerfilDTO) => {
            this.perfil.set(perfil);
          },
        }),
      );
    }
    return of(this.perfil());
  }
}
