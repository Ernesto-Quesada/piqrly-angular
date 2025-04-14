import { createAction, props } from '@ngrx/store';

import { Image, LandingData } from '..//../models/image';

export const checkoutCartStarted = createAction(
  '[Cart] Checkout Started' // Payload can be refined based on your BE contract.
);

export const setChosenSize = createAction(
  '[Cart] Set Chosen Size',
  props<{ size: 'small' | 'full' }>()
);

export const addImageToCart = createAction(
  '[Cart] Add Picture to Cart',
  props<{
    cartItem: { image: Image; size: 'small' | 'full' | null; price: number };
  }>()
);
// export const imageAddedinThumbnailStrip = createAction(
//   '[Cart] Image Added in Thumbnail Strip',
//   props<{ image: Image }>()
// );
export const removeImageFromCart = createAction(
  '[Cart] Remove Picture from cart',
  props<{ pictureId: string }>()
);

export const shopCartTotalPrices = createAction(
  '[Cart] Cart Total Prices Updated',
  props<{ totalPrice: number }>()
);

export const checkoutCartSuccess = createAction(
  '[Cart] Checkout Success',
  props<{ response: any }>()
);
// Checkout failure (API call).
export const checkoutCartFailure = createAction(
  '[Cart] Checkout Failure',
  props<{ error: any }>()
);

// TODO compare to shopcart state becasue the state can be used as payload
export const checkoutCartPayload = createAction(
  '[Cart] Checkout Started',
  props<{ payload: any }>() // Payload can be refined based on your BE contract.
);
export const updateCheckoutForm = createAction(
  '[Checkout] Update Form',
  props<{ formValues: { fullName: string; email: string } }>()
);
