import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { AddToCartComponent } from '../add-to-cart/add-to-cart.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';
// import images from './../+ahelper.json/images'; // Assuming you have a JSON file with image data
import { QrPicture, QrViewResponse } from '../models/qr-read-response';
import { select, Store } from '@ngrx/store';
import { ShopCart } from '../models/shopCart';
import {
  //imageAddedinThumbnailStrip,
  // landingDataLoad,
  //loadPicturePriceSuccess,
  removeImageFromCart,
} from '../store/actions/shopcart.actions';
import { map, Observable, of, pipe, take } from 'rxjs';
import { selectItems } from '../store/selectors/shopcart.selector';
import { landingDataLoad } from '../store/actions/landingData.actions';
import { selectLandingPictures } from '../store/selectors/landingData.selector';

export interface Picture {
  id: number;
  imageUrl: string;
  qrCode: string;
}

@Component({
  selector: 'app-viewpic',
  standalone: true,
  imports: [MatGridListModule, CommonModule, AddToCartComponent],
  templateUrl: './viewpic.component.html',
  styleUrl: './viewpic.component.scss',
})
export class ViewpicComponent implements OnInit {
  userId!: string;
  qr!: string;
  pictures!: Picture[];
  // images = images; // Use the imported images array, or replace with your service call to fetch images
  isForSale: boolean = false;
  isDesktop: boolean = false;
  cartItems$: Observable<
    {
      image: QrPicture;
      size: 'small' | 'full' | 'royalty' | null;
      price: number;
    }[]
  >;
  images$: Observable<QrPicture[]> = of([]);
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private storeShopCart: Store<{ shopcart: ShopCart }>,
    private storeLanding: Store<{ landingData: QrViewResponse }>
  ) {
    this.cartItems$ = this.storeShopCart.pipe(select(selectItems));

    // this.store.dispatch(imageAddedinThumbnailStrip({ image: this.images[0] }));
  }

  currentIndex = 0;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      //this.userId = params.get('userId')!;
      this.qr = params.get('qrid')!;
      console.log('QR Code:', this.qr);
      this.storeLanding.dispatch(landingDataLoad({ qr: this.qr }));
      // Here you can check if userId and someQRId exist (e.g., via a service call)

      // this.pictureService.getPicturesByQrCode( this.qrId).subscribe(data => {
      //   console.log(data);
      //   this.pictures = data;
      // });
    });
    this.images$ = this.storeLanding.select(selectLandingPictures);
    this.isDesktop = window.innerWidth > 768;
  }
  // selectImage(image: string) {
  //   this.selectedImage = image;
  // }
  toggleSelection(image: QrPicture): void {
    // TODO : add image to thumbnail strip
    //  this.store.dispatch(imageAddedinThumbnailStrip({image}));
    // const index = this.selectedImages.indexOf(image);
    // if (index > -1) {
    //   // Remove from selection if already selected
    //   this.selectedImages.splice(index, 1);
    // } else {
    //   if (this.selectedImages.length < 6) {
    //     this.selectedImages.push(image);
    //   } else {
    //     alert('You can select a maximum of 6 images.');
    //   }
    // }
  }
  isSelected(pictureId: string): Observable<boolean> {
    return this.cartItems$.pipe(
      take(1),
      map((cartItems) =>
        cartItems.some((item) => item.image.pictureId === pictureId)
      )
    );
  }
  openImageModal(image: QrPicture): void {
    this.dialog.open(ImageModalComponent, {
      data: { image },
      width: window.innerWidth < 768 ? '90vw' : '600px',
      backdropClass: 'custom-backdrop',
    });
  }
  onThumbnailClick(image: QrPicture, index: number): void {
    this.cartItems$.pipe(take(1)).subscribe((cartItems) => {
      const exist = cartItems.some(
        (item) => item.image.pictureId === image.pictureId
      );
      if (exist) {
        this.storeShopCart.dispatch(
          removeImageFromCart({ pictureId: image.pictureId })
        );
      }
    });
  }
}
