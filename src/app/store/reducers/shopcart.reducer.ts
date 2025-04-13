import { createReducer, on } from '@ngrx/store';

import { initialShopCartState } from './../state/shopcart.state';
import { ShopCart } from './..//../models/shopCart';

import {
  addImageToCart,
  checkoutCartStarted,
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
  })
  // on(loadPicturePriceSuccess, (state, { response }) => ({
  //   ...state,
  //   prices: response.price,
  // }))
  //  on(checkoutCartSuccess, (state) => ({
  //     ...state,
  //     // Clear cart after successful checkout.
  //     selectedPictures: [],
  //     prices: { small: 0, full: 0 },
  //     chosenSize: null
  //   })),
  //   on(checkoutCartFailure, (state) => ({
  //     ...state
  //     // You could set an error flag if needed.
  //   }))
);
