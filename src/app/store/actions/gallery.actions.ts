import { createAction, props } from '@ngrx/store';

export const galleryEntered = createAction(
  '[Gallery] Entered',
  props<{ galleryId: string }>(),
);

export const galleryCheckoutRequested = createAction(
  '[Gallery] Checkout Requested',
  props<{ returnUrl: string }>(),
);
