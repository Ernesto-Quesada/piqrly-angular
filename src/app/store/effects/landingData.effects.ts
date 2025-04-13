import { Injectable } from '@angular/core';
import { PictureService } from '../../services/picture.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, map, catchError, of } from 'rxjs';
import {
  landingDataLoad,
  loadPicturePriceFailure,
  loadPicturePriceSuccess,
} from '../actions/landingData.actions';

@Injectable()
export class LandingDataEffects {
  globalData$;

  constructor(
    private actions$: Actions,
    private pictureService: PictureService
  ) {
    this.globalData$ = createEffect(() =>
      this.actions$.pipe(
        ofType(landingDataLoad),
        mergeMap(({ qr }) => {
          console.log('Effect triggered with QR:', qr); // Debugging
          return this.pictureService.getPicturesByQrCode(qr).pipe(
            map((response) => {
              console.log('API Response:', response); // Debugging
              return loadPicturePriceSuccess({ response });
            }),
            catchError((error) => {
              console.error('API Error:', error); // Debugging
              return of(loadPicturePriceFailure({ error }));
            })
          );
        })
      )
    );
  }
}
