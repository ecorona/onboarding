import { Component, inject, OnInit } from '@angular/core';
import { AppService } from '../app-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  readonly appService = inject(AppService);

  ngOnInit(): void {
    this.appService.obtenerPerfil().subscribe({ error: () => undefined });
  }
}
