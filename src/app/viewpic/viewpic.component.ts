// viewpic.component.ts

// viewpic.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  Subject,
  takeUntil,
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

type Size = 'small' | 'full' | 'royalty';
type LandingAny = any;

@Component({
  selector: 'app-viewpic',
  standalone: true,
  imports: [
    MatGridListModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './viewpic.component.html',
  styleUrl: './viewpic.component.scss',
})
export class ViewpicComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  qr?: string;
  inviteCode?: string;

  eventName?: string;
  isPublic?: boolean;

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

  private cartMap = new Map<string, { size: Size | null; price: number }>();

  private readonly CONTEXT_KEY = 'viewpic_context';
  private readonly SELECT_MODE_KEY = 'viewpic_select_mode';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private storeLanding: Store<{ landingData: QrViewResponse }>,
    private storeShopCart: Store<{ shopCart: ShopCart }>,
    private pictureService: PictureService,
    private snackBar: MatSnackBar,
  ) {
    this.cartItems$ = this.storeShopCart.pipe(select(selectItems));
  }

  ngOnInit() {
    // restore selectMode preference (when returning from checkout)
    const savedSelectMode = sessionStorage.getItem(this.SELECT_MODE_KEY);
    if (savedSelectMode === '1') {
      this.selectMode = true;
      this.selectModeSubject.next(true);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const qrid = params.get('qrid');
      const code = params.get('code');

      const nextContext = this._makeContext(qrid, code);
      const prevContext = sessionStorage.getItem(this.CONTEXT_KEY);

      // ✅ only clear cart if we truly switched QR/invite
      const contextChanged =
        !!prevContext && !!nextContext && prevContext !== nextContext;

      if (contextChanged) {
        this.storeShopCart.dispatch(clearShopCart());

        this.selectMode = false;
        this.selectModeSubject.next(false);
        sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
      }

      if (nextContext) {
        sessionStorage.setItem(this.CONTEXT_KEY, nextContext);
      }

      if (qrid && qrid.trim().length > 0) {
        this.qr = qrid.trim();
        this.inviteCode = undefined;
        this.eventName = undefined;
        this.isPublic = undefined;

        this.activeQrCode = this.qr;

        this.storeLanding.dispatch(landingDataLoad({ qr: this.qr }));
        return;
      }

      if (code && code.trim().length > 0) {
        this.inviteCode = code.trim();
        this.qr = undefined;

        // invite flow: we’ll fill this from landingData response
        this.activeQrCode = undefined;

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
      .pipe(
        takeUntil(this.destroy$),
        select((s: any) => s.landingData as LandingAny),
      )
      .subscribe((res: LandingAny) => {
        if (!this.inviteCode) {
          this.eventName = undefined;
          this.isPublic = undefined;
          // keep activeQrCode as-is for QR flow
          return;
        }

        this.eventName =
          typeof res?.eventName === 'string' ? res.eventName : undefined;
        this.isPublic =
          typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

        // ✅ FIX: use res.qrCode (NOT res.qCode)
        this.activeQrCode =
          typeof res?.qrCode === 'string' ? res.qrCode : undefined;
      });

    // Private event flag
    this.isPrivateEvent$ = this.storeLanding.pipe(
      select((s: any) => s.landingData as LandingAny),
      map((res: LandingAny) => {
        const hasInvite =
          !!this.inviteCode && this.inviteCode.trim().length > 0;
        if (!hasInvite) return false;

        const pub =
          typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

        return pub !== true;
      }),
      distinctUntilChanged(),
    );

    // ✅ Keep cartMap + selectedCount synced AND keep selectMode UI consistent
    this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.cartMap.clear();
      for (const it of items) {
        this.cartMap.set(it.image.pictureId, {
          size: it.size,
          price: it.price,
        });
      }

      this.selectedCount = items.length;

      // ✅ If there are items, selectMode must be ON so radios appear immediately
      if (this.selectedCount > 0 && !this.selectMode) {
        this.selectMode = true;
        this.selectModeSubject.next(true);
        sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
      }
    });

    this.selectModeSubject.next(this.selectMode);
  }

  private _makeContext(
    qrid: string | null,
    code: string | null,
  ): string | null {
    const q = (qrid ?? '').trim();
    if (q.length > 0) return `QR:${q}`;

    const c = (code ?? '').trim();
    if (c.length > 0) return `INVITE:${c}`;

    return null;
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
      sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
      return;
    }

    this.storeShopCart.dispatch(clearShopCart());

    this.selectMode = false;
    this.selectModeSubject.next(false);
    sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
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

        // FREE selection uses cart as basket
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

          // ✅ Step 1: enforce max 5 selections for FREE events
          if ((items ?? []).length >= 5) {
            console.warn('Free events: max 5 selections.');
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

  private startDownloadAndReset(url: string): void {
    // Trigger browser download
    const a = document.createElement('a');
    a.href = url;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // UX feedback
    this.snackBar.open('Download started', 'OK', {
      duration: 2500,
    });

    // Clear selection
    this.storeShopCart.dispatch(clearShopCart());
    this.selectMode = false;
    this.selectModeSubject.next(false);
    sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
  }

  downloadSelected(): void {
    if (this.inviteCode) {
      const isLoggedIn = !!localStorage.getItem('access_token');
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

    this.cartItems$.pipe(take(1)).subscribe((items) => {
      const selectedPictureIds = (items ?? [])
        .map((i) => i?.image?.pictureId)
        .filter(
          (x): x is string => typeof x === 'string' && x.trim().length > 0,
        );

      const hasSelection = selectedPictureIds.length > 0;

      if (this.selectMode && !hasSelection) {
        console.warn('downloadSelected(): selectMode ON but nothing selected.');
        return;
      }

      // ✅ FIX: resolve QR for both flows (QR + INVITE)
      // last fallback to inviteCode ONLY if your backend treats inviteCode as qrCode
      const resolvedQr =
        (this.qr && this.qr.trim().length > 0 ? this.qr.trim() : undefined) ||
        (this.activeQrCode && this.activeQrCode.trim().length > 0
          ? this.activeQrCode.trim()
          : undefined) ||
        (this.inviteCode && this.inviteCode.trim().length > 0
          ? this.inviteCode.trim()
          : undefined);

      if (!resolvedQr) {
        console.warn('downloadSelected(): no resolved QR', {
          qr: this.qr,
          activeQrCode: this.activeQrCode,
          inviteCode: this.inviteCode,
        });
        return;
      }

      if (hasSelection) {
        this.pictureService
          .getPreviewZipUrlByQrCodeAndPictures(resolvedQr, selectedPictureIds)
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              if (res?.url) this.startDownloadAndReset(res.url);
            },
            error: (err: any) => console.error('downloadSelected():', err),
          });
        return;
      }

      this.pictureService
        .getPreviewZipUrlByQrCode(resolvedQr)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            if (res?.url) this.startDownloadAndReset(res.url);
          },
          error: (err) => console.error('downloadSelected():', err),
        });
    });
  }

  goToCheckout(): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      const count = (items ?? []).length;

      if (count === 0) {
        if (!this.selectMode) {
          this.selectMode = true;
          this.selectModeSubject.next(true);
          sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
        }
        return;
      }

      sessionStorage.setItem('returnUrl', this.router.url);
      this.router.navigate(['/checkout']);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatDialog } from '@angular/material/dialog';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';

