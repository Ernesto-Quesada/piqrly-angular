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

@Component({
  selector: 'image-modal',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  standalone: true,
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.scss',
})
export class ImageModalComponent {
  selectedSize: 'small' | 'full' | null = null;
  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: Image },
    private store: Store<{ shopcart: ShopCart }>
  ) {}
  // getPrice(): number {
  //   const prices = { small: 5, full: 10 }; // You can get this from the store instead if needed
  //   return this.selectedSize ? prices[this.selectedSize] : 0;
  // }

  closeModal(): void {
    this.dialogRef.close();
  }

  chooseSizeAndAdd(size: 'small' | 'full'): void {
    // Retrieve the global prices from the store
    this.store.pipe(select(selectPrices), take(1)).subscribe((prices) => {
      if (!prices) return;
      const price = size === 'small' ? prices.small : prices.full;
      console.log('price', price);
      // Dispatch the new action with the image, size, and associated price:
      this.store.dispatch(
        addImageToCart({ cartItem: { image: this.data.image, size, price } })
      );
      this.dialogRef.close({ addedToCart: true, image: this.data.image });
    });
  }
}
