import { createReducer, on } from '@ngrx/store';
import { QrViewResponse } from '../../models/qr-read-response';
import { initialDataState } from '../state/landing.state';
import {
  landingDataLoad,
  loadPicturePriceSuccess,
  loadPicturePriceFailure,
} from '../actions/landingData.actions';

export const landingDataReducer = createReducer<QrViewResponse>(
  initialDataState,

  on(landingDataLoad, (state, { qr, inviteCode }) => ({
    ...state,

    // ✅ clear old event header when switching flows
    eventName: inviteCode ? state.eventName : null,
    isPublic: inviteCode ? state.isPublic : null,
  })),

  on(loadPicturePriceSuccess, (state, { response }) => ({
    ...state,
    pictures: response.pictures ?? [],
    price: response.price ?? null,
    forSale: !!response.forSale,
    owner: response.owner ?? null,

    // ✅ STORE EVENT HEADER FIELDS (this is what you’re missing)
    eventName: response.eventName ?? null,
    isPublic: typeof response.isPublic === 'boolean' ? response.isPublic : null,

    // optional passthroughs
    qrCode: response.qrCode ?? null,
    isOwner: typeof response.isOwner === 'boolean' ? response.isOwner : null,
    isInvited:
      typeof response.isInvited === 'boolean' ? response.isInvited : null,
  })),

  on(loadPicturePriceFailure, (state) => ({
    ...state,
    // optional: clear pictures on error
    // pictures: [],
  })),
);
