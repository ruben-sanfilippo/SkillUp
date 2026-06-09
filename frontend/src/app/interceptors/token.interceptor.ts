import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
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
      const messaggioErrore = String(
        error.error?.message || error.error?.error || '',
      ).toLowerCase();
      const accountBloccato =
        error.status === 403 && messaggioErrore.includes('bloccato');

      if (error.status === 401 || accountBloccato) {
        localStorage.removeItem('token');
        localStorage.removeItem('tipologia_utente');
        localStorage.removeItem('skillup_messaggi_non_letti');
        if (accountBloccato) {
          window.alert('Il tuo account è stato bloccato. Verrai disconnesso.');
        }
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
