import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'checkout-success',
  standalone: true,
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss'],
  imports: [CommonModule, MatCardModule],
})
export class CheckoutSuccessComponent implements OnInit {
  sessionId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');
    // Optionally, call your backend to verify session details.
    if (this.sessionId) {
      // this.http
      //   .post('/verify-session', { sessionId: this.sessionId })
      //   .subscribe((res: any) => {
      //     if (res.paid) {
      //       // Optional: Display customer info from res
      //       // Now fetch the actual pictures allowed for download
      //       this.http
      //         .get(`/api/paid-pictures/${this.sessionId}`)
      //         .subscribe((data: any) => {
      //           this.paidImages = data.pictureUrls; // assuming backend returns pre-signed URLs
      //         });
      //     }
      //   });
    }
  }
}
