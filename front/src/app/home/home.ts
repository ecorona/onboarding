import { Component, inject } from '@angular/core';
import { AppService } from '../app-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
})
export class HomeComponent {
  appService = inject(AppService);
}
