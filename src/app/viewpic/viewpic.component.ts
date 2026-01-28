// viewpic.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { select, Store } from '@ngrx/store';
import {
  Observable,
  of,
  take,
  BehaviorSubject,
  distinctUntilChanged,
  map,
  combineLatest,
} from 'rxjs';

import { Image, ImageOwner } from '../models/response';
import { QrViewResponse } from '../models/qr-read-response';
import { ShopCart } from '../models/shopCart';

import { ImageModalComponent } from '../image-modal/image-modal.component';
import { PictureService } from '../services/picture.service';

import { landingDataLoad } from '../store/actions/landingData.actions';

import {
  selectLandingPictures,
  selectOwner,
  selectForSale,
  selectPrices,
} from '../store/selectors/landingData.selector';

import {
  addImageToCart,
  clearShopCart,
  removeImageFromCart,
} from '../store/actions/shopcart.actions';
import { selectItems } from '../store/selectors/shopcart.selector';
import { EventService } from '../services/event.service';

type Size = 'small' | 'full' | 'royalty';
type LandingAny = any;

@Component({
  selector: 'app-viewpic',
  standalone: true,
  imports: [MatGridListModule, CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './viewpic.component.html',
  styleUrl: './viewpic.component.scss',
})
export class ViewpicComponent implements OnInit {
  qr?: string;
  inviteCode?: string;

  eventName?: string;
  isPublic?: boolean;

  // ✅ unified qrCode used for download zip in BOTH flows
  activeQrCode?: string;

  images$: Observable<Image[]> = of([]);
  owner$: Observable<ImageOwner | null> = of(null);
  forSale$: Observable<boolean> = of(false);
  prices$: Observable<{
    priceSmall: number;
    priceFull: number;
    priceRoyalty: number;
  } | null> = of(null);

  downloadLocked = false;
  downloadLockedMsg =
    'Free download used. Please login or create an account to download again.';

  isPrivateEvent$: Observable<boolean> = of(false);

  cartItems$!: Observable<{ image: Image; size: Size | null; price: number }[]>;

  private selectModeSubject = new BehaviorSubject<boolean>(false);
  selectMode$ = this.selectModeSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  selectMode = false;
  selectedCount = 0;
  selectedSize: Size = 'small';
  isDesktop = false;

  // used for fast lookup / badges
  private cartMap = new Map<string, { size: Size | null; price: number }>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private storeLanding: Store<{ landingData: QrViewResponse }>,
    private storeShopCart: Store<{ shopCart: ShopCart }>,
    private pictureService: PictureService,
    private eventService: EventService,
  ) {
    this.cartItems$ = this.storeShopCart.pipe(select(selectItems));
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const qrid = params.get('qrid');
      const code = params.get('code');

      if (qrid && qrid.trim().length > 0) {
        this.qr = qrid.trim();
        this.inviteCode = undefined;
        this.eventName = undefined;
        this.isPublic = undefined;

        // ✅ QR flow download should use route qr
        this.activeQrCode = this.qr;

        // ✅ clear previous selection/cart when switching codes
        this.storeShopCart.dispatch(clearShopCart());
        this.selectMode = false;
        this.selectModeSubject.next(false);

        this.storeLanding.dispatch(landingDataLoad({ qr: this.qr }));
        return;
      }

      if (code && code.trim().length > 0) {
        this.inviteCode = code.trim();
        this.qr = undefined;

        // ✅ Event flow: activeQrCode will come from landing response (res.qrCode)
        this.activeQrCode = undefined;

        // ✅ clear previous selection/cart when switching codes
        this.storeShopCart.dispatch(clearShopCart());
        this.selectMode = false;
        this.selectModeSubject.next(false);

        this.storeLanding.dispatch(
          landingDataLoad({ inviteCode: this.inviteCode }),
        );
        return;
      }

      console.warn('ViewpicComponent: missing route param (qrid/code).');
    });

    this.images$ = this.storeLanding.select(selectLandingPictures);
    this.owner$ = this.storeLanding.select(selectOwner);
    this.forSale$ = this.storeLanding.select(selectForSale);
    this.prices$ = this.storeLanding.select(selectPrices);

    this.isDesktop = window.innerWidth > 768;

    // Extract event fields + activeQrCode from landingData when invite flow is active
    this.storeLanding
      .pipe(select((s: any) => s.landingData as LandingAny))
      .subscribe((res: LandingAny) => {
        if (!this.inviteCode) {
          this.eventName = undefined;
          this.isPublic = undefined;
          // QR flow already sets activeQrCode from route param
          return;
        }

        this.eventName =
          typeof res?.eventName === 'string' ? res.eventName : undefined;
        this.isPublic =
          typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

        // ✅ IMPORTANT: Event responses include qrCode in JSON
        this.activeQrCode =
          typeof res?.qrCode === 'string' ? res.qrCode : undefined;
      });

    // Private event flag: inviteCode present AND isPublic is not true
    this.isPrivateEvent$ = this.storeLanding.pipe(
      select((s: any) => s.landingData as LandingAny),
      map((res: LandingAny) => {
        const hasInvite =
          !!this.inviteCode && this.inviteCode.trim().length > 0;
        if (!hasInvite) return false;

        const pub =
          typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

        // NOTE: this treats undefined as private until response loads
        return pub !== true;
      }),
      distinctUntilChanged(),
    );

    // Keep cartMap + selectedCount synced
    this.cartItems$.subscribe((items) => {
      this.cartMap.clear();
      for (const it of items) {
        this.cartMap.set(it.image.pictureId, {
          size: it.size,
          price: it.price,
        });
      }
      this.selectedCount = items.length;

      // ✅ If selection mode is ON but user removed last selection → auto-exit
      if (this.selectMode && this.selectedCount === 0) {
        this.selectMode = false;
        this.selectModeSubject.next(false);
      }
    });

    this.selectModeSubject.next(this.selectMode);
  }

  setSize(size: Size) {
    this.selectedSize = size;
  }

  openImageModal(image: Image): void {
    this.dialog.open(ImageModalComponent, {
      data: { image },
      width: window.innerWidth < 768 ? '90vw' : '600px',
      backdropClass: 'custom-backdrop',
    });
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

  openPreview(image: Image): void {
    this.selectMode$.pipe(take(1)).subscribe((selecting) => {
      if (!selecting) {
        this.openImageModal(image);
        return;
      }

      // ✅ Unified selection behavior:
      // - Paid: selectable only when forSale=true (same as before)
      // - Free: selectable too (NEW), so user can choose which pics to download
      this.forSale$.pipe(take(1)).subscribe((isForSale) => {
        if (isForSale) {
          this.prices$.pipe(take(1)).subscribe((prices) => {
            const nextPrice = this.resolvePrice(prices, this.selectedSize);

            this.cartItems$.pipe(take(1)).subscribe((items) => {
              const existing = items.find(
                (i) => i.image.pictureId === image.pictureId,
              );

              if (existing && existing.size === this.selectedSize) {
                this.storeShopCart.dispatch(
                  removeImageFromCart({ pictureId: image.pictureId }),
                );
                return;
              }

              this.storeShopCart.dispatch(
                addImageToCart({
                  cartItem: {
                    image,
                    size: this.selectedSize,
                    price: nextPrice,
                  },
                }),
              );
            });
          });
          return;
        }

        // ✅ FREE selection (NEW): still uses cart as the selection basket
        // size/price don't matter for free downloads
        this.cartItems$.pipe(take(1)).subscribe((items) => {
          const existing = items.find(
            (i) => i.image.pictureId === image.pictureId,
          );
          if (existing) {
            this.storeShopCart.dispatch(
              removeImageFromCart({ pictureId: image.pictureId }),
            );
            return;
          }

          this.storeShopCart.dispatch(
            addImageToCart({
              cartItem: { image, size: null, price: 0 },
            }),
          );
        });
      });
    });
  }

  private resolvePrice(
    prices: {
      priceSmall: number;
      priceFull: number;
      priceRoyalty: number;
    } | null,
    size: Size,
  ): number {
    if (!prices) return 0;
    if (size === 'small') return prices.priceSmall ?? 0;
    if (size === 'full') return prices.priceFull ?? 0;
    return prices.priceRoyalty ?? 0;
  }

  downloadSelected(): void {
    // ✅ FE-only limit: 1 free download per inviteCode when not logged in
    if (this.inviteCode) {
      const isLoggedIn = !!localStorage.getItem('access_token'); // adjust if needed
      if (!isLoggedIn) {
        const k = `event_free_download_used_${this.inviteCode}`;
        const alreadyUsed = localStorage.getItem(k) === '1';
        if (alreadyUsed) {
          this.downloadLocked = true;
          return;
        }
        localStorage.setItem(k, '1');
      }
    }

    // ✅ Always require a selection when selectMode is ON
    // (Button is already disabled, but this prevents silent no-op)
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      const selectedPictureIds = (items ?? [])
        .map((i) => i?.image?.pictureId)
        .filter(
          (x): x is string => typeof x === 'string' && x.trim().length > 0,
        );

      const hasSelection = selectedPictureIds.length > 0;

      // If in selection mode, you must choose
      if (this.selectMode && !hasSelection) {
        console.warn(
          'downloadSelected(): selectMode is ON but nothing selected.',
        );
        return;
      }

      // Resolve qr for BOTH flows:
      // - QR flow: this.qr
      // - Invite flow: this.activeQrCode (from landing response)
      const resolvedQr =
        (this.qr && this.qr.trim().length > 0 ? this.qr.trim() : undefined) ||
        (this.activeQrCode && this.activeQrCode.trim().length > 0
          ? this.activeQrCode.trim()
          : undefined);

      if (!resolvedQr) {
        console.warn(
          'downloadSelected(): no resolved QR (qr/activeQrCode missing).',
          {
            qr: this.qr,
            activeQrCode: this.activeQrCode,
            inviteCode: this.inviteCode,
          },
        );
        return;
      }

      // ✅ If no selection (selectMode OFF), treat it as "download all previews"
      // ✅ If selection exists, request zip for only those pictures (requires BE endpoint)
      //
      // IMPORTANT:
      // - Your existing service method is QR-only: getPreviewZipUrlByQrCode(qr)
      // - To support selecting specific images, you need a second endpoint/service method.
      //
      // We will call it if it exists: getPreviewZipUrlByQrCodeAndPictures(qr, pictureIds)
      // If not present, we fall back to full-zip-by-qr (so you don't break downloads).

      const svc: any = this.pictureService as any;

      if (
        hasSelection &&
        typeof svc.getPreviewZipUrlByQrCodeAndPictures === 'function'
      ) {
        svc
          .getPreviewZipUrlByQrCodeAndPictures(resolvedQr, selectedPictureIds)
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              if (res?.url) window.location.href = res.url;
            },
            error: (err: any) => console.error('downloadSelected():', err),
          });
        return;
      }

      // Fallback: download all previews for that QR
      this.pictureService
        .getPreviewZipUrlByQrCode(resolvedQr)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            if (res?.url) window.location.href = res.url;
          },
          error: (err) => console.error('downloadSelected():', err),
        });
    });
  }

  goToCheckout(): void {
    sessionStorage.setItem(
      'returnUrl',
      window.location.pathname + window.location.search,
    );
    this.router.navigate(['/checkout']);
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: window.location.pathname + window.location.search,
      },
    });
  }
}
