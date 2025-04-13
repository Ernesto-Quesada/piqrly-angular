import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { appStoreProviders } from './store/app.store';
import { NgxStripeModule } from 'ngx-stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    ...appStoreProviders,
    provideHttpClient(withInterceptorsFromDi()),
    //importProvidersFrom(HttpClientModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(
      NgxStripeModule.forRoot(
        'pk_test_51RCXTD4Je26dbkiYQmhsN66oK2Z4LQF2owx1Ybscen0YJnnRV0YuIzCr2HySJHJHE4bGm6BcBXqPuuFIVsnBYLtu00ffGSM70m'
      )
    ),
  ],
};
