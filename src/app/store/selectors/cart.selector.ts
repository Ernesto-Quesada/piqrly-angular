// import { createFeatureSelector, createSelector } from '@ngrx/store';
// import { Cart } from './../../models/shopCart'; // Ensure this path is correct based on your project structure

// export const selectCartState = createFeatureSelector<Cart>('cart');

// export const selectChosenSize = createSelector(
//   selectCartState,
//   (state: Cart) => state.chosenSize
// );

// export const selectSelectedPictures = createSelector(
//   selectCartState,
//   (state: Cart) => state.selectedPictures
// );

// export const selectPicturePrices = createSelector(
//   selectCartState,
//   (state: Cart) => state.prices
// );
// // export const selectPrices = createSelector(
// //   selectCartState,
// //   (cart: Cart) => cart.prices
// // );
// export const cartTotalPrices = createSelector(
//   selectCartState,
//   (cart: Cart) => cart.prices
// );
// // Compute total price; here we assume that the price for each picture has been fetched
// // export const selectTotalPrice = createSelector(
// //   selectCartState,
// //   (state: Cart) => {
// //     const chosenSize = state.chosenSize;
// //     if (!chosenSize) return 0;
// //     const pricePerPicture = (id: string) => state.prices[id]?.[chosenSize] || 0;
// //     return state.selectedPictures.reduce(
// //       (total, picture) => total + pricePerPicture(picture.pictureId),
// //       0);
// //   }
// // );
