import { Component, inject, OnInit, signal } from '@angular/core';
import { AppService } from '../app-service';
import { PerfilDTO } from '../dtos/perfil.dto';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
})
export class PerfilComponent {
  appService = inject(AppService);
}
