import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { select, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  Subject,
  distinctUntilChanged,
  take,
  takeUntil,
} from 'rxjs';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { GalleryService, GalleryMeta } from '../services/gallery.service';

import { ShopCart } from '../models/shopCart';
import { selectItems } from '../store/selectors/shopcart.selector';
import {
  addImageToCart,
  clearShopCart,
  removeImageFromCart,
} from '../store/actions/shopcart.actions';

import { Image, ImageOwner } from '../models/response';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// ✅ Same modal used in ViewPic
import { ImageModalComponent } from '../image-modal/image-modal.component';

type Size = 'small' | 'full' | 'royalty';

@Component({
  selector: 'app-view-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './viewgallery.component.html',
  styleUrls: ['./viewgallery.component.scss'],
})
export class ViewGalleryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private galleryService = inject(GalleryService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private storeShopCart = inject<Store<{ shopCart: ShopCart }>>(Store);

  // -------------------------
  // Gallery meta + lock state
  // -------------------------
  galleryId = signal<string>('');
  meta = signal<GalleryMeta | null>(null);

  pin = signal<string>('');
  isLoading = signal<boolean>(true);
  isUnlocking = signal<boolean>(false);

  pageErrorMsg = signal<string>('');
  pinErrorMsg = signal<string>('');

  unlocked = signal<boolean>(false);

  locked = computed(() => (this.meta()?.locked ?? true) && !this.unlocked());
  expiresAt = computed(() => this.meta()?.expiresAt ?? '');
  purchased = computed(() => this.meta()?.purchased === true);

  // -------------------------
  // Payload after unlock
  // -------------------------
  owner = signal<ImageOwner | null>(null);

  prices = signal<{
    priceSmall: number;
    priceFull: number;
    priceRoyalty: number;
  } | null>(null);

  pictures = signal<Image[]>([]);
  forSale = signal<boolean>(true);

  // -------------------------
  // Cart / selection (NgRx)
  // -------------------------
  cartItems$ = this.storeShopCart.pipe(select(selectItems));

  private selectModeSubject = new BehaviorSubject<boolean>(false);
  selectMode$ = this.selectModeSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  selectMode = false;
  selectedCount = 0;
  selectedTotal = 0;

  selectedSize: Size = 'small';
  private cartMap = new Map<string, { size: Size | null; price: number }>();

  // Per-picture selected size memory (for chip highlighting)
  private selectedSizes = new Map<string, Size>();

  // ✅ Track which tile's price drawer is open (pictureId or null)
  expandedPriceId = signal<string | null>(null);

  private readonly CONTEXT_KEY = 'viewgallery_context';
  private readonly SELECT_MODE_KEY = 'viewgallery_select_mode';

  ngOnInit(): void {
    const id = (this.route.snapshot.paramMap.get('galleryId') ?? '').trim();
    this.galleryId.set(id);

    if (!id) {
      this.isLoading.set(false);
      this.pageErrorMsg.set('Missing gallery id.');
      return;
    }

    const savedSelectMode = sessionStorage.getItem(this.SELECT_MODE_KEY);
    if (savedSelectMode === '1') {
      this.selectMode = true;
      this.selectModeSubject.next(true);
    }

    const nextContext = `GALLERY:${id}`;
    const prevContext = sessionStorage.getItem(this.CONTEXT_KEY);
    const contextChanged = !!prevContext && prevContext !== nextContext;

    if (contextChanged) {
      this.storeShopCart.dispatch(clearShopCart());
      this.selectMode = false;
      this.selectModeSubject.next(false);
      sessionStorage.setItem(this.SELECT_MODE_KEY, '0');
      this.selectedSizes.clear();
    }
    sessionStorage.setItem(this.CONTEXT_KEY, nextContext);

    this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.cartMap.clear();
      this.selectedSizes.clear();

      let runningTotal = 0;

      for (const it of items ?? []) {
        const priceNum = Number((it as any)?.price) || 0;

        this.cartMap.set(it.image.pictureId, {
          size: (it.size as any) ?? null,
          price: priceNum,
        });

        const s = ((it as any)?.size as Size | null) ?? null;
        if (s) this.selectedSizes.set(it.image.pictureId, s);

        runningTotal += priceNum;
      }

      this.selectedCount = (items ?? []).length;
      this.selectedTotal = runningTotal;

      sessionStorage.setItem(
        'gallery_checkout_total',
        String(this.selectedTotal),
      );

      if (this.selectedCount > 0 && !this.selectMode) {
        this.selectMode = true;
        this.selectModeSubject.next(true);
        sessionStorage.setItem(this.SELECT_MODE_KEY, '1');
      }
    });

    this.selectModeSubject.next(this.selectMode);
    this.loadMeta();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMeta() {
    this.isLoading.set(true);
    this.pageErrorMsg.set('');

    const id = this.galleryId();

    this.galleryService
      .getMeta(id)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.meta.set(data ?? null);
          this.isLoading.set(false);

          if (data?.locked === false) {
            this.unlocked.set(true);
            return;
          }

          // ✅ Auto-replay unlock if we have a stored PIN for this gallery
          const storedPin = sessionStorage.getItem(
            `gallery_pin_${this.galleryId()}`,
          );
          if (storedPin) {
            this.pin.set(storedPin);
            this.submitPin(); // silently re-unlocks and loads pictures
          }
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.pageErrorMsg.set(
            this._errToMessage(err, 'Could not load gallery.'),
          );
        },
      });
  }

  trackByPic = (_: number, img: any) => img?.pictureId ?? img?.id ?? _;

  // -------------------------
  // PIN UNLOCK
  // -------------------------
  submitPin() {
    this.pinErrorMsg.set('');
    this.pageErrorMsg.set('');

    const pin = (this.pin() ?? '').trim();

    if (!/^\d{4,6}$/.test(pin)) {
      this.pinErrorMsg.set('PIN must be 4–6 digits.');
      return;
    }

    this.isUnlocking.set(true);
    const id = this.galleryId();
    this.galleryService
      .unlock(id, pin)
      .pipe(take(1))
      .subscribe({
        next: (data: any) => {
          this.isUnlocking.set(false);
          this.unlocked.set(true);
          this.pinErrorMsg.set('');
          sessionStorage.setItem(`gallery_unlocked_${id}`, '1');
          sessionStorage.setItem(`gallery_pin_${id}`, pin);

          const pics = Array.isArray(data?.pictures)
            ? (data.pictures as Image[])
            : [];
          this.pictures.set(pics);

          this.owner.set((data?.owner as ImageOwner) ?? null);
          this.forSale.set(true);

          const rep = this._representativePricesFromPictures(pics);
          this.prices.set(rep);

          console.log('🔓 GALLERY UNLOCK PAYLOAD:', data);
          console.log('🖼️ PICTURES COUNT:', pics.length);
          console.log('💰 REPRESENTATIVE PRICES (UI pills only):', rep);
        },
        error: (err: any) => {
          this.isUnlocking.set(false);

          const s = Number(err?.status);

          if (s === 400 || s === 401 || s === 403) {
            this.pinErrorMsg.set('Wrong PIN. Try again.');
            return;
          }

          this.pageErrorMsg.set(
            this._errToMessage(err, 'Could not unlock gallery.'),
          );
        },
      });
  }

  // -------------------------
  // Select / cart behavior
  // -------------------------
  setSize(size: Size) {
    this.selectedSize = size;
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
    this.selectedSizes.clear();
    this.expandedPriceId.set(null);
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

  selectedSizeFor(pictureId: string): Size | null {
    return this.selectedSizes.get(pictureId) ?? null;
  }

  // -------------------------
  // ✅ Tile tap logic
  // -------------------------

  /**
   * Called when user taps the image tile (not a chip).
   * - If NOT in select mode → open full gallery modal (same as ViewPic)
   * - If in select mode AND already has a size selected → toggle cart
   * - If in select mode AND no size yet → expand/collapse the price drawer
   */
  onTileTap(img: Image, index: number): void {
    if (!this.selectMode) {
      // ✅ Open full gallery view (same as ViewPic openImageModal)
      this.openImageModal(img, index);
      return;
    }

    const remembered = this.selectedSizes.get(img.pictureId);

    if (remembered) {
      // Already has a size — toggle in/out of cart
      this.selectedSize = remembered;
      this.toggleCartForImage(img);
      return;
    }

    // No size chosen yet — toggle the price drawer open/closed
    const current = this.expandedPriceId();
    this.expandedPriceId.set(current === img.pictureId ? null : img.pictureId);
  }

  /**
   * ✅ Price chip click: pick size, add to cart, close drawer
   */
  onChipPick(ev: MouseEvent, img: Image, size: Size): void {
    ev.stopPropagation();
    if (!this.selectMode) return;

    this.selectedSizes.set(img.pictureId, size);
    this.selectedSize = size;

    // Close the drawer after selection
    this.expandedPriceId.set(null);

    this.toggleCartForImage(img);
  }

  /**
   * ✅ Opens full-size gallery modal (same as ViewPic)
   */
  openImageModal(image: Image, startIndex: number): void {
    const images = this.pictures();
    this.dialog.open(ImageModalComponent, {
      data: { images, startIndex, image },
      backdropClass: 'custom-backdrop',
      panelClass: 'image-modal-fullscreen',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
  }

  private resolvePriceForImage(img: Image, size: Size): number {
    const p: any = (img as any)?.price;
    if (!p) return 0;
    if (size === 'small') return Number(p.priceSmall) || 0;
    if (size === 'full') return Number(p.priceFull) || 0;
    return Number(p.priceRoyalty) || 0;
  }

  toggleCartForImage(img: Image): void {
    this.selectMode$.pipe(take(1)).subscribe((selecting) => {
      if (!selecting) {
        this.openImage(img.imageUrl || img.previewImageUrl);
        return;
      }

      const nextPrice = this.resolvePriceForImage(img, this.selectedSize);

      if (!nextPrice || nextPrice <= 0) {
        this.snackBar.open(
          'Price missing for this photo. Contact the creator.',
          'OK',
          { duration: 2500 },
        );
        console.warn('❌ Price resolved to 0 for image', {
          selectedSize: this.selectedSize,
          img,
        });
        return;
      }

      this.cartItems$.pipe(take(1)).subscribe((items) => {
        const existing = (items ?? []).find(
          (i) => i.image.pictureId === img.pictureId,
        );

        console.log('➕ DISPATCHING addImageToCart:', {
          pictureId: img.pictureId,
          size: this.selectedSize,
          price: nextPrice,
        });

        if (existing && existing.size === this.selectedSize) {
          this.storeShopCart.dispatch(
            removeImageFromCart({ pictureId: img.pictureId }),
          );
          this.selectedSizes.delete(img.pictureId);
          return;
        }

        if (existing && existing.size !== this.selectedSize) {
          this.storeShopCart.dispatch(
            removeImageFromCart({ pictureId: img.pictureId }),
          );
        }

        this.selectedSizes.set(img.pictureId, this.selectedSize);

        this.storeShopCart.dispatch(
          addImageToCart({
            cartItem: { image: img, size: this.selectedSize, price: nextPrice },
          }),
        );
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

      const total = (items ?? []).reduce((sum: number, it: any) => {
        return sum + (Number(it?.price) || 0);
      }, 0);

      sessionStorage.setItem('gallery_checkout_total', String(total));
      console.log('🧾 GALLERY CHECKOUT TOTAL (computed):', total);

      sessionStorage.setItem('returnUrl', this.router.url);
      this.router.navigate(['/checkout']);
    });
  }

  // -------------------------
  // Helpers
  // -------------------------
  openImage(url?: string) {
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  }

  private _representativePricesFromPictures(pics: Image[]): {
    priceSmall: number;
    priceFull: number;
    priceRoyalty: number;
  } | null {
    if (!pics || pics.length === 0) return null;

    const nums = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    let minSmall: number | null = null;
    let minFull: number | null = null;
    let minRoyalty: number | null = null;

    for (const img of pics) {
      const p: any = (img as any)?.price;
      if (!p) continue;

      const s = nums(p.priceSmall);
      const f = nums(p.priceFull);
      const r = nums(p.priceRoyalty);

      if (s > 0) minSmall = minSmall === null ? s : Math.min(minSmall, s);
      if (f > 0) minFull = minFull === null ? f : Math.min(minFull, f);
      if (r > 0) minRoyalty = minRoyalty === null ? r : Math.min(minRoyalty, r);
    }

    return {
      priceSmall: minSmall ?? 0,
      priceFull: minFull ?? 0,
      priceRoyalty: minRoyalty ?? 0,
    };
  }

  private _errToMessage(err: any, fallback: string) {
    const body: any = err?.error;
    if (typeof body === 'string' && body.trim().length > 0) return body;
    if (body && typeof body === 'object') {
      if (body.message) return String(body.message);
      if (body.error && err.status) return `${body.error} (${err.status})`;
    }
    if (err?.message) return err.message;
    return fallback;
  }
}
