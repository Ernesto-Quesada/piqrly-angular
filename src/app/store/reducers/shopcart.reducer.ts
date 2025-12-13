import { createReducer, on } from '@ngrx/store';

import { initialShopCartState } from './../state/shopcart.state';
import { ShopCart } from './..//../models/shopCart';

import {
  addImageToCart,
  checkoutCartStarted,
  clearShopCart,
  //loadPicturePriceSuccess,
  //imageAddedinThumbnailStrip,
  removeImageFromCart,
  setChosenSize,
  shopCartTotalPrices,
  updateCheckoutForm,
} from './../actions/shopcart.actions';

export const shopCartReducer = createReducer<ShopCart>(
  initialShopCartState,

  on(addImageToCart, (state, { cartItem }) => {
    const exists = state.items.some(
      (item) => item.image.pictureId === cartItem.image.pictureId
    );
    if (exists) {
      return state;
    }
    const subtotalPrice = state.subtotalPrice + cartItem.price;
    console.log('subtotalPrice', subtotalPrice);
    return {
      ...state,
      items: [...state.items, cartItem],
      subtotalPrice: subtotalPrice,
    };
  }),
  // on(imageAddedinThumbnailStrip, (state, { image }) => {)
  on(removeImageFromCart, (state, { pictureId }) => {
    const newItems = state.items.filter(
      (item) => item.image.pictureId !== pictureId
    );
    const newSubtotal = newItems.reduce((acc, item) => acc + item.price, 0);
    return {
      ...state,
      items: newItems,
      subtotalPrice: newSubtotal,
    };
  }),
  on(updateCheckoutForm, (state, { formValues }) => {
    return {
      ...state,
      user: formValues,
    };
  }),
  on(clearShopCart, (state) => ({
    ...state,
    items: [],
    subtotalPrice: 0,
    totalPrice: 0,
  }))
);
