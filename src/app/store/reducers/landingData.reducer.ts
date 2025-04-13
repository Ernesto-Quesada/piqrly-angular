import { createReducer, on } from '@ngrx/store';
import { LandingData } from '../../models/image';
import { initialDataState } from '../state/landing.state';
import {
  landingDataLoad,
  loadPicturePriceSuccess,
} from '../actions/landingData.actions';

export const landingDataReducer = createReducer<LandingData>(
  initialDataState,

  on(landingDataLoad, (state, { qr }) => ({
    ...state,
    qr: qr,
  })),

  on(loadPicturePriceSuccess, (state, { response }) => ({
    ...state,
    pictures: response.pictures,
    price: response.price,
    qr: response.qr,
    user: response.user,
  }))
);
