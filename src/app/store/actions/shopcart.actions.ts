import { createAction, props } from '@ngrx/store';

import { QrViewResponse } from '..//../models/qr-read-response';
import { Image } from '..//../models/response';
export const checkoutCartStarted = createAction(
  '[ShopCart] Checkout Started', // Payload can be refined based on your BE contract.
);
// shopcart.actions.ts
export const setCartContext = createAction(
  '[ShopCart] Set Cart Context',
  props<{ contextKey: string }>(),
);

export const setChosenSize = createAction(
  '[ShopCart] Set Chosen Size',
  props<{ size: 'small' | 'full' }>(),
);

export const addImageToCart = createAction(
  '[ShopCart] Add Picture to ShopCart',
  props<{
    cartItem: {
      image: Image;
      size: 'small' | 'full' | 'royalty' | null;
      price: number;
    };
  }>(),
);
// export const imageAddedinThumbnailStrip = createAction(
//   '[ShopCart] Image Added in Thumbnail Strip',
//   props<{ image: Image }>()
// );
export const removeImageFromCart = createAction(
  '[ShopCart] Remove Picture from cart',
  props<{ pictureId: string }>(),
);

export const shopCartTotalPrices = createAction(
  '[ShopCart] ShopCart Total Prices Updated',
  props<{ totalPrice: number }>(),
);

export const checkoutCartSuccess = createAction(
  '[ShopCart] Checkout Success',
  props<{ response: any }>(),
);
// Checkout failure (API call).
export const checkoutCartFailure = createAction(
  '[ShopCart] Checkout Failure',
  props<{ error: any }>(),
);

// TODO compare to shopcart state becasue the state can be used as payload
export const checkoutCartPayload = createAction(
  '[ShopCart] Checkout Started',
  props<{ payload: any }>(), // Payload can be refined based on your BE contract.
);
export const updateCheckoutForm = createAction(
  '[Checkout] Update Form',
  props<{ formValues: { fullName: string; email: string } }>(),
);
export const clearShopCart = createAction('[ShopCart] Clear Cart');
