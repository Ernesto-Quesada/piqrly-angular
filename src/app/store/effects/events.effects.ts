import { EventService } from './../../services/event.service';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, map, catchError, of } from 'rxjs';
import {
  eventLandingDataLoad,
  loadEventPicturePriceFailure,
  loadEventPicturePriceSuccess,
} from '../actions/event.actions';

@Injectable()
export class EventDataEffects {
  globalData$;

  constructor(
    private actions$: Actions,
    private eventService: EventService,
  ) {
    this.globalData$ = createEffect(() =>
      this.actions$.pipe(
        ofType(eventLandingDataLoad),
        mergeMap(({ qr }) => {
          console.log('Effect triggered with QR:', qr); // Debugging
          return this.eventService.getEventPicturesByQrCode(qr).pipe(
            map((response) => {
              console.log('API Response:', response); // Debugging
              return loadEventPicturePriceSuccess({ response });
            }),
            catchError((error) => {
              console.error('API Error:', error); // Debugging
              return of(loadEventPicturePriceFailure({ error }));
            }),
          );
        }),
      ),
    );
  }
}
