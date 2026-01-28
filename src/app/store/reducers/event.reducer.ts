import { createReducer, on } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';
import {
  eventLandingDataLoad,
  loadEventPicturePriceSuccess,
} from '../actions/event.actions';
import { initialEventDataState } from '../state/event.state';

export const eventLandingDataReducer = createReducer<QrViewResponse>(
  initialEventDataState,

  on(eventLandingDataLoad, (state, { qr }) => ({
    ...state,
    qr: qr,
  })),

  on(loadEventPicturePriceSuccess, (state, { response }) => ({
    ...state,
    pictures: response.pictures,
    price: response.price,
    forSale: response.forSale,
    owner: response.owner ?? null, // Ensure user is defined, fallback to empty object if not present
  })),
);
