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
// import { checkoutCartPayload } from '../store/actions/checkout-cart.actions';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { loadStripe } from '@stripe/stripe-js';
import { StripeService } from 'ngx-stripe';
import { updateCheckoutForm } from '../store/actions/shopcart.actions';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../environments/environment';

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
    MatIconModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  checkoutState$: Observable<ShopCart>;
  stripePromise = loadStripe(environment.stripePublishableKey);

  selectedImages$: Observable<CartItem[]>;
  totalPrice$: Observable<number>;
  cartId: string | null = null;
  // images: Image[] = [];
  // someImages: any[] = [];
  itemTotals = {
    fullSizeItems: 0,
    fullSizeSubT: 0,
    fullSizePriceEach: 0,

    smallItems: 0,
    smallSizeSubT: 0,
    smallSizePriceEach: 0,

    itemTotal: 0,
    grandTotal: 0,
  };
  webCartItems: any[] = []; // 👈 add this

  constructor(
    private fb: FormBuilder,
    private store: Store<{ cart: ShopCart }>,
    private checkoutService: CheckoutService,
    private route: ActivatedRoute
  ) {
    // Set up form controls for user details.
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // address: ['', Validators.required],
      // Additional fields as needed.
    });

    // Select data from the store.
    this.selectedImages$ = this.store.pipe(select(selectSelectedPictures));
    this.totalPrice$ = this.store.pipe(select(selectSubtotalPrice));
    this.checkoutState$ = this.store.pipe(select(selectShopCartState));
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.cartId = params.get('cartId');
      console.log('🛒 Checkout cartId from URL:', this.cartId);

      if (this.cartId) {
        this.checkoutService.getWebCart(this.cartId).subscribe({
          next: (cart) => {
            console.log('🛒 WEB CART DEBUG from API:', cart);
            this.webCartItems = cart.items || [];

            // 🔹 compute totals from webCartItems
            const fullItems = this.webCartItems.filter(
              (i: any) => i.size === 'full'
            );
            const smallItems = this.webCartItems.filter(
              (i: any) => i.size === 'small'
            );

            this.itemTotals = {
              fullSizeItems: fullItems.length,
              fullSizeSubT: fullItems.reduce(
                (sum: number, i: any) => sum + i.price,
                0
              ),
              fullSizePriceEach: fullItems.length ? fullItems[0].price : 0,

              smallItems: smallItems.length,
              smallSizeSubT: smallItems.reduce(
                (sum: number, i: any) => sum + i.price,
                0
              ),
              smallSizePriceEach: smallItems.length ? smallItems[0].price : 0,

              itemTotal: this.webCartItems.length,
              grandTotal: this.webCartItems.reduce(
                (sum: number, i: any) => sum + i.price,
                0
              ),
            };
          },
          error: (err) => {
            console.error('❌ WEB CART ERROR:', err);
          },
        });
      }
    });

    // Optionally, you could dispatch an action to re-fetch cart state if needed
    this.checkoutForm.valueChanges.subscribe((value) => {
      this.store.dispatch(updateCheckoutForm({ formValues: value }));
    });
    this.checkoutState$
      .pipe(
        map((cartState) => {
          if (this.cartId) {
            return;
          }
          const fullItems = cartState.items.filter(
            (item) => item.size === 'full'
          );
          const smallItems = cartState.items.filter(
            (item) => item.size === 'small'
          );

          this.itemTotals = {
            fullSizeItems: fullItems.length ? fullItems.length : 0,
            fullSizeSubT: fullItems.reduce((sum, item) => sum + item.price, 0),
            fullSizePriceEach: fullItems.length > 0 ? fullItems[0].price : 0,

            smallItems: smallItems.length ? smallItems.length : 0,
            smallSizeSubT: smallItems.reduce(
              (sum, item) => sum + item.price,
              0
            ),
            smallSizePriceEach: smallItems.length > 0 ? smallItems[0].price : 0,
            itemTotal: cartState.items.length,

            grandTotal: cartState.items.reduce(
              (sum, item) => sum + item.price,
              0
            ),
          };
        })
      )
      .subscribe();
  }

  pay(event: Event) {
    event.preventDefault();

    // ✅ 1) APP CART FLOW (Flutter → web): we have ?cartId=...
    if (this.cartId) {
      if (this.checkoutForm.invalid) {
        return;
      }

      const payload = {
        cartId: this.cartId,
        fullName: this.checkoutForm.value.fullName,
        email: this.checkoutForm.value.email,
      };

      this.checkoutService
        .createWebCartCheckoutSession(payload)
        .subscribe(async (data) => {
          const sessionId = data.sessionId;
          console.log('🧾 Web-cart Session ID:', sessionId);

          const stripe = await this.stripePromise;
          stripe?.redirectToCheckout({ sessionId });
        });

      return; // ⛔ do not run the old QR flow
    }

    // ✅ 2) EXISTING QR FLOW (no cartId): keep your old logic
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
        console.log('Session ID in checkout:', sessionId);
        const stripe = await this.stripePromise;
        stripe?.redirectToCheckout({
          sessionId: data.sessionId,
        });
      });
  }
}
