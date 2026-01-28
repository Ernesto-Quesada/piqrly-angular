import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';

export const selectLandingDataState =
  createFeatureSelector<QrViewResponse>('landingData');

export const selectLandingPictures = createSelector(
  selectLandingDataState,
  (s) => s.pictures,
);

export const selectPrices = createSelector(
  selectLandingDataState,
  (s) => s.price,
);

export const selectOwner = createSelector(
  selectLandingDataState,
  (s) => s.owner,
);

export const selectForSale = createSelector(
  selectLandingDataState,
  (s) => s.forSale,
);

// ✅ NEW: event header selectors
export const selectEventName = createSelector(
  selectLandingDataState,
  (s) => s.eventName ?? null,
);

export const selectIsPublic = createSelector(selectLandingDataState, (s) =>
  typeof s.isPublic === 'boolean' ? s.isPublic : null,
);
