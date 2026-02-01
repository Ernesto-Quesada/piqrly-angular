import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { select, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  of,
  take,
} from 'rxjs';

import { Image, ImageOwner, Price } from '../models/response';
import { ShopCart } from '../models/shopCart';

import { ImageModalComponent } from '../image-modal/image-modal.component';

import {
  addImageToCart,
  clearShopCart,
  removeImageFromCart,
} from '../store/actions/shopcart.actions';
import { selectItems } from '../store/selectors/shopcart.selector';
import { QrViewResponse } from '../models/qr-read-response';
import { eventLandingDataLoad } from '../store/actions/event.actions';
import {
  selectEventForSale,
  selectEventLandingPictures,
  selectEventOwner,
  selectEventPrices,
} from '../store/selectors/event.selector';

type Size = 'small' | 'full' | 'royalty';

@Component({
  selector: 'app-event-invite',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './event-invite.component.html',
  styleUrl: './event-invite.component.scss',
})
export class EventInviteComponent implements OnInit {
  code!: string;
  images$: Observable<Image[]> = of([]);

  // page header
  eventName = 'Event';
  ownerLabel = ''; // show author name/email

  // gallery state
  images: Image[] = [];

  // sale state
  forSale = false;
  prices: Price | null = null;

  // select/cart UI (same as viewpics UX)
  private selectModeSubject = new BehaviorSubject<boolean>(false);
  selectMode$ = this.selectModeSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  selectMode = false;
  selectedCount = 0;
  selectedSize: Size = 'small';
  isDesktop = false;

