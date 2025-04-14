import { createAction, props } from '@ngrx/store';
import { CheckoutCartPayload } from '../../models/shopCart';
import { Image } from '../../models/image';

// export const checkoutCartStarted = createAction(
//   '[Cart] Checkout Started'  // Payload can be refined based on your BE contract.
// );

// export const checkoutCartPayload = createAction(
//   '[Cart] Checkout Started',
//   props<{ payload: CheckoutCartPayload }>() // Payload can be refined based on your BE contract.
// );

// export const checkoutCartSuccess = createAction(
//   '[Cart] Checkout Success',
//   props<{ response: any }>()
// );

// Checkout failure (API call).
// export const checkoutCartFailure = createAction(
//   '[Cart] Checkout Failure',
//   props<{ error: any }>()
// );
// export const setCheckoutData = createAction(
//   '[Checkout] Set Checkout Data',
//   props<{
//     images: Image[];
//     chosenSize: 'small' | 'full' | null;
//     totalPrice: number;
//   }>()
// );
