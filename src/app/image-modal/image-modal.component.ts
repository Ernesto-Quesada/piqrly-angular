import {
  Component,
  Inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { addImageToCart } from '../store/actions/shopcart.actions';
import { ShopCart } from './../models/shopCart';
import { CommonModule } from '@angular/common';
import { Price, Image } from '../models/response';

@Component({
  selector: 'image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.scss',
})
export class ImageModalComponent implements AfterViewInit {
  selectedSize: 'small' | 'full' | 'royalty' | null = null;

  images: Image[] = [];
  startIndex = 0;

  priceData: Price | null = null;
  forSale = false;

  currentIndex = 0;

  @ViewChild('strip', { static: false }) stripRef?: ElementRef<HTMLDivElement>;

  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      image?: Image; // backward compatibility
      images?: Image[];
      startIndex?: number;
      forSale?: boolean;
      prices?: Price | null;
    },
    private store: Store<{ shopcart: ShopCart }>,
  ) {
    this.images =
      data.images && data.images.length
        ? data.images
        : data.image
          ? [data.image]
          : [];

    this.startIndex = Math.max(
      0,
      Math.min(data.startIndex ?? 0, this.images.length - 1),
    );

    this.forSale = !!data.forSale;
    this.priceData = data.prices ?? null;

    this.currentIndex = this.startIndex;
  }

  ngAfterViewInit(): void {
    // jump to tapped image
    setTimeout(() => {
      this.scrollToIndex(this.startIndex, 'auto');
      this.currentIndex = this.startIndex;
    }, 0);
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onStripScroll(): void {
    this.currentIndex = this.getCenteredIndex();
  }

  goTo(index: number): void {
    const next = this.clampIndex(index);
    this.currentIndex = next;
    this.scrollToIndex(next, 'smooth');
  }

  chooseSizeAndAdd(size: 'small' | 'full' | 'royalty'): void {
    if (!this.priceData) return;

    const current = this.getCurrentImage();
    if (!current) return;

    let price = 0;
    if (size === 'small') price = this.priceData.priceSmall;
    else if (size === 'full') price = this.priceData.priceFull;
    else if (size === 'royalty') price = this.priceData.priceRoyalty;

    this.store.dispatch(
      addImageToCart({ cartItem: { image: current, size, price } }),
    );

    this.dialogRef.close({ addedToCart: true, image: current });
  }

  private getCurrentImage(): Image | null {
    return this.images[this.currentIndex] ?? null;
  }

  private getStripWidth(): number {
    const el = this.stripRef?.nativeElement;
    if (!el) return 1;
    return el.getBoundingClientRect().width || el.clientWidth || 1;
  }

  private getCenteredIndex(): number {
    const el = this.stripRef?.nativeElement;
    if (!el) return this.currentIndex;

    const w = this.getStripWidth();
    const idx = Math.round(el.scrollLeft / w);
    return this.clampIndex(idx);
  }

  private scrollToIndex(
    index: number,
    behavior: ScrollBehavior = 'auto',
  ): void {
    const el = this.stripRef?.nativeElement;
    if (!el) return;

    const w = this.getStripWidth();
    const idx = this.clampIndex(index);

    el.scrollTo({ left: w * idx, behavior });
  }

  private clampIndex(i: number): number {
    return Math.max(0, Math.min(i, this.images.length - 1));
  }
}
