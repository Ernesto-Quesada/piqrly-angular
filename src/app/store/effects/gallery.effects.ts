import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import {
  galleryEntered,
  galleryCheckoutRequested,
} from '../actions/gallery.actions';
import { clearShopCart } from '../actions/shopcart.actions';
import { Store } from '@ngrx/store';
import { ShopCart } from '../../models/shopCart';

@Injectable()
export class GalleryEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private store = inject<Store<{ shopCart: ShopCart }>>(Store);

  // keep your exact keys
  private readonly CONTEXT_KEY = 'viewgallery_context';
  private readonly SELECT_MODE_KEY = 'viewgallery_select_mode';

  /**
   * Enter gallery:
   * - if switching galleries: clear cart + reset select mode
   * - always persist context
   */
  galleryEntered$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(galleryEntered),
        tap(({ galleryId }) => {
          const nextContext = `GALLERY:${galleryId}`;
          const prevContext = sessionStorage.getItem(this.CONTEXT_KEY);
          const contextChanged = !!prevContext && prevContext !== nextContext;

          if (contextChanged) {
            this.store.dispatch(clearShopCart());
            sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
          }

          sessionStorage.setItem(this.CONTEXT_KEY, nextContext);
        }),
      ),
    { dispatch: false },
  );

  /**
   * Checkout:
   * - persist returnUrl
   * - navigate to checkout
   */
  galleryCheckout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(galleryCheckoutRequested),
        tap(({ returnUrl }) => {
          sessionStorage.setItem('returnUrl', returnUrl);
          this.router.navigate(['/checkout']);
        }),
      ),
    { dispatch: false },
  );
}
