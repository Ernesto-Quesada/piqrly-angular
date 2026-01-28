import { createReducer, on } from '@ngrx/store';
import { initialShopCartState } from './../state/shopcart.state';
import { ShopCart } from './../../models/shopCart';

import {
  addImageToCart,
  clearShopCart,
  removeImageFromCart,
  setCartContext,
  updateCheckoutForm,
} from './../actions/shopcart.actions';

export const shopCartReducer = createReducer<ShopCart>(
  initialShopCartState,

  // shopcart.reducer.ts
  on(addImageToCart, (state, { cartItem }) => {
    const idx = state.items.findIndex(
      (i) => i.image.pictureId === cartItem.image.pictureId,
    );

    // ✅ If picture not in cart → normal add
    if (idx === -1) {
      const subtotalPrice = state.subtotalPrice + cartItem.price;
      return {
        ...state,
        items: [...state.items, cartItem],
        subtotalPrice,
      };
    }

    // ✅ If picture already in cart → REPLACE (size+price) for that pictureId
    const existing = state.items[idx];

    const newItems = [...state.items];
    newItems[idx] = cartItem;

    // remove old price, add new price
    const subtotalPrice = state.subtotalPrice - existing.price + cartItem.price;

    return {
      ...state,
      items: newItems,
      subtotalPrice,
    };
  }),

  on(setCartContext, (state, { contextKey }) => ({
    ...state,
    contextKey,
  })),

  on(removeImageFromCart, (state, { pictureId }) => {
    // ⚠️ this action removes ALL sizes for the pictureId (kept as-is)
    const newItems = state.items.filter(
      (item) => item.image.pictureId !== pictureId,
    );
    const newSubtotal = newItems.reduce(
      (acc, item) => acc + (item.price || 0),
      0,
    );

    return {
      ...state,
      items: newItems,
      subtotalPrice: newSubtotal,
    };
  }),

  on(updateCheckoutForm, (state, { formValues }) => ({
    ...state,
    user: formValues,
  })),

  on(clearShopCart, (state) => ({
    ...state,
    items: [],
    subtotalPrice: 0,
    totalPrice: 0,
  })),
);
