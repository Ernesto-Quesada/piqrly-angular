import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';

export const selectLandingDataState =
  createFeatureSelector<QrViewResponse>('landingData');

export const selectLandingPictures = createSelector(
  selectLandingDataState,
  (landingState: QrViewResponse) => landingState.pictures
);

// export const selectLandingPricesforImage = createSelector(
//   selectLandingDataState,
//   (landingState: QrViewResponse) => landingState.price
// );

export const selectPrices = createSelector(
  selectLandingDataState,
  (landingState: QrViewResponse) => landingState.price
);
