import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout-succes/checkout-success.component';
import { TermsComponent } from './legal/terms/terms.component';
import { PrivacyComponent } from './legal/privacy/privacy.component';
import { CopyrightComponent } from './legal/copyright/copyright.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // ✅ Make / go to the landing page
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },

  // ✅ Keep your sidebar link working (/public)
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

  // ✅ NEW: selection gallery (PIN gate lives here)
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
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'copyright', component: CopyrightComponent },
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

  // Optional fallback
  { path: '**', redirectTo: '' },
];