// import { select, Store } from '@ngrx/store';
// import {
//   Observable,
//   of,
//   take,
//   BehaviorSubject,
//   distinctUntilChanged,
//   map,
//   Subject,
//   takeUntil,
// } from 'rxjs';

// import { Image, ImageOwner } from '../models/response';
// import { QrViewResponse } from '../models/qr-read-response';
// import { ShopCart } from '../models/shopCart';

// import { ImageModalComponent } from '../image-modal/image-modal.component';
// import { PictureService } from '../services/picture.service';

// import { landingDataLoad } from '../store/actions/landingData.actions';

// import {
//   selectLandingPictures,
//   selectOwner,
//   selectForSale,
//   selectPrices,
// } from '../store/selectors/landingData.selector';

// import {
//   addImageToCart,
//   clearShopCart,
//   removeImageFromCart,
// } from '../store/actions/shopcart.actions';
// import { selectItems } from '../store/selectors/shopcart.selector';

// type Size = 'small' | 'full' | 'royalty';
// type LandingAny = any;

// @Component({
//   selector: 'app-viewpic',
//   standalone: true,
//   imports: [MatGridListModule, CommonModule, MatIconModule, MatButtonModule],
//   templateUrl: './viewpic.component.html',
//   styleUrl: './viewpic.component.scss',
// })
// export class ViewpicComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();

