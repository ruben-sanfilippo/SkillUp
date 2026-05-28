import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const richiestaConToken = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(richiestaConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('tipologia_utente');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
