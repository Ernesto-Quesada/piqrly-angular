import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout-succes/checkout-success.component';

export const routes: Routes = [
  { path: '', redirectTo: 'public', pathMatch: 'full' },

  // =========================
  // PUBLIC VIEW (QR / EVENTS)
  // =========================

  {
    path: 'viewpics/:qrid',
    loadComponent: () =>
      import('./viewpic/viewpic.component').then((m) => m.ViewpicComponent),
  },

  // ✅ EVENT INVITE (NEW)
  // This is what Flutter will now generate:
  //   /events/invite/<code>
  {
    path: 'events/invite/:code',
    loadComponent: () =>
      import('./viewpic/viewpic.component').then((m) => m.ViewpicComponent),
  },
  //  {
  //   path: 'events/invite/:code',
  //   loadComponent: () =>
  //     import('./event-invite/event-invite.component').then(
  //       (m) => m.EventInviteComponent,
  //     ),
  // },

  // =========================
  // CHECKOUT
  // =========================
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout-success', component: CheckoutSuccessComponent },

  // Optional fallback
  { path: '**', redirectTo: '' },
];
