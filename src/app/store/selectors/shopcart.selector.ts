import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShopCart } from './../../models/shopCart';

export const selectShopCartState = createFeatureSelector<ShopCart>('shopCart');

export const selectSubtotalPrice = createSelector(
  selectShopCartState,
  (state: ShopCart) => state.subtotalPrice
);
export const selectTotalPrice = createSelector(
  selectShopCartState,
  (state: ShopCart) => state.totalPrice
);
export const selectItems = createSelector(
  selectShopCartState,
  (state: ShopCart) => state.items
);

export const selectCartValid = createSelector(
  selectShopCartState,
  (state: ShopCart) =>
    state.items.length > 0 && state.items.every((item) => item.price > 0)
);
export const selectSelectedPictures = createSelector(
  selectShopCartState,
  (state: ShopCart) => state.items
);
