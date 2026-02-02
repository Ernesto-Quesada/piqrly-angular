// checkout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { map, Observable, take, Subject, takeUntil } from 'rxjs';
import { CartItem, ShopCart } from '../models/shopCart';

import {
  selectSelectedPictures,
  selectShopCartState,
  selectSubtotalPrice,
} from '../store/selectors/shopcart.selector';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  checkoutState$: Observable<ShopCart>;
  private destroy$ = new Subject<void>();
  private returnTo: string | null = null;

  // Keeping this to minimize changes; no longer required once you redirect by URL.
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

  // ✅ blocks double click + multiple in-flight requests
  isPaying = false;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ cart: ShopCart }>,
    private checkoutService: CheckoutService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.checkoutForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.selectedImages$ = this.store.pipe(select(selectSelectedPictures));
    this.totalPrice$ = this.store.pipe(select(selectSubtotalPrice));
    this.checkoutState$ = this.store.pipe(select(selectShopCartState));
    this.returnTo = this.route.snapshot.queryParamMap.get('returnTo');
  }

  // ✅ Angular navigation only
  private goBackToLanding(): void {
    const returnUrl = sessionStorage.getItem('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }

  // ✅ NEW: shared helper (keeps changes small)
  private redirectToStripeCheckoutUrl(data: any): void {
    const url = data?.url;
    if (typeof url === 'string' && url.trim().length > 0) {
      sessionStorage.setItem('stripeRedirected', '1');
      // Use replace so back button doesn't land back on /checkout
      window.location.replace(url);
      return;
    }

    console.error('❌ Missing Checkout URL in response:', data);
    this.isPaying = false;
  }

  ngOnInit(): void {
    const cameFromStripe =
      sessionStorage.getItem('stripeRedirected') === '1' ||
      document.referrer.includes('checkout.stripe.com');

    // ✅ If user navigates back into /checkout from Stripe, never show checkout again
    if (cameFromStripe) {
      sessionStorage.removeItem('stripeRedirected');
      this.goBackToLanding();
      return;
    }

    // 1) cartId mode (Flutter -> Web cart)
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.cartId = params.get('cartId');
        console.log('🛒 Checkout cartId from URL:', this.cartId);

        if (!this.cartId) return;

        this.checkoutService
          .getWebCart(this.cartId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (cart) => {
              console.log('🛒 WEB CART DEBUG from API:', cart);
              this.webCartItems = cart.items || [];

              // ✅ If cart is empty, do NOT allow checkout page to exist
              if (!this.webCartItems || this.webCartItems.length === 0) {
                this.goBackToLanding();
                return;
              }

              const fullItems = this.webCartItems.filter(
                (i: any) => i.size === 'full',
              );
              const smallItems = this.webCartItems.filter(
                (i: any) => i.size === 'small',
              );
              const royaltyItems = this.webCartItems.filter(
                (i: any) => i.size === 'royalty',
              );

              this.itemTotals = {
                fullSizeItems: fullItems.length,
                fullSizeSubT: fullItems.reduce(
                  (sum: number, i: any) => sum + i.price,
                  0,
                ),
                fullSizePriceEach: fullItems.length ? fullItems[0].price : 0,

                smallItems: smallItems.length,
                smallSizeSubT: smallItems.reduce(
                  (sum: number, i: any) => sum + i.price,
                  0,
                ),
                smallSizePriceEach: smallItems.length ? smallItems[0].price : 0,

                royaltyItems: royaltyItems.length,
                royaltySubT: royaltyItems.reduce(
                  (sum: number, i: any) => sum + i.price,
                  0,
                ),
                royaltyPriceEach: royaltyItems.length
                  ? royaltyItems[0].price
                  : 0,

                itemTotal: this.webCartItems.length,
                grandTotal: this.webCartItems.reduce(
                  (sum: number, i: any) => sum + i.price,
                  0,
                ),
              };
            },
            error: (err) => {
              console.error('❌ WEB CART ERROR:', err);
              this.goBackToLanding();
            },
          });
      });

    // keep store form in sync (✅ leak fixed)
    this.checkoutForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.store.dispatch(updateCheckoutForm({ formValues: value }));
      });

    // 2) QR flow totals (ONLY when cartId is not present)
    this.checkoutState$
      .pipe(
        takeUntil(this.destroy$),
        map((cartState) => {
          if (this.cartId) return;

          // ✅ If QR cart is empty, do NOT allow checkout page to exist
          if (!cartState?.items || cartState.items.length === 0) {
            this.goBackToLanding();
            return;
          }

          const fullItems = cartState.items.filter((i) => i.size === 'full');
          const smallItems = cartState.items.filter((i) => i.size === 'small');
          const royaltyItems = cartState.items.filter(
            (i) => i.size === 'royalty',
          );

          this.itemTotals = {
            fullSizeItems: fullItems.length,
            fullSizeSubT: fullItems.reduce(
              (sum: number, i: any) => sum + i.price,
              0,
            ),
            fullSizePriceEach: fullItems.length ? fullItems[0].price : 0,

            smallItems: smallItems.length,
            smallSizeSubT: smallItems.reduce(
              (sum: number, i: any) => sum + i.price,
              0,
            ),
            smallSizePriceEach: smallItems.length ? smallItems[0].price : 0,

            royaltyItems: royaltyItems.length,
            royaltySubT: royaltyItems.reduce(
              (sum: number, i: any) => sum + i.price,
              0,
            ),
            royaltyPriceEach: royaltyItems.length ? royaltyItems[0].price : 0,

            itemTotal: cartState.items.length,
            grandTotal: cartState.items.reduce(
              (sum: number, i: any) => sum + i.price,
              0,
            ),
          };
        }),
      )
      .subscribe();
  }

  async pay(event: Event) {
    event.preventDefault();

    if (this.isPaying) return;
    this.isPaying = true;

    // ✅ Angular-safe: use router.url, not window.location
    sessionStorage.setItem(
      'returnUrl',
      sessionStorage.getItem('returnUrl') || this.router.url,
    );

    // ✅ 1) APP CART FLOW (Flutter → web): ?cartId=...
    if (this.cartId) {
      if (this.checkoutForm.invalid) {
        this.isPaying = false;
        return;
      }

      if (!this.webCartItems || this.webCartItems.length === 0) {
        this.isPaying = false;
        this.goBackToLanding();
        return;
      }

      const payload = {
        cartId: this.cartId,
        fullName: this.checkoutForm.value.fullName,
        email: this.checkoutForm.value.email,
      };

      this.checkoutService.createWebCartCheckoutSession(payload).subscribe({
        next: async (data) => {
          // ✅ NEW: redirect by URL (Stripe removed redirectToCheckout in newer typings)
          this.redirectToStripeCheckoutUrl(data);
        },
        error: (err) => {
          console.error('❌ createWebCartCheckoutSession failed:', err);
          this.isPaying = false;
        },
      });

      return;
    }

    // ✅ 2) QR FLOW
    this.checkoutState$.pipe(take(1)).subscribe({
      next: (state) => {
        if (!state?.items || state.items.length === 0) {
          this.isPaying = false;
          this.goBackToLanding();
          return;
        }

        const payload = {
          totalAmount: state.subtotalPrice * 100,
          user: state.user,
          pictureIds: state.items.map((item) => item.image.pictureId),
        };

        this.checkoutService.createCheckoutSession(payload).subscribe({
          next: async (data) => {
            // ✅ NEW: redirect by URL (Stripe removed redirectToCheckout in newer typings)
            this.redirectToStripeCheckoutUrl(data);
          },
          error: (err) => {
            console.error('❌ createCheckoutSession failed:', err);
            this.isPaying = false;
          },
        });
      },
      error: (err) => {
        console.error('❌ checkoutState$ failed:', err);
        this.isPaying = false;
      },
    });
  }

  goBackToViewPics() {
    // 1) If checkout was opened with a returnTo route (best)
    if (this.returnTo && this.returnTo.trim().length > 0) {
      this.router.navigateByUrl(this.returnTo);
      return;
    }

    // 2) fallback: last viewpics QR
    const lastQr = localStorage.getItem('last_viewpics_qr');
    if (lastQr && lastQr.trim().length > 0) {
      this.router.navigate(['/viewpics', lastQr.trim()]);
      return;
    }

    // 3) fallback: browser back
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    // 4) final fallback
    this.router.navigate(['/']);
  }
  // Prefer preview/thumb url; fallback safely
  getCheckoutThumb(item: any): string {
    // cart flow item might have:
    // item.previewImageUrl OR item.imageUrl
    if (item?.previewImageUrl) return item.previewImageUrl;
    if (item?.imageUrl) return item.imageUrl;

    // qrFlow item shape:
    // image.image.previewImageUrl or image.image.imageUrl
    if (item?.image?.previewImageUrl) return item.image.previewImageUrl;
    if (item?.image?.imageUrl) return item.image.imageUrl;

    // sometimes you used "previewImageUrls[0]" in other places
    if (Array.isArray(item?.previewImageUrls) && item.previewImageUrls[0])
      return item.previewImageUrls[0];

    return '';
  }

  onThumbError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    // optional fallback asset (create one)
    img.src = '/assets/img/placeholder-thumb.png';
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
