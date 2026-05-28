import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
} from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return controllaAccesso(route.data['roles'] as string[] | undefined, state.url);
};

export const authChildGuard: CanActivateChildFn = (route, state) => {
  return controllaAccesso(route.data['roles'] as string[] | undefined, state.url);
};

function controllaAccesso(ruoliRichiesti: string[] | undefined, url: string) {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const tipologiaUtente = localStorage
    .getItem('tipologia_utente')
    ?.toLowerCase();
  const ruoliNormalizzati = ruoliRichiesti?.map((ruolo) => ruolo.toLowerCase());

  if (!token || !tipologiaUtente) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: url },
    });
  }

  if (ruoliNormalizzati?.length && !ruoliNormalizzati.includes(tipologiaUtente)) {
    return router.createUrlTree([rottaPredefinitaPerRuolo(tipologiaUtente)]);
  }

  return true;
}

function rottaPredefinitaPerRuolo(tipologiaUtente: string): string {
  if (tipologiaUtente === 'amministratore') {
    return '/admin-view';
  }

  if (tipologiaUtente === 'tutor') {
    return '/tabs/tutor-dashboard';
  }

  return '/tabs/search-tutor';
}
