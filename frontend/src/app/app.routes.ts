import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./pages/admin-view/admin-view.page').then((m) => m.AdminViewPage),
  },

  //AREA APPLICAZIONE PER TUTOR E STUDENTI. QUI COMPARE LA TAB
  {
    path: 'tabs',
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
        loadComponent: () =>
          import('./pages/tutor-profile/tutor-profile.page').then(
            (m) => m.TutorProfilePage,
          ),
      },
      {
        path: 'student-profile',
        loadComponent: () =>
          import('./pages/student-profile/student-profile.page').then(
            (m) => m.StudentProfilePage,
          ),
      },
      {
        path: 'tutor-dashboard',
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
    path: 'tutor-detail',
    loadComponent: () =>
      import('./pages/tutor-detail/tutor-detail.page').then(
        (m) => m.TutorDetailPage,
      ),
  },

  // se il path è sbagliato, reindirizza alla landing
  {
    path: '**',
    redirectTo: '',
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.page').then(
        (m) => m.LandingPagePage,
      ),
  },
];