//   qr?: string;
//   inviteCode?: string;

//   eventName?: string;
//   isPublic?: boolean;

//   activeQrCode?: string;

//   images$: Observable<Image[]> = of([]);
//   owner$: Observable<ImageOwner | null> = of(null);
//   forSale$: Observable<boolean> = of(false);
//   prices$: Observable<{
//     priceSmall: number;
//     priceFull: number;
//     priceRoyalty: number;
//   } | null> = of(null);

//   downloadLocked = false;
//   downloadLockedMsg =
//     'Free download used. Please login or create an account to download again.';

//   isPrivateEvent$: Observable<boolean> = of(false);

//   cartItems$!: Observable<{ image: Image; size: Size | null; price: number }[]>;

//   private selectModeSubject = new BehaviorSubject<boolean>(false);
//   selectMode$ = this.selectModeSubject
//     .asObservable()
//     .pipe(distinctUntilChanged());

//   selectMode = false;
//   selectedCount = 0;
//   selectedSize: Size = 'small';
//   isDesktop = false;

//   private cartMap = new Map<string, { size: Size | null; price: number }>();

//   private readonly CONTEXT_KEY = 'viewpic_context';
//   private readonly SELECT_MODE_KEY = 'viewpic_select_mode';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private dialog: MatDialog,
//     private storeLanding: Store<{ landingData: QrViewResponse }>,
//     private storeShopCart: Store<{ shopCart: ShopCart }>,
//     private pictureService: PictureService,
//   ) {
//     this.cartItems$ = this.storeShopCart.pipe(select(selectItems));
//   }

//   ngOnInit() {
//     // restore selectMode preference (when returning from checkout)
//     const savedSelectMode = sessionStorage.getItem(this.SELECT_MODE_KEY);
//     if (savedSelectMode === '1') {
//       this.selectMode = true;
//       this.selectModeSubject.next(true);
//     }

//     this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
//       const qrid = params.get('qrid');
//       const code = params.get('code');

//       const nextContext = this._makeContext(qrid, code);
//       const prevContext = sessionStorage.getItem(this.CONTEXT_KEY);

//       // ✅ only clear cart if we truly switched QR/invite
//       const contextChanged =
//         !!prevContext && !!nextContext && prevContext !== nextContext;

//       if (contextChanged) {
//         this.storeShopCart.dispatch(clearShopCart());

//         this.selectMode = false;
//         this.selectModeSubject.next(false);
//         sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
//       }

//       if (nextContext) {
//         sessionStorage.setItem(this.CONTEXT_KEY, nextContext);
//       }

//       if (qrid && qrid.trim().length > 0) {
//         this.qr = qrid.trim();
//         this.inviteCode = undefined;
//         this.eventName = undefined;
//         this.isPublic = undefined;

//         this.activeQrCode = this.qr;

//         this.storeLanding.dispatch(landingDataLoad({ qr: this.qr }));
//         return;
//       }

//       if (code && code.trim().length > 0) {
//         this.inviteCode = code.trim();
//         this.qr = undefined;

//         this.activeQrCode = undefined;

//         this.storeLanding.dispatch(
//           landingDataLoad({ inviteCode: this.inviteCode }),
//         );
//         return;
//       }

//       console.warn('ViewpicComponent: missing route param (qrid/code).');
//     });

//     this.images$ = this.storeLanding.select(selectLandingPictures);
//     this.owner$ = this.storeLanding.select(selectOwner);
//     this.forSale$ = this.storeLanding.select(selectForSale);
//     this.prices$ = this.storeLanding.select(selectPrices);

//     this.isDesktop = window.innerWidth > 768;

//     // Extract event fields + activeQrCode from landingData when invite flow is active
//     this.storeLanding
//       .pipe(
//         takeUntil(this.destroy$),
//         select((s: any) => s.landingData as LandingAny),
//       )
//       .subscribe((res: LandingAny) => {
//         if (!this.inviteCode) {
//           this.eventName = undefined;
//           this.isPublic = undefined;
//           return;
//         }

//         this.eventName =
//           typeof res?.eventName === 'string' ? res.eventName : undefined;
//         this.isPublic =
//           typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

