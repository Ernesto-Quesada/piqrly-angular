import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LandingData } from '../../models/image';

export const selectLandingDataState =
  createFeatureSelector<LandingData>('landingData');

export const selectLandingPictures = createSelector(
  selectLandingDataState,
  (landingState: LandingData) => landingState.pictures
);

export const selectLandingPricesforImage = createSelector(
  selectLandingDataState,
  (state: LandingData) => state.pictures
);

export const selectPrices = createSelector(
  selectLandingDataState,
  (landingState: LandingData) => landingState.price
);
