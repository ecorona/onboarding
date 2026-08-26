import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { PerfilComponent } from './perfil/perfil';

export const routes: Routes = [
  { //redireccionar a una pagina por defecto cuando no se especifica una ruta
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path:'home',
    component: HomeComponent,
  },
   {
    path:'perfil',
    component: PerfilComponent,
  }
];
