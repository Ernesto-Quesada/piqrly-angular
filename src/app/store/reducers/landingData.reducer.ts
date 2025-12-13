import { createReducer, on } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';
import { initialDataState } from '../state/landing.state';
import {
  landingDataLoad,
  loadPicturePriceSuccess,
} from '../actions/landingData.actions';

export const landingDataReducer = createReducer<QrViewResponse>(
  initialDataState,

  on(landingDataLoad, (state, { qr }) => ({
    ...state,
    qr: qr,
  })),

  on(loadPicturePriceSuccess, (state, { response }) => ({
    ...state,
    pictures: response.pictures,
    price: response.price,
    forSale: response.forSale,
    user: response.owner || {}, // Ensure user is defined, fallback to empty object if not present
  }))
);
