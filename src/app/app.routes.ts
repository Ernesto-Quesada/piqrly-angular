import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout-succes/checkout-success.component';
import { TermsComponent } from './legal/terms/terms.component';
import { PrivacyComponent } from './legal/privacy/privacy.component';
import { CopyrightComponent } from './legal/copyright/copyright.component';
import { adminGuard } from './guards/admin.guard';
import { EventPackageSuccessComponent } from './events/customers/event-package-success/event-package-success.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'public',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },

  // =========================
  // PUBLIC VIEW (QR / EVENTS)
  // =========================
  {
    path: 'viewpics/:qrid',
    loadComponent: () =>
      import('./viewpic/viewpic.component').then((m) => m.ViewpicComponent),
  },
  {
    path: 'events/invite/:code',
    loadComponent: () =>
      import('./viewpic/viewpic.component').then((m) => m.ViewpicComponent),
  },
  {
    path: 'viewgallery/:galleryId',
    loadComponent: () =>
      import('./viewgallery/viewgallery.component').then(
        (m) => m.ViewGalleryComponent,
      ),
  },

  // =========================
  // CHECKOUT
  // =========================
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout-success', component: CheckoutSuccessComponent },
  { path: 'event-package-success', component: EventPackageSuccessComponent },

  // =========================
  // AUTH
  // =========================
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },

  // =========================
  // LEGAL
  // =========================
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'copyright', component: CopyrightComponent },

  // =========================
  // ADMIN
  // =========================
  {
    path: 'admin/feedback',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/feedback/feedback.component').then(
        (m) => m.FeedbackComponent,
      ),
  },
  {
    path: 'admin/content-reports',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/content-reported/content-reported.component').then(
        (m) => m.ContentReportedComponent,
      ),
  },

  // =========================
  // MY EVENTS — child routes
  // =========================
  {
    path: 'my-events',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./events/owner/my-events/my-events.component').then(
            (m) => m.MyEventsComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./events/owner/event-edit/event-edit.component').then(
            (m) => m.EventEditComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./events/owner/event-edit/event-edit.component').then(
            (m) => m.EventEditComponent,
          ),
      },
      {
        path: ':id/packages',
        loadComponent: () =>
          import('./events/owner/event-package-manager/event-package-manager.component').then(
            (m) => m.EventPackagesManagerComponent,
          ),
      },
    ],
  },

  // =========================
  // OTHER
  // =========================
  {
    path: 'coming-soon',
    loadComponent: () =>
      import('./comingsoon/comingsoon.component').then(
        (m) => m.ComingSoonComponent,
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then((m) => m.ContactComponent),
  },

  { path: '**', redirectTo: '' },
];
