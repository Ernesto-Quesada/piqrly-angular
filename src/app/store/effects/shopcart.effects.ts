import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, map, catchError, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  addImageToCart,
  checkoutCartPayload,
  checkoutCartSuccess,
  checkoutCartFailure,
} from './../actions/shopcart.actions';
import { PictureService } from '../../services/picture.service';

@Injectable()
export class ShopCartEffects {
  constructor(
    private actions$: Actions,
    private pictureService: PictureService
  ) {}

  // checkout$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(checkoutCartPayload),
  //     switchMap(
  //       ({ payload }) => {
  //         // Replace with your actual checkout API endpoint.
  //         // this.http.post('https://api.example.com/checkout', payload).pipe(
  //         const response = { success: true, message: 'Checkout successful!' };
  //         return of(response).pipe(
  //           map((response) => checkoutCartSuccess({ response })),
  //           catchError((error) => of(checkoutCartFailure({ error })))
  //         );
  //       }
  //       // )
  //     )
  //   )
  // );
}
