import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CheckoutCartPayload } from './../../models/shopCart';

export const selectCheckoutState = createFeatureSelector<CheckoutCartPayload>('checkoutPayload');



export const selectTotalPrice = createSelector(
    selectCheckoutState,
  (state: CheckoutCartPayload) => state.totalPrice
);