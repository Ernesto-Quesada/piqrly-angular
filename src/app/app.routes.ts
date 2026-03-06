import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout-succes/checkout-success.component';

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

  // Optional fallback
  { path: '**', redirectTo: '' },
];
