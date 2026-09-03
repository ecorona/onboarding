import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { AppService } from '../app-service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  readonly appService = inject(AppService);

  ngOnInit(): void {
    this.appService.obtenerPerfil().subscribe({ error: () => undefined });
  }
}
