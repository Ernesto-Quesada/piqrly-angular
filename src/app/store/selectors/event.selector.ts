import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';

export const selectEventLandingDataState =
  createFeatureSelector<QrViewResponse>('eventLandingData');

export const selectEventLandingPictures = createSelector(
  selectEventLandingDataState,
  (eventLandingState: QrViewResponse) => eventLandingState.pictures,
);

export const selectEventPrices = createSelector(
  selectEventLandingDataState,
  (eventLandingState: QrViewResponse) => eventLandingState.price,
);

// ✅ NEW: owner selector
export const selectEventOwner = createSelector(
  selectEventLandingDataState,
  (eventLandingState: QrViewResponse) => eventLandingState.owner,
);

// ✅ NEW: forSale selector
export const selectEventForSale = createSelector(
  selectEventLandingDataState,
  (eventLandingState: QrViewResponse) => eventLandingState.forSale,
);
