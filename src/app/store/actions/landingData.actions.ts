import { createAction, props } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';

export const landingDataLoad = createAction(
  '[Landing] Load data on first landing',
  props<{ qr?: string; inviteCode?: string }>(),
);

export const loadPicturePriceSuccess = createAction(
  '[Landing] Load Picture Price User Success',
  props<{ response: QrViewResponse }>(),
);
export const loadPicturePriceFailure = createAction(
  '[Landing] Load Picture Price User Failure',
  props<{ error: any }>(),
);