//         this.activeQrCode =
//           typeof res?.qrCode === 'string' ? res.qCode : undefined;
//       });

//     // Private event flag
//     this.isPrivateEvent$ = this.storeLanding.pipe(
//       select((s: any) => s.landingData as LandingAny),
//       map((res: LandingAny) => {
//         const hasInvite =
//           !!this.inviteCode && this.inviteCode.trim().length > 0;
//         if (!hasInvite) return false;

//         const pub =
//           typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

//         return pub !== true;
//       }),
//       distinctUntilChanged(),
//     );

//     // ✅ Keep cartMap + selectedCount synced AND keep selectMode UI consistent
//     this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
//       this.cartMap.clear();
//       for (const it of items) {
//         this.cartMap.set(it.image.pictureId, {
//           size: it.size,
//           price: it.price,
//         });
//       }

//       this.selectedCount = items.length;

//       // ✅ If there are items, selectMode must be ON so radios appear immediately
//       if (this.selectedCount > 0 && !this.selectMode) {
//         this.selectMode = true;
//         this.selectModeSubject.next(true);
//         sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
//       }
//     });

//     this.selectModeSubject.next(this.selectMode);
//   }

//   private _makeContext(
//     qrid: string | null,
//     code: string | null,
//   ): string | null {
//     const q = (qrid ?? '').trim();
//     if (q.length > 0) return `QR:${q}`;

//     const c = (code ?? '').trim();
//     if (c.length > 0) return `INVITE:${c}`;

//     return null;
//   }

//   setSize(size: Size) {
//     this.selectedSize = size;
//   }

//   openImageModal(image: Image): void {
//     this.dialog.open(ImageModalComponent, {
//       data: { image },
//       width: window.innerWidth < 768 ? '90vw' : '600px',
//       backdropClass: 'custom-backdrop',
//     });
//   }

//   onSelectOrClear(): void {
//     if (!this.selectMode) {
//       this.selectMode = true;
//       this.selectModeSubject.next(true);
//       sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
//       return;
//     }

//     this.storeShopCart.dispatch(clearShopCart());

//     this.selectMode = false;
//     this.selectModeSubject.next(false);
//     sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
//   }

//   isInCart(pictureId: string): boolean {
//     return this.cartMap.has(pictureId);
//   }

//   cartSizeLabel(pictureId: string): string {
//     const item = this.cartMap.get(pictureId);
//     if (!item?.size) return '';
//     if (item.size === 'small') return 'Small';
//     if (item.size === 'full') return 'Full';
//     return 'Royalty';
//   }

//   openPreview(image: Image): void {
//     this.selectMode$.pipe(take(1)).subscribe((selecting) => {
//       if (!selecting) {
//         this.openImageModal(image);
//         return;
//       }

//       this.forSale$.pipe(take(1)).subscribe((isForSale) => {
//         if (isForSale) {
//           this.prices$.pipe(take(1)).subscribe((prices) => {
//             const nextPrice = this.resolvePrice(prices, this.selectedSize);

//             this.cartItems$.pipe(take(1)).subscribe((items) => {
//               const existing = items.find(
//                 (i) => i.image.pictureId === image.pictureId,
//               );

//               if (existing && existing.size === this.selectedSize) {
//                 this.storeShopCart.dispatch(
//                   removeImageFromCart({ pictureId: image.pictureId }),
//                 );
//                 return;
//               }

//               this.storeShopCart.dispatch(
//                 addImageToCart({
//                   cartItem: {
//                     image,
//                     size: this.selectedSize,
//                     price: nextPrice,
//                   },
//                 }),
//               );
//             });
//           });
//           return;
//         }

//         // FREE selection uses cart as basket
//         this.cartItems$.pipe(take(1)).subscribe((items) => {
//           const existing = items.find(
//             (i) => i.image.pictureId === image.pictureId,
//           );
//           if (existing) {
//             this.storeShopCart.dispatch(
//               removeImageFromCart({ pictureId: image.pictureId }),
//             );
//             return;
//           }

//           // ✅ Step 1: enforce max 5 selections for FREE events
//           if ((items ?? []).length >= 5) {
//             console.warn('Free events: max 5 selections.');
//             return;
//           }

