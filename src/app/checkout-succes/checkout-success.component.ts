import { CheckoutService } from './../services/checkout.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { PictureService } from '../services/picture.service';

@Component({
  selector: 'checkout-success',
  standalone: true,
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss'],
  imports: [CommonModule, MatCardModule],
})
export class CheckoutSuccessComponent implements OnInit {
  sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private pictureService: PictureService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    console.log('Session ID after chechout:', this.sessionId);

    if (this.sessionId) {
      this.checkoutService.verifyWebCheckoutSession(this.sessionId).subscribe({
        next: (res: any) => {
          console.log('Session verified:', res);

          if (res.paid && res.paymentIntentId) {
            // IMPORTANT: paid-pictures expects the PaymentIntent/session id you used in DB (paymentIntentId)
            this.pictureService
              .getPaidPictures(res.paymentIntentId)
              .subscribe((data: any) => {
                console.log('DATA', data);
              });
          }
        },
        error: (err) => {
          console.error('VERIFY ERROR', err);
        },
      });
    }
  }
}

// import { CheckoutService } from './../services/checkout.service';
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { MatCardModule } from '@angular/material/card';
// import { ActivatedRoute } from '@angular/router';
// import { PictureService } from '../services/picture.service';

// @Component({
//   selector: 'checkout-success',
//   standalone: true,
//   templateUrl: './checkout-success.component.html',
//   styleUrls: ['./checkout-success.component.scss'],
//   imports: [CommonModule, MatCardModule],
// })
// export class CheckoutSuccessComponent implements OnInit {
//   sessionId: string | null = null;

//   constructor(
//     private route: ActivatedRoute,
//     private checkoutService: CheckoutService,
//     private pictureService: PictureService
//   ) {}

//   ngOnInit(): void {
//     this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
//     console.log('Session ID after chechout:', this.sessionId);
//     // Optionally, call your backend to verify session details.
//     if (this.sessionId) {
//       this.checkoutService
//         .verifyCheckoutSession(this.sessionId)
//         .subscribe((res: any) => {
//           console.log('Session verified:', res);
//           if (res.paid && this.sessionId) {
//             this.pictureService
//               .getPaidPictures(this.sessionId)
//               .subscribe((data: any) => {
//                 console.log('DATA', data); // assuming backend returns pre-signed URLs
//               });
//           }
//         });
//     }
//   }
// }
