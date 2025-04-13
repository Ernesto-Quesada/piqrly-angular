import { createAction, props } from '@ngrx/store';

import { Image } from '..//../models/image';

// Set the chosen size for the entire transaction.
export const setChosenSize = createAction(
  '[Cart] Set Chosen Size',
  props<{ size: 'small' | 'full' }>()
);

// Add a picture to the cart.
// Note: We ensure duplicates are not allowed at the reducer level.
export const addImageToCart = createAction(
  '[Cart] Add Picture to Cart',
  props<{
    cartItem: { image: Image; size: 'small' | 'full' | null; price: number };
  }>()
);

// Remove a picture from the cart.
export const removePictureFromCart = createAction(
  '[Cart] Remove Picture',
  props<{ pictureId: string }>()
);
export const loadGlobalPrices = createAction('[Cart] Load Global Prices');
// Success action after fetching the price for a picture (mock API call).
export const loadPicturePriceSuccess = createAction(
  '[Cart] Load Picture Price Success',
  props<{ price: { small: number; full: number } }>()
);

export const cartTotalPricesAction = createAction(
  '[Cart] Cart Total Prices Updated',
  props<{ totalPrice: number }>()
);

// Checkout success (API call).

// Checkout failure (API call).
export const checkoutCartFailure = createAction(
  '[Cart] Checkout Failure',
  props<{ error: any }>()
);