//           this.storeShopCart.dispatch(
//             addImageToCart({
//               cartItem: { image, size: null, price: 0 },
//             }),
//           );
//         });
//       });
//     });
//   }

//   private resolvePrice(
//     prices: {
//       priceSmall: number;
//       priceFull: number;
//       priceRoyalty: number;
//     } | null,
//     size: Size,
//   ): number {
//     if (!prices) return 0;
//     if (size === 'small') return prices.priceSmall ?? 0;
//     if (size === 'full') return prices.priceFull ?? 0;
//     return prices.priceRoyalty ?? 0;
//   }

//   downloadSelected(): void {
//     if (this.inviteCode) {
//       const isLoggedIn = !!localStorage.getItem('access_token');
//       if (!isLoggedIn) {
//         const k = `event_free_download_used_${this.inviteCode}`;
//         const alreadyUsed = localStorage.getItem(k) === '1';
//         if (alreadyUsed) {
//           this.downloadLocked = true;
//           return;
//         }
//         localStorage.setItem(k, '1');
//       }
//     }

//     this.cartItems$.pipe(take(1)).subscribe((items) => {
//       const selectedPictureIds = (items ?? [])
//         .map((i) => i?.image?.pictureId)
//         .filter(
//           (x): x is string => typeof x === 'string' && x.trim().length > 0,
//         );

//       const hasSelection = selectedPictureIds.length > 0;

//       if (this.selectMode && !hasSelection) {
//         console.warn('downloadSelected(): selectMode ON but nothing selected.');
//         return;
//       }

//       const resolvedQr =
//         (this.qr && this.qr.trim().length > 0 ? this.qr.trim() : undefined) ||
//         (this.activeQrCode && this.activeQrCode.trim().length > 0
//           ? this.activeQrCode.trim()
//           : undefined);

//       if (!resolvedQr) {
//         console.warn('downloadSelected(): no resolved QR', {
//           qr: this.qr,
//           activeQrCode: this.activeQrCode,
//           inviteCode: this.inviteCode,
//         });
//         return;
//       }

//       // ✅ Step 1: if user selected pictures, download ONLY those
//       if (hasSelection) {
//         this.pictureService
//           .getPreviewZipUrlByQrCodeAndPictures(resolvedQr, selectedPictureIds)
//           .pipe(take(1))
//           .subscribe({
//             next: (res: any) => {
//               if (res?.url) window.location.href = res.url;
//             },
//             error: (err: any) => console.error('downloadSelected():', err),
//           });
//         return;
//       }

//       // fallback: if nothing selected, keep old behavior (optional)
//       this.pictureService
//         .getPreviewZipUrlByQrCode(resolvedQr)
//         .pipe(take(1))
//         .subscribe({
//           next: (res) => {
//             if (res?.url) window.location.href = res.url;
//           },
//           error: (err) => console.error('downloadSelected():', err),
//         });
//     });
//   }

//   goToCheckout(): void {
//     this.cartItems$.pipe(take(1)).subscribe((items) => {
//       const count = (items ?? []).length;

//       if (count === 0) {
//         if (!this.selectMode) {
//           this.selectMode = true;
//           this.selectModeSubject.next(true);
//           sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
//         }
//         return;
//       }

//       sessionStorage.setItem('returnUrl', this.router.url);
//       this.router.navigate(['/checkout']);
//     });
//   }

//   goToLogin(): void {
//     this.router.navigate(['/login'], {
//       queryParams: { returnUrl: this.router.url },
//     });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

// // viewpic.component.ts
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatDialog } from '@angular/material/dialog';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';

// import { select, Store } from '@ngrx/store';
// import {
//   Observable,
//   of,
//   take,
//   BehaviorSubject,
//   distinctUntilChanged,
//   map,
//   Subject,
//   takeUntil,
// } from 'rxjs';

// import { Image, ImageOwner } from '../models/response';
// import { QrViewResponse } from '../models/qr-read-response';
// import { ShopCart } from '../models/shopCart';

// import { ImageModalComponent } from '../image-modal/image-modal.component';
// import { PictureService } from '../services/picture.service';

// import { landingDataLoad } from '../store/actions/landingData.actions';

// import {
//   selectLandingPictures,
//   selectOwner,
//   selectForSale,
//   selectPrices,
// } from '../store/selectors/landingData.selector';

