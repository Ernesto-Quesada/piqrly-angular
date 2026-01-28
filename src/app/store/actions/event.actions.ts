import { createAction, props } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';

export const eventLandingDataLoad = createAction(
  '[Event-Landing] Load event data on first landing',
  props<{ qr: string }>(),
);

export const loadEventPicturePriceSuccess = createAction(
  '[Event-Landing] Load Picture Price User Success',
  props<{ response: QrViewResponse }>(),
);
export const loadEventPicturePriceFailure = createAction(
  '[Event-Landing] Load Picture Price User Failure',
  props<{ error: any }>(),
);
