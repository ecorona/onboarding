import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getValidToken();

  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  const authenticatedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.endsWith('/auth/login')
      ) {
        const returnUrl = router.url;
        authService.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl } });
      }

      return throwError(() => error);
    }),
  );
};