// import {
//   addImageToCart,
//   clearShopCart,
//   removeImageFromCart,
// } from '../store/actions/shopcart.actions';
// import { selectItems } from '../store/selectors/shopcart.selector';

// type Size = 'small' | 'full' | 'royalty';
// type LandingAny = any;

// @Component({
//   selector: 'app-viewpic',
//   standalone: true,
//   imports: [MatGridListModule, CommonModule, MatIconModule, MatButtonModule],
//   templateUrl: './viewpic.component.html',
//   styleUrl: './viewpic.component.scss',
// })
// export class ViewpicComponent implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();

//   qr?: string;
//   inviteCode?: string;

//   eventName?: string;
//   isPublic?: boolean;

//   activeQrCode?: string;

//   images$: Observable<Image[]> = of([]);
//   owner$: Observable<ImageOwner | null> = of(null);
//   forSale$: Observable<boolean> = of(false);
//   prices$: Observable<{
//     priceSmall: number;
//     priceFull: number;
//     priceRoyalty: number;
//   } | null> = of(null);

//   downloadLocked = false;
//   downloadLockedMsg =
//     'Free download used. Please login or create an account to download again.';

//   isPrivateEvent$: Observable<boolean> = of(false);

//   cartItems$!: Observable<{ image: Image; size: Size | null; price: number }[]>;

//   private selectModeSubject = new BehaviorSubject<boolean>(false);
//   selectMode$ = this.selectModeSubject
//     .asObservable()
//     .pipe(distinctUntilChanged());

//   selectMode = false;
//   selectedCount = 0;
//   selectedSize: Size = 'small';
//   isDesktop = false;

//   private cartMap = new Map<string, { size: Size | null; price: number }>();

//   private readonly CONTEXT_KEY = 'viewpic_context';
//   private readonly SELECT_MODE_KEY = 'viewpic_select_mode';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private dialog: MatDialog,
//     private storeLanding: Store<{ landingData: QrViewResponse }>,
//     private storeShopCart: Store<{ shopCart: ShopCart }>,
//     private pictureService: PictureService,
//   ) {
//     this.cartItems$ = this.storeShopCart.pipe(select(selectItems));
//   }

//   ngOnInit() {
//     // restore selectMode preference (when returning from checkout)
//     const savedSelectMode = sessionStorage.getItem(this.SELECT_MODE_KEY);
//     if (savedSelectMode === '1') {
//       this.selectMode = true;
//       this.selectModeSubject.next(true);
//     }

//     this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
//       const qrid = params.get('qrid');
//       const code = params.get('code');

//       const nextContext = this._makeContext(qrid, code);
//       const prevContext = sessionStorage.getItem(this.CONTEXT_KEY);

//       // ✅ only clear cart if we truly switched QR/invite
//       const contextChanged =
//         !!prevContext && !!nextContext && prevContext !== nextContext;

//       if (contextChanged) {
//         this.storeShopCart.dispatch(clearShopCart());

//         this.selectMode = false;
//         this.selectModeSubject.next(false);
//         sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
//       }

//       if (nextContext) {
//         sessionStorage.setItem(this.CONTEXT_KEY, nextContext);
//       }

//       if (qrid && qrid.trim().length > 0) {
//         this.qr = qrid.trim();
//         this.inviteCode = undefined;
//         this.eventName = undefined;
//         this.isPublic = undefined;

//         this.activeQrCode = this.qr;

//         this.storeLanding.dispatch(landingDataLoad({ qr: this.qr }));
//         return;
//       }

//       if (code && code.trim().length > 0) {
//         this.inviteCode = code.trim();
//         this.qr = undefined;

//         this.activeQrCode = undefined;

//         this.storeLanding.dispatch(
//           landingDataLoad({ inviteCode: this.inviteCode }),
//         );
//         return;
//       }

//       console.warn('ViewpicComponent: missing route param (qrid/code).');
//     });

//     this.images$ = this.storeLanding.select(selectLandingPictures);
//     this.owner$ = this.storeLanding.select(selectOwner);
//     this.forSale$ = this.storeLanding.select(selectForSale);
//     this.prices$ = this.storeLanding.select(selectPrices);

//     this.isDesktop = window.innerWidth > 768;

