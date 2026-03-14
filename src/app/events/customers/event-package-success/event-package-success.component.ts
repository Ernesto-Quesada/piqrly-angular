// src/app/event-package-success/event-package-success.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { take } from 'rxjs';

import {
  PackageService,
  PackagePurchaseStatus,
} from '../../../services/package.service';
import { PictureService } from '../../../services/picture.service';

@Component({
  selector: 'app-event-package-success',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './event-package-success.component.html',
  styleUrl: './event-package-success.component.scss',
})
export class EventPackageSuccessComponent implements OnInit {
  sessionId = '';
  inviteCode = '';

  status: PackagePurchaseStatus | null = null;
  loading = true;
  downloading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    private pictureService: PictureService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      this.sessionId = params['session_id'] ?? '';
      this.inviteCode = params['code'] ?? '';

      if (!this.sessionId) {
        this.error = 'Invalid session.';
        this.loading = false;
        return;
      }

      this.loadStatus();
    });
  }

  loadStatus(): void {
    this.packageService.getPurchaseStatus(this.sessionId).subscribe({
      next: (s) => {
        this.status = s;
        this.loading = false;

        // Auto-trigger download if paid
        if (s.paid && s.selectedPictureIds.length > 0) {
          this.download();
        }
      },
      error: () => {
        // Webhook may not have fired yet — retry once after 2s
        setTimeout(() => this.retryStatus(), 2000);
      },
    });
  }

  retryStatus(): void {
    this.packageService.getPurchaseStatus(this.sessionId).subscribe({
      next: (s) => {
        this.status = s;
        this.loading = false;
        if (s.paid && s.selectedPictureIds.length > 0) {
          this.download();
        }
      },
      error: () => {
        this.error = 'Could not confirm payment. Please contact support.';
        this.loading = false;
      },
    });
  }

  download(): void {
    if (!this.status || this.downloading) return;

    this.downloading = true;

    this.pictureService
      .getPreviewZipUrlByQrCodeAndPictures(
        this.status.eventQrCode,
        this.status.selectedPictureIds,
      )
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.downloading = false;
          if (res?.url) {
            const a = document.createElement('a');
            a.href = res.url;
            a.rel = 'noopener';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            this.snackBar.open('Download started!', 'OK', { duration: 3000 });
          }
        },
        error: () => {
          this.downloading = false;
          this.snackBar.open('Download failed. Try again.', 'Retry', {
            duration: 5000,
          });
        },
      });
  }

  goBackToEvent(): void {
    this.router.navigate(['/events/invite', this.inviteCode]);
  }
}
