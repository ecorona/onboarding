import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppService } from '../app-service';

@Component({
  selector: 'app-perfil',
  imports: [MatCardModule, MatChipsModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './perfil.html',
})
export class PerfilComponent implements OnInit {
  readonly appService = inject(AppService);

  ngOnInit(): void {
    this.appService.obtenerPerfil().subscribe({ error: () => undefined });
  }
}