//     // Extract event fields + activeQrCode from landingData when invite flow is active
//     this.storeLanding
//       .pipe(
//         takeUntil(this.destroy$),
//         select((s: any) => s.landingData as LandingAny),
//       )
//       .subscribe((res: LandingAny) => {
//         if (!this.inviteCode) {
//           this.eventName = undefined;
//           this.isPublic = undefined;
//           return;
//         }

//         this.eventName =
//           typeof res?.eventName === 'string' ? res.eventName : undefined;
//         this.isPublic =
//           typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

//         this.activeQrCode =
//           typeof res?.qrCode === 'string' ? res.qrCode : undefined;
//       });

//     // Private event flag
//     this.isPrivateEvent$ = this.storeLanding.pipe(
//       select((s: any) => s.landingData as LandingAny),
//       map((res: LandingAny) => {
//         const hasInvite =
//           !!this.inviteCode && this.inviteCode.trim().length > 0;
//         if (!hasInvite) return false;

//         const pub =
//           typeof res?.isPublic === 'boolean' ? res.isPublic : undefined;

//         return pub !== true;
//       }),
//       distinctUntilChanged(),
//     );

//     // ✅ Keep cartMap + selectedCount synced AND keep selectMode UI consistent
//     this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
//       this.cartMap.clear();
//       for (const it of items) {
//         this.cartMap.set(it.image.pictureId, {
//           size: it.size,
//           price: it.price,
//         });
//       }

//       this.selectedCount = items.length;

//       // ✅ If there are items, selectMode must be ON so radios appear immediately
//       if (this.selectedCount > 0 && !this.selectMode) {
//         this.selectMode = true;
//         this.selectModeSubject.next(true);
//         sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
//       }
//     });

//     this.selectModeSubject.next(this.selectMode);
//   }

//   private _makeContext(
//     qrid: string | null,
//     code: string | null,
//   ): string | null {
//     const q = (qrid ?? '').trim();
//     if (q.length > 0) return `QR:${q}`;

//     const c = (code ?? '').trim();
//     if (c.length > 0) return `INVITE:${c}`;

//     return null;
//   }

//   setSize(size: Size) {
//     this.selectedSize = size;
//   }

//   openImageModal(image: Image): void {
//     this.dialog.open(ImageModalComponent, {
//       data: { image },
//       width: window.innerWidth < 768 ? '90vw' : '600px',
//       backdropClass: 'custom-backdrop',
//     });
//   }

//   onSelectOrClear(): void {
//     // ✅ NO navigation happens here; any navigation you saw was from Checkout leak
//     if (!this.selectMode) {
//       this.selectMode = true;
//       this.selectModeSubject.next(true);
//       sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
//       return;
//     }

//     this.storeShopCart.dispatch(clearShopCart());

//     this.selectMode = false;
//     this.selectModeSubject.next(false);
//     sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
//   }

//   isInCart(pictureId: string): boolean {
//     return this.cartMap.has(pictureId);
//   }

//   cartSizeLabel(pictureId: string): string {
//     const item = this.cartMap.get(pictureId);
//     if (!item?.size) return '';
//     if (item.size === 'small') return 'Small';
//     if (item.size === 'full') return 'Full';
//     return 'Royalty';
//   }

//   openPreview(image: Image): void {
//     this.selectMode$.pipe(take(1)).subscribe((selecting) => {
//       if (!selecting) {
//         this.openImageModal(image);
//         return;
//       }

//       this.forSale$.pipe(take(1)).subscribe((isForSale) => {
//         if (isForSale) {
//           this.prices$.pipe(take(1)).subscribe((prices) => {
//             const nextPrice = this.resolvePrice(prices, this.selectedSize);

//             this.cartItems$.pipe(take(1)).subscribe((items) => {
//               const existing = items.find(
//                 (i) => i.image.pictureId === image.pictureId,
//               );

//               if (existing && existing.size === this.selectedSize) {
//                 this.storeShopCart.dispatch(
//                   removeImageFromCart({ pictureId: image.pictureId }),
//                 );
//                 return;
//               }

//               this.storeShopCart.dispatch(
//                 addImageToCart({
//                   cartItem: {
//                     image,
//                     size: this.selectedSize,
//                     price: nextPrice,
//                   },
//                 }),
//               );
//             });
//           });
//           return;
//         }

