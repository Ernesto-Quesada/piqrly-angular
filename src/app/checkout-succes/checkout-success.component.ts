import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// ✅ NEW: ngrx store + clear action
import { Store } from '@ngrx/store';
import { clearShopCart } from '../store/actions/shopcart.actions'; // <-- keep your path

import { CheckoutService } from './../services/checkout.service';
import { PictureService } from '../services/picture.service';

@Component({
  selector: 'checkout-success',
  standalone: true,
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
})
export class CheckoutSuccessComponent implements OnInit, OnDestroy {
  sessionId: string | null = null;

  loading = true;
  verifying = true;
  downloading = false;

  error: string | null = null;
  downloadUrl: string | null = null;
  downloadStarted = false;

  // ✅ Mobile browsers hate auto-download + popups (gesture required)
  private readonly isMobile = /iPhone|iPad|iPod|Android/i.test(
    navigator.userAgent
  );

  private verifyTimer: any = null;
  private zipTimer: any = null;

  private returnUrl = '/';

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private pictureService: PictureService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!this.sessionId) {
      this.loading = false;
      this.error = 'Missing session_id in URL.';
      return;
    }

    // ✅ where to go "back to photos"
    this.returnUrl = sessionStorage.getItem('returnUrl') || '/';

    // ✅ remove query params from history so refresh/back doesn’t re-run success logic
    history.replaceState({}, '', '/checkout-success');

    // ✅ IMPORTANT: trap phone back button so user doesn't land back on Stripe
    history.pushState({ fromSuccess: true }, '', window.location.href);
    window.addEventListener('popstate', this.onPopState);

    // ✅ 1) verify paid (poll because webhook may arrive a moment after redirect)
    const maxAttempts = 15; // ~30 seconds total
    const delayMs = 2000;

    let attempt = 0;

    const pollVerify = () => {
      attempt++;

      this.checkoutService.verifyWebCheckoutSession(this.sessionId!).subscribe({
        next: (res: any) => {
          if (res?.paid) {
            this.verifying = false;

            // ✅ 2) fetch paid zip url (and start download depending on device)
            this.fetchZipAndDownload();
            return;
          }

          if (attempt >= maxAttempts) {
            this.verifying = false;
            this.loading = false;
            this.error = 'Payment not completed yet.';
            return;
          }

          this.verifyTimer = setTimeout(pollVerify, delayMs);
        },
        error: () => {
          if (attempt >= maxAttempts) {
            this.verifying = false;
            this.loading = false;
            this.error = 'Could not verify checkout session.';
            return;
          }

          // retry transient errors
          this.verifyTimer = setTimeout(pollVerify, delayMs);
        },
      });
    };

    pollVerify();
  }

  ngOnDestroy(): void {
    if (this.verifyTimer) clearTimeout(this.verifyTimer);
    if (this.zipTimer) clearTimeout(this.zipTimer);
    window.removeEventListener('popstate', this.onPopState);
  }

  private onPopState = () => {
    // ✅ When user hits phone back, send them to photos instead of Stripe “done here”
    window.location.href = this.returnUrl;
  };

  // ✅ NEW: remove only the cart slice from the persisted appState
  private clearPersistedCart(): void {
    try {
      const raw = localStorage.getItem('appState');
      if (!raw) return;

      const parsed = JSON.parse(raw);
      delete parsed.shopCart; // keep landingData and anything else

      localStorage.setItem('appState', JSON.stringify(parsed));
    } catch {
      // if storage is corrupted, remove it so it can't restore stale cart
      localStorage.removeItem('appState');
    }
  }

  backToPhotos(): void {
    sessionStorage.removeItem('returnUrl');
    window.location.href = this.returnUrl;
  }

  fetchZipAndDownload(): void {
    if (!this.sessionId) return;

    const maxAttempts = 15; // ~30 seconds total
    const delayMs = 2000;

    let attempt = 0;

    const pollZip = () => {
      attempt++;

      this.downloading = true;

      this.pictureService.getPaidZipUrl(this.sessionId!).subscribe({
        next: (res) => {
          this.downloadUrl = res?.url || null;

          if (!this.downloadUrl) {
            this.downloading = false;
            this.loading = false;
            this.error = 'Paid download link was not returned.';
            return;
          }

          // ✅ Clear cart (NgRx) + clear persisted cart
          this.store.dispatch(clearShopCart());
          this.clearPersistedCart();

          this.downloading = false;
          this.loading = false;

          // ✅ DESKTOP: auto-start download is fine
          if (!this.isMobile) {
            this.downloadStarted = true;
            window.location.href = this.downloadUrl;
            return;
          }

          // ✅ MOBILE: do NOT auto-download.
          // Mobile browsers require a user gesture and show scary prompts.
          // User will tap "Download again" (which is a direct gesture).
          this.downloadStarted = false;
        },
        error: (err) => {
          // ✅ If zip not ready yet, backend may return 409 -> retry
          if (err?.status === 409 && attempt < maxAttempts) {
            this.zipTimer = setTimeout(pollZip, delayMs);
            return;
          }

          this.downloading = false;
          this.loading = false;
          this.error =
            'Could not load paid download link. Please refresh in a few seconds.';
        },
      });
    };

    pollZip();
  }

  downloadAgain(): void {
    if (!this.downloadUrl) {
      this.fetchZipAndDownload();
      return;
    }

    // ✅ On mobile, this click is the user gesture → best chance to avoid popup blockers
    this.downloadStarted = true;
    window.location.href = this.downloadUrl;
  }
}
