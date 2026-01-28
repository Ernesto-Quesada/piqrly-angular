import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { combineLatest, filter, map, Observable, of, take } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { ShopCart } from './../models/shopCart';
// import {
//   selectChosenSize,
//   selectPrices,
//   selectSelectedPictures,
// } from '../store/selectors/cart.selector';
import { Image } from '../models/response';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
// import {
//   // checkoutCartStarted,
//   setCheckoutData,
// } from '../store/actions/checkout-cart.actions';
import {
  checkoutCartPayload,
  setChosenSize,
} from '../store/actions/shopcart.actions';
import {
  selectCartValid,
  selectSubtotalPrice,
} from '../store/selectors/shopcart.selector';

@Component({
  selector: 'add-to-cart',
  imports: [
    MatButtonToggleModule,
    MatCardModule,
    MatRadioModule,
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent {
  // selectedImages$: Observable<Image[]>;
  // selectedSize$: Observable<'small' | 'full' | null>;
  // prices$: Observable<{ small: number; full: number }>;
  disabledCheckout: boolean = false;
  disabledCheckoutColor: string = '#e1e1de';
  enabledCheckout: string = '#ffcd0e';
  canCheckout$: Observable<boolean>;

  // Default size selection; only one option can be active
  totalPrice$: Observable<number> = of(0);

  constructor(
    private router: Router,
    private store: Store<{ cart: ShopCart }>
  ) {
    // this.selectedImages$ = this.store.pipe(select(selectSelectedPictures));
    // this.selectedSize$ = this.store.pipe(select(selectChosenSize));
    // this.prices$ = this.store.pipe(select(selectPrices));
    // this.canCheckout$ = combineLatest([this.selectedImages$, this.selectedSize$]).pipe(
    //     map(([images, size]) => images.length > 0 && !!size) || false
    //   );
    this.canCheckout$ = this.store.pipe(select(selectCartValid));
  }
  ngOnInit(): void {
    this.totalPrice$ = this.store.pipe(select(selectSubtotalPrice));
  }

  startCheckout(): void {
    this.canCheckout$.pipe(take(1)).subscribe((canCheckout) => {
      if (canCheckout) {
        // this.store.dispatch(checkoutCartStarted());
        this.router.navigate(['/checkout']);
      } else {
        this.disabledCheckout = true;
        this.disabledCheckoutColor = '#e1e1de';
      }
    });
  }
  chooseSize(size: 'small' | 'full'): void {
    this.store.dispatch(setChosenSize({ size: size }));
  }
}
