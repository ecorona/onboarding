import { Component, inject, OnInit } from '@angular/core';
import { AppService } from '../app-service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
})
export class PerfilComponent implements OnInit {
  readonly appService = inject(AppService);

  ngOnInit(): void {
    this.appService.obtenerPerfil().subscribe({ error: () => undefined });
  }
}