//         // FREE selection uses cart as basket
//         this.cartItems$.pipe(take(1)).subscribe((items) => {
//           const existing = items.find(
//             (i) => i.image.pictureId === image.pictureId,
//           );
//           if (existing) {
//             this.storeShopCart.dispatch(
//               removeImageFromCart({ pictureId: image.pictureId }),
//             );
//             return;
//           }
//           if ((items ?? []).length >= 5) {
//             console.warn('Free events: max 5 selections.');
//             return;
//           }

//           this.storeShopCart.dispatch(
//             addImageToCart({
//               cartItem: { image, size: null, price: 0 },
//             }),
//           );
//         });
//       });
//     });
//   }

//   private resolvePrice(
//     prices: {
//       priceSmall: number;
//       priceFull: number;
//       priceRoyalty: number;
//     } | null,
//     size: Size,
//   ): number {
//     if (!prices) return 0;
//     if (size === 'small') return prices.priceSmall ?? 0;
//     if (size === 'full') return prices.priceFull ?? 0;
//     return prices.priceRoyalty ?? 0;
//   }

//   downloadSelected(): void {
//     // NOTE: downloads are external URLs (zip/s3/cloudfront).
//     // Angular router must NOT be used for that.

//     if (this.inviteCode) {
//       const isLoggedIn = !!localStorage.getItem('access_token');
//       if (!isLoggedIn) {
//         const k = `event_free_download_used_${this.inviteCode}`;
//         const alreadyUsed = localStorage.getItem(k) === '1';
//         if (alreadyUsed) {
//           this.downloadLocked = true;
//           return;
//         }
//         localStorage.setItem(k, '1');
//       }
//     }

//     this.cartItems$.pipe(take(1)).subscribe((items) => {
//       const selectedPictureIds = (items ?? [])
//         .map((i) => i?.image?.pictureId)
//         .filter(
//           (x): x is string => typeof x === 'string' && x.trim().length > 0,
//         );

//       const hasSelection = selectedPictureIds.length > 0;

//       if (this.selectMode && !hasSelection) {
//         console.warn('downloadSelected(): selectMode ON but nothing selected.');
//         return;
//       }

//       const resolvedQr =
//         (this.qr && this.qr.trim().length > 0 ? this.qr.trim() : undefined) ||
//         (this.activeQrCode && this.activeQrCode.trim().length > 0
//           ? this.activeQrCode.trim()
//           : undefined);

//       if (!resolvedQr) {
//         console.warn('downloadSelected(): no resolved QR', {
//           qr: this.qr,
//           activeQrCode: this.activeQrCode,
//           inviteCode: this.inviteCode,
//         });
//         return;
//       }

//       const svc: any = this.pictureService as any;

//       if (
//         hasSelection &&
//         typeof svc.getPreviewZipUrlByQrCodeAndPictures === 'function'
//       ) {
//         svc
//           .getPreviewZipUrlByQrCodeAndPictures(resolvedQr, selectedPictureIds)
//           .pipe(take(1))
//           .subscribe({
//             next: (res: any) => {
//               if (res?.url) window.location.href = res.url; // ✅ download
//             },
//             error: (err: any) => console.error('downloadSelected():', err),
//           });
//         return;
//       }

//       this.pictureService
//         .getPreviewZipUrlByQrCode(resolvedQr)
//         .pipe(take(1))
//         .subscribe({
//           next: (res) => {
//             if (res?.url) window.location.href = res.url; // ✅ download
//           },
//           error: (err) => console.error('downloadSelected():', err),
//         });
//     });
//   }

//   goToCheckout(): void {
//     // ✅ never allow entering checkout with empty cart
//     this.cartItems$.pipe(take(1)).subscribe((items) => {
//       const count = (items ?? []).length;

//       if (count === 0) {
//         // Optional: automatically enter select mode to make UX obvious
//         if (!this.selectMode) {
//           this.selectMode = true;
//           this.selectModeSubject.next(true);
//           sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
//         }
//         return;
//       }

//       // ✅ Angular-safe: use router.url, not window.location
//       sessionStorage.setItem('returnUrl', this.router.url);
//       this.router.navigate(['/checkout']);
//     });
//   }

//   goToLogin(): void {
//     this.router.navigate(['/login'], {
//       queryParams: { returnUrl: this.router.url },
//     });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }
