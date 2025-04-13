import { name } from './../../node_modules/@leichtgewicht/ip-codec/types/index.d';
import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CheckoutSuccessComponent } from './checkout-succes/checkout-success.component';

export const routes: Routes = [
  { path: '', redirectTo: 'public', pathMatch: 'full' },

  {
    path: 'viewpics/:qrid',
    loadComponent: () =>
      import('./viewpic/viewpic.component').then((m) => m.ViewpicComponent),
  },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout-success', component: CheckoutSuccessComponent },

  //{ path: '**', redirectTo: '' }
];
