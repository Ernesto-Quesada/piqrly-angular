import { createAction, props } from '@ngrx/store';
import { LandingData } from '../../models/image';

export const landingDataLoad = createAction(
  '[Landing] Load data on first landing',
  props<{ qr: string }>()
);

export const loadPicturePriceSuccess = createAction(
  '[Landing] Load Picture Price User Success',
  props<{ response: LandingData }>()
);
export const loadPicturePriceFailure = createAction(
  '[Landing] Load Picture Price User Failure',
  props<{ error: any }>()
);
