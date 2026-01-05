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
  loading = true;
  error: string | null = null;

  paidPictures: { pictureId: string; getUrl: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private pictureService: PictureService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    console.log('Session ID after checkout:', this.sessionId);

    if (!this.sessionId) {
      this.loading = false;
      this.error = 'Missing session_id in URL.';
      return;
    }

    // ✅ 1) Verify (optional, but good for UI messaging)
    this.checkoutService.verifyWebCheckoutSession(this.sessionId).subscribe({
      next: (res: any) => {
        console.log('Session verified:', res);

        if (!res?.paid) {
          this.loading = false;
          this.error = 'Payment not completed yet.';
          return;
        }

        // ✅ 2) Fetch paid pictures using the Checkout Session ID (cs_...)
        // Backend will “sync” PaidPictureAccess if needed (see BE fix below).
        this.pictureService.getPaidPictures(this.sessionId!).subscribe({
          next: (data: any) => {
            this.paidPictures = Array.isArray(data) ? data : [];
            this.loading = false;
          },
          error: (err) => {
            console.error('PAID PICTURES ERROR', err);
            this.loading = false;
            this.error =
              'Could not load purchased pictures. Please refresh in a few seconds.';
          },
        });
      },
      error: (err) => {
        console.error('VERIFY ERROR', err);
        this.loading = false;
        this.error = 'Could not verify checkout session.';
      },
    });
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
//     // Stripe Checkout sends: ?session_id=cs_test_...
//     this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
//     console.log('Session ID after chechout:', this.sessionId);

//     if (!this.sessionId) return;

//     this.checkoutService.verifyWebCheckoutSession(this.sessionId).subscribe({
//       next: (res: any) => {
//         console.log('Session verified:', res);

//         // ✅ Your BE paid-pictures endpoint expects the Checkout Session ID (cs_...)
//         if (res.paid) {
//           this.pictureService.getPaidPictures(this.sessionId!).subscribe({
//             next: (data: any) => {
//               console.log('DATA', data);
//             },
//             error: (err) => {
//               console.error('PAID PICTURES ERROR', err);
//             },
//           });
//         }
//       },
//       error: (err) => {
//         console.error('VERIFY ERROR', err);
//       },
//     });
//   }
// }
