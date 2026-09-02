import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { guestGuard } from './auth/guest-guard';
import { LoginComponent } from './auth/login/login';
import { HomeComponent } from './home/home';
import { PerfilComponent } from './perfil/perfil';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios').then((module) => module.Usuarios),
    canActivate: [authGuard],
    title: 'Usuarios',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
