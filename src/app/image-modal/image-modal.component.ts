import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { select, Store } from '@ngrx/store';
import { addImageToCart } from '../store/actions/shopcart.actions';
import { ShopCart } from './../models/shopCart';
import { Image } from '../models/image';
import { MatButtonModule } from '@angular/material/button';
import { selectPrices } from '../store/selectors/landingData.selector';
import { take } from 'rxjs';
import { QrPicture, QrPrice } from '../models/qr-read-response';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'image-modal',
  imports: [MatCardModule, MatIconModule, MatButtonModule, CommonModule],
  standalone: true,
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.scss',
})
export class ImageModalComponent {
  selectedSize: 'small' | 'full' | 'royalty' | null = null;
  priceData: QrPrice | null = null;
  forSale: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: QrPicture },
    private store: Store<{ shopcart: ShopCart }>
  ) {
    this.store.pipe(select(selectPrices), take(1)).subscribe((priceState) => {
      if (priceState) {
        this.forSale = true;
        this.priceData = priceState;
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  chooseSizeAndAdd(size: 'small' | 'full' | 'royalty'): void {
    if (!this.priceData) return;

    let price = 0;
    if (size === 'small') price = this.priceData.priceSmall;
    else if (size === 'full') price = this.priceData.priceFull;
    else if (size === 'royalty') price = this.priceData.priceRoyalty;

    this.store.dispatch(
      addImageToCart({ cartItem: { image: this.data.image, size, price } })
    );
    this.dialogRef.close({ addedToCart: true, image: this.data.image });
  }
}
