// checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store, select } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import {
  Cart,
  CartItem,
  CheckoutCartPayload,
  ShopCart,
} from '../models/shopCart';
import { Image } from '../models/image';

import {
  selectSelectedPictures,
  selectShopCartState,
  selectSubtotalPrice,
} from '../store/selectors/shopcart.selector';
import { checkoutCartPayload } from '../store/actions/checkout-cart.actions';
import { RouterModule } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { loadStripe } from '@stripe/stripe-js';
import { StripeService } from 'ngx-stripe';
import { updateCheckoutForm } from '../store/actions/shopcart.actions';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  checkoutState$: Observable<ShopCart>;
  stripePromise = loadStripe(
    'pk_test_51RCXTD4Je26dbkiYQmhsN66oK2Z4LQF2owx1Ybscen0YJnnRV0YuIzCr2HySJHJHE4bGm6BcBXqPuuFIVsnBYLtu00ffGSM70m'
  );

  selectedImages$: Observable<CartItem[]>;
  totalPrice$: Observable<number>;
  // images: Image[] = [];
  // someImages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store<{ cart: ShopCart }>,
    private checkoutService: CheckoutService
  ) {
    // Set up form controls for user details.
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      // Additional fields as needed.
    });

    // Select data from the store.
    this.selectedImages$ = this.store.pipe(select(selectSelectedPictures));
    this.totalPrice$ = this.store.pipe(select(selectSubtotalPrice));
    this.checkoutState$ = this.store.pipe(select(selectShopCartState));
  }

  ngOnInit(): void {
    // Optionally, you could dispatch an action to re-fetch cart state if needed
    this.checkoutForm.valueChanges.subscribe((value) => {
      this.store.dispatch(updateCheckoutForm({ formValues: value }));
    });
  }

  async pay() {
    let payload: any = {};

    this.checkoutState$.subscribe((state) => {
      payload = {
        totalAmount: state.subtotalPrice * 100,
        user: state.user,
        pictureIds: state.items.map((item) => item.image.pictureId),
      };
    });

    this.checkoutService
      .createCheckoutSession(payload)
      .subscribe(async (data) => {
        const sessionId = data.sessionId;
        console.log('Session ID:', sessionId);
        const stripe = await this.stripePromise;
        stripe?.redirectToCheckout({
          sessionId: data.sessionId,
        });
      });
  }
}
