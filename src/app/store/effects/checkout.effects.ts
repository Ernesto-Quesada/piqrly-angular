import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { mergeMap, map, catchError, switchMap, tap } from 'rxjs/operators';
import { checkoutCartFailure, checkoutCartPayload, checkoutCartSuccess } from '../actions/checkout-cart.actions';
import { of } from 'rxjs';




@Injectable()
export class CheckoutEffect{
    checkout$;

    constructor(private actions$: Actions, private http: HttpClient) {
        
            this.checkout$ = createEffect(() =>
                this.actions$.pipe(
                  ofType(checkoutCartPayload),
                  switchMap(({ payload }) =>{  
                    // Replace with your actual checkout API endpoint.
                    // this.http.post('https://api.example.com/checkout', payload).pipe(
                        const response = { success: true, message: 'Checkout successful!' };
                        return of(response).pipe(
                      map(response => checkoutCartSuccess({ response })),
                      catchError(error => of(checkoutCartFailure({ error })))
                        )
                  }
                    // )
                  )
                )
              );


    }


}
