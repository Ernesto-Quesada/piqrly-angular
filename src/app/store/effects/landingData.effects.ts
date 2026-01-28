import { Injectable } from '@angular/core';
import { PictureService } from '../../services/picture.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, map, catchError, of } from 'rxjs';
import {
  landingDataLoad,
  loadPicturePriceFailure,
  loadPicturePriceSuccess,
} from '../actions/landingData.actions';
import { EventService } from '../../services/event.service';

@Injectable()
export class LandingDataEffects {
  globalData$;

  constructor(
    private actions$: Actions,
    private pictureService: PictureService,
    private eventService: EventService,
  ) {
    this.globalData$ = createEffect(() =>
      this.actions$.pipe(
        ofType(landingDataLoad),
        mergeMap(({ qr, inviteCode }) => {
          // ✅ Decide which API call to use
          const hasInvite = !!inviteCode && inviteCode.trim().length > 0;
          const hasQr = !!qr && qr.trim().length > 0;

          if (hasInvite) {
            console.log('Effect triggered with INVITE:', inviteCode);
            return this.eventService
              .getEventPicturesByQrCode(inviteCode!.trim())
              .pipe(
                map((response) => {
                  console.log('API Response:', response);
                  return loadPicturePriceSuccess({ response });
                }),
                catchError((error) => {
                  console.error('API Error:', error);
                  return of(loadPicturePriceFailure({ error }));
                }),
              );
          }

          if (hasQr) {
            console.log('Effect triggered with QR:', qr);
            return this.pictureService.getPicturesByQrCode(qr!.trim()).pipe(
              map((response) => {
                console.log('API Response:', response);
                return loadPicturePriceSuccess({ response });
              }),
              catchError((error) => {
                console.error('API Error:', error);
                return of(loadPicturePriceFailure({ error }));
              }),
            );
          }

          // ✅ nothing provided
          return of(
            loadPicturePriceFailure({
              error: 'landingDataLoad requires qr or inviteCode',
            }),
          );
        }),
      ),
    );
  }
}
