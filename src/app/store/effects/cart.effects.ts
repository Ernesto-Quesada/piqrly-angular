import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { mergeMap, map, catchError, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  addImageToCart,
  loadPicturePriceSuccess,
  loadGlobalPrices,
} from './../actions/cart.actions';

@Injectable()
export class CartEffects {
  loadGlobalPrice$;

  constructor(private actions$: Actions, private http: HttpClient) {
    this.loadGlobalPrice$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loadGlobalPrices),
        tap(() => console.log('loadGlobalPrices effect triggered')),
        mergeMap(() => {
          console.log('loadGlobalPrices effect triggered');
          const mockPrice = { small: 2, full: 15 }; // Mocked price from "API"

          return of(loadPicturePriceSuccess({ price: mockPrice }));
        })
      )
    );
  }
}
