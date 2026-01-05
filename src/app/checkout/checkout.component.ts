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
import { map, Observable, take } from 'rxjs';
import { CartItem, ShopCart } from '../models/shopCart';

import {
  selectSelectedPictures,
  selectShopCartState,
  selectSubtotalPrice,
} from '../store/selectors/shopcart.selector';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { loadStripe } from '@stripe/stripe-js';
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

  itemTotals = {
    fullSizeItems: 0,
    fullSizeSubT: 0,
    fullSizePriceEach: 0,

    smallItems: 0,
    smallSizeSubT: 0,
    smallSizePriceEach: 0,

    royaltyItems: 0,
    royaltySubT: 0,
    royaltyPriceEach: 0,

    itemTotal: 0,
    grandTotal: 0,
  };

  webCartItems: any[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store<{ cart: ShopCart }>,
    private checkoutService: CheckoutService,
    private route: ActivatedRoute
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.selectedImages$ = this.store.pipe(select(selectSelectedPictures));
    this.totalPrice$ = this.store.pipe(select(selectSubtotalPrice));
    this.checkoutState$ = this.store.pipe(select(selectShopCartState));
  }

  ngOnInit(): void {
    // 1) cartId mode (Flutter -> Web cart)
    this.route.queryParamMap.subscribe((params) => {
      this.cartId = params.get('cartId');
      console.log('🛒 Checkout cartId from URL:', this.cartId);

      if (this.cartId) {
        this.checkoutService.getWebCart(this.cartId).subscribe({
          next: (cart) => {
            console.log('🛒 WEB CART DEBUG from API:', cart);
            this.webCartItems = cart.items || [];

            // compute totals from webCartItems
            const fullItems = this.webCartItems.filter(
              (i: any) => i.size === 'full'
            );
            const smallItems = this.webCartItems.filter(
              (i: any) => i.size === 'small'
            );
            const royaltyItems = this.webCartItems.filter(
              (i: any) => i.size === 'royalty'
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

              royaltyItems: royaltyItems.length,
              royaltySubT: royaltyItems.reduce(
                (sum: number, i: any) => sum + i.price,
                0
              ),
              royaltyPriceEach: royaltyItems.length ? royaltyItems[0].price : 0,

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

    // keep store form in sync
    this.checkoutForm.valueChanges.subscribe((value) => {
      this.store.dispatch(updateCheckoutForm({ formValues: value }));
    });

    // 2) QR flow totals (ONLY when cartId is not present)
    this.checkoutState$
      .pipe(
        map((cartState) => {
          if (this.cartId) return; // cart mode totals handled above

          const fullItems = cartState.items.filter((i) => i.size === 'full');
          const smallItems = cartState.items.filter((i) => i.size === 'small');
          const royaltyItems = cartState.items.filter(
            (i) => i.size === 'royalty'
          );

          // ✅ IMPORTANT: use cartState.items here (NOT webCartItems)
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

            royaltyItems: royaltyItems.length,
            royaltySubT: royaltyItems.reduce(
              (sum: number, i: any) => sum + i.price,
              0
            ),
            royaltyPriceEach: royaltyItems.length ? royaltyItems[0].price : 0,

            itemTotal: cartState.items.length,
            grandTotal: cartState.items.reduce(
              (sum: number, i: any) => sum + i.price,
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
      if (this.checkoutForm.invalid) return;

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

      return;
    }

    // ✅ 2) QR FLOW
    this.checkoutState$.pipe(take(1)).subscribe((state) => {
      const payload = {
        totalAmount: state.subtotalPrice * 100,
        user: state.user,
        pictureIds: state.items.map((item) => item.image.pictureId),
      };

      this.checkoutService
        .createCheckoutSession(payload)
        .subscribe(async (data) => {
          const stripe = await this.stripePromise;
          stripe?.redirectToCheckout({ sessionId: data.sessionId });
        });
    });
  }
}