  private cartMap = new Map<string, { size: Size | null; price: number }>();
  owner$: Observable<ImageOwner | null> = of(null);
  forSale$: Observable<boolean> = of(false);
  prices$: Observable<{
    priceSmall: number;
    priceFull: number;
    priceRoyalty: number;
  } | null> = of(null);
  cartItems$!: Observable<
    {
      image: Image;
      size: Size | null;
      price: number;
    }[]
  >;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private storeShopCart: Store<{ shopCart: ShopCart }>,
    //private eventService: EventService,
    private storeLanding: Store<{ eventLandingData: QrViewResponse }>,
  ) {
    this.cartItems$ = this.storeShopCart.pipe(select(selectItems));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.code = params.get('code')!;
      console.log('🔔 EventInviteComponent code=', this.code);
      this.storeLanding.dispatch(eventLandingDataLoad({ qr: this.code }));
      // this.loadInvite();
    });
    this.images$ = this.storeLanding.select(selectEventLandingPictures);
    this.owner$ = this.storeLanding.select(selectEventOwner);
    this.forSale$ = this.storeLanding.select(selectEventForSale);
    this.prices$ = this.storeLanding.select(selectEventPrices);
    this.isDesktop = window.innerWidth > 768;

    // keep count + map updated
    this.cartItems$.subscribe((items) => {
      this.cartMap.clear();
      for (const it of items) {
        this.cartMap.set(it.image.pictureId, {
          size: it.size,
          price: it.price,
        });
      }
      this.selectedCount = items.length;
    });

    this.selectModeSubject.next(this.selectMode);
  }

  // ===============================
  // ✅ Load shared event from backend
  // ===============================
  async loadInvite(): Promise<void> {
    try {
      // NOTE: using fetch keeps this file standalone (no new service required)
      // Replace with your existing HttpClient service later if you want.
      const res = await fetch(
        `${this.getApiBase()}/api/events/invite/${this.code}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        },
      );

      if (!res.ok) {
        throw new Error(`Invite load failed status=${res.status}`);
      }

      const body = await res.json();

      // name + author
      this.eventName = body?.name ?? 'Event';
      const ownerEmail = body?.ownerEmail ?? '';
      this.ownerLabel = ownerEmail ? ownerEmail : 'Creator';

      // sale flags
      this.forSale = !!body?.paid;
      if (body?.eventPrice) {
        this.prices = {
          priceSmall: Number(body.eventPrice.priceSmall ?? 0),
          priceFull: Number(body.eventPrice.priceFull ?? 0),
          priceRoyalty: Number(body.eventPrice.priceRoyalty ?? 0),
        };
      } else {
        this.prices = null;
      }

      // pictures + ids → build Image[]
      const urls: string[] = Array.isArray(body?.pictures) ? body.pictures : [];
      const ids: string[] = Array.isArray(body?.pictureIds)
        ? body.pictureIds
        : [];

      const built: Image[] = [];
      for (let i = 0; i < urls.length; i++) {
        built.push({
          pictureId: ids[i] ?? urls[i], // fallback
          previewImageUrl: urls[i],
          imageUrl: urls[i], // ok for now, modal uses previewImageUrl
        } as any);
      }
      this.images = built;
    } catch (e) {
      console.error('🛑 invite load error', e);
      this.eventName = 'Event';
      this.ownerLabel = '';
      this.images = [];
      this.forSale = false;
      this.prices = null;
    }
  }

  // ✅ read API base from window (dev) without touching your env setup
  // If you already have an API proxy, you can change this to just ''.
  private getApiBase(): string {
    // simplest: call same host as Angular dev server expects via proxy if configured
    // If you DON'T have proxy, set to http://192.168.0.78:8080 manually here.
    return '';
  }

  // ===============================
  // UI: select + sizes + cart logic
  // ===============================
  setSize(size: Size) {
    this.selectedSize = size;
  }

  onSelectOrClear(): void {
    if (!this.selectMode) {
      this.selectMode = true;
      this.selectModeSubject.next(true);
      return;
    }

    this.storeShopCart.dispatch(clearShopCart());
    this.selectMode = false;
    this.selectModeSubject.next(false);
  }

  isInCart(pictureId: string): boolean {
    return this.cartMap.has(pictureId);
  }

  cartSizeLabel(pictureId: string): string {
    const item = this.cartMap.get(pictureId);
    if (!item?.size) return '';
    if (item.size === 'small') return 'Small';
    if (item.size === 'full') return 'Full';
    return 'Royalty';
  }

  openPreview(img: Image, index: number): void {
    this.selectMode$.pipe(take(1)).subscribe((selecting) => {
      if (!selecting) {
        this.dialog.open(ImageModalComponent, {
          data: {
            images: this.images,
            startIndex: index,
            forSale: this.forSale,
            prices: this.prices,
          },
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          panelClass: 'full-screen-dialog',
          backdropClass: 'custom-backdrop',
        });
        return;
      }

      // selecting: add/remove
      if (!this.forSale || !this.prices) return;

      const nextPrice = this.resolvePrice(this.prices, this.selectedSize);

      // toggle / replace by pictureId
      const existing = this.cartMap.get(img.pictureId);

      if (existing && existing.size === this.selectedSize) {
        this.storeShopCart.dispatch(
          removeImageFromCart({ pictureId: img.pictureId }),
        );

        if (this.selectedCount === 1) {
          this.selectMode = false;
          this.selectModeSubject.next(false);
        }
        return;
      }

      this.storeShopCart.dispatch(
        addImageToCart({
          cartItem: {
            image: img,
            size: this.selectedSize,
            price: nextPrice,
          },
        }),
      );
    });
  }

  private resolvePrice(prices: Price, size: Size): number {
    if (size === 'small') return prices.priceSmall ?? 0;
    if (size === 'full') return prices.priceFull ?? 0;
    return prices.priceRoyalty ?? 0;
  }

  goToCheckout(): void {
    sessionStorage.setItem(
      'returnUrl',
      window.location.pathname + window.location.search,
    );
    this.router.navigate(['/checkout']);
  }

  downloadSelected(): void {
    console.log('Download selected clicked');
    // events flow: keep your existing zip logic later.
    // For now leave it same as viewpics: do nothing or hook to your endpoint when ready.
  }
}
