import { createReducer, on } from '@ngrx/store';
import {setChosenSize, addImageToCart, removePictureFromCart,
  loadPicturePriceSuccess, checkoutCartFailure } from './../actions/cart.actions';
import { initialCartState } from './../state/cart.state';
import { Cart } from './..//../models/shopCart';
import { checkoutCartSuccess } from './../actions/checkout-cart.actions'; 


export const cartReducer = createReducer<Cart>(
  initialCartState,
  
  on(setChosenSize, (state, { size }) => ({
    ...state,
    chosenSize: size,
    // Optionally, clear selectedPictures when size is changed:
    // selectedPictures: [],
    // prices: {}
  })),
  // Add picture only if it's not already added.
  // on(addImageToCart, (state, { image }) => {
  //   const exists = state.selectedPictures.some(p => p.pictureId === image.pictureId);
  //   if (exists) {
  //     return state;
  //   }
  //   return {
  //     ...state,
  //     selectedPictures: [...state.selectedPictures, image]
  //   };
  // }),

  // Remove a picture.
  on(removePictureFromCart, (state, { pictureId }) => ({
    ...state,
    selectedPictures: state.selectedPictures.filter(p => p.pictureId !== pictureId)
  })),

  // Update the price for a picture.
  on(loadPicturePriceSuccess, (state, { price} ) => ({
    ...state,
    prices: price,
  })),

  // Optionally, on checkout success or failure, you might clear the cart or log errors.
  on(checkoutCartSuccess, (state) => ({
    ...state,
    // Clear cart after successful checkout.
    selectedPictures: [],
    prices: { small: 0, full: 0 }, 
    chosenSize: null
  })),
  on(checkoutCartFailure, (state) => ({
    ...state
    // You could set an error flag if needed.
  }))
);
