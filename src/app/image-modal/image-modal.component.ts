import {
  Component,
  Inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { select, Store } from '@ngrx/store';
import { addImageToCart } from '../store/actions/shopcart.actions';
import { ShopCart } from './../models/shopCart';
import { MatButtonModule } from '@angular/material/button';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';

import { Price, Image } from '../models/response';

@Component({
  selector: 'image-modal',
  imports: [MatCardModule, MatIconModule, MatButtonModule, CommonModule],
  standalone: true,
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.scss',
})
export class ImageModalComponent implements AfterViewInit {
  selectedSize: 'small' | 'full' | 'royalty' | null = null;

  // ✅ now modal gets everything from caller (event page OR viewpics page)
  images: Image[] = [];
  startIndex = 0;

  priceData: Price | null = null;
  forSale = false;

  @ViewChild('strip', { static: false }) stripRef?: ElementRef<HTMLDivElement>;

  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      image?: Image; // keep backward compatibility
      images?: Image[];
      startIndex?: number;
      forSale?: boolean;
      prices?: Price | null;
    },
    private store: Store<{ shopcart: ShopCart }>,
  ) {
    // ✅ prefer new data format
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
  }

  ngAfterViewInit(): void {
    // scroll to the tapped image
    setTimeout(() => {
      this.scrollToIndex(this.startIndex);
    }, 0);
  }

  closeModal(): void {
    this.dialogRef.close();
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
    const idx = this.getCenteredIndex();
    return this.images[idx] ?? null;
  }

  // ✅ detect which image is currently centered (based on scrollLeft)
  private getCenteredIndex(): number {
    const el = this.stripRef?.nativeElement;
    if (!el) return this.startIndex;
    const w = el.clientWidth;
    if (!w) return this.startIndex;
    return Math.round(el.scrollLeft / w);
  }

  private scrollToIndex(index: number): void {
    const el = this.stripRef?.nativeElement;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: w * index, behavior: 'instant' as any });
  }
}
