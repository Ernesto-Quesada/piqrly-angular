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
  }
}
