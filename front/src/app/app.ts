import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AppService } from './app-service';
import { TituloResponse } from './dtos/titulo-response.dto';
import { DatePipe } from '@angular/common';
import { AuthService } from './auth/auth';

@Component({
  selector: 'app-root', //<app-root></app-root>
  imports: [RouterOutlet, RouterLink, DatePipe],
  templateUrl: './app.html',
})
export class AppComponent implements OnInit {
  readonly appService = inject(AppService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  titulo_aplicacion = signal('Mi título inicial');
  fecha_creacion = signal<Date | null>(null);
  ngOnInit() {
    this.appService.obtenerTitulo().subscribe({
      next: (titulo: TituloResponse) => {
        this.titulo_aplicacion.set(titulo.titulo);
        this.fecha_creacion.set(titulo.fechaCreacion);
      },
      error: (err) => {
        console.error('error al obtener el titulo', err);
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.appService.limpiarPerfil();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
