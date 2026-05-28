import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './guards/auth-guard';

export const routes: Routes = [
  //LANDING PAGE E AUTENTICAZIONE
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },

  //VISTA ADMIN: separata e fuori dalle tabs
  {
    path: 'admin-view',
    canActivate: [authGuard],
    data: { roles: ['amministratore'] },
    loadComponent: () =>
      import('./pages/admin-view/admin-view.page').then((m) => m.AdminViewPage),
  },

  //AREA APPLICAZIONE PER TUTOR E STUDENTI. QUI COMPARE LA TAB
  {
    path: 'tabs',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'search-tutor',
        loadComponent: () =>
          import('./pages/search-tutor/search-tutor.page').then(
            (m) => m.SearchTutorPage,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages/messages.page').then((m) => m.MessagesPage),
      },
      {
        path: 'tutor-profile',
        data: { roles: ['tutor'] },
        loadComponent: () =>
          import('./pages/tutor-profile/tutor-profile.page').then(
            (m) => m.TutorProfilePage,
          ),
      },
      {
        path: 'student-profile',
        data: { roles: ['studente'] },
        loadComponent: () =>
          import('./pages/student-profile/student-profile.page').then(
            (m) => m.StudentProfilePage,
          ),
      },
      {
        path: 'tutor-dashboard',
        data: { roles: ['tutor'] },
        loadComponent: () =>
          import('./pages/tutor-dashboard/tutor-dashboard.page').then(
            (m) => m.TutorDashboardPage,
          ),
      },
      {
        path: '',
        redirectTo: 'search-tutor',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'tutor-detail/:id',
    canActivate: [authGuard],
    data: { roles: ['studente', 'tutor'] },
    loadComponent: () =>
      import('./pages/tutor-detail/tutor-detail.page').then(
        (m) => m.TutorDetailPage,
      ),
  },

  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.page').then(
        (m) => m.LandingPagePage,
      ),
  },
  // se il path è sbagliato, reindirizza alla landing
  {
    path: '**',
    redirectTo: '',
  },
];
