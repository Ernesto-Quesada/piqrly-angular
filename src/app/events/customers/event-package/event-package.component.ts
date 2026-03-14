// src/app/events/customer/event-packages/event-packages.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  PackageService,
  EventPackage,
} from '../../../services/package.service';
import { Image } from '../../../models/response';

@Component({
  selector: 'app-event-packages',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './event-package.component.html',
  styleUrl: './event-package.component.scss',
})
export class EventPackagesComponent implements OnInit {
  @Input() inviteCode!: string; // event QR code
  @Input() images: Image[] = []; // all event photos passed from viewpic
  @Input() customerEmail = '';
  @Input() customerName = '';

  packages: EventPackage[] = [];
  selectedPackage: EventPackage | null = null;
  selectedIds = new Set<string>();

  loading = false;
  paying = false;
  loadError = '';

  constructor(
    private packageService: PackageService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (this.inviteCode) {
      this.loadPackages();
    }
  }

  loadPackages(): void {
    this.loading = true;
    this.packageService.getPackagesForEvent(this.inviteCode).subscribe({
      next: (pkgs) => {
        this.packages = pkgs ?? [];
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Could not load packages.';
        this.loading = false;
      },
    });
  }

  selectPackage(pkg: EventPackage): void {
    this.selectedPackage = pkg;
    this.selectedIds.clear();
  }

  backToPackageList(): void {
    this.selectedPackage = null;
    this.selectedIds.clear();
  }

  isSelected(pictureId: string): boolean {
    return this.selectedIds.has(pictureId);
  }

  get atLimit(): boolean {
    return (
      !!this.selectedPackage &&
      this.selectedIds.size >= this.selectedPackage.quantity
    );
  }

  get remaining(): number {
    if (!this.selectedPackage) return 0;
    return this.selectedPackage.quantity - this.selectedIds.size;
  }

  togglePhoto(pictureId: string): void {
    if (!this.selectedPackage) return;

    if (this.selectedIds.has(pictureId)) {
      this.selectedIds.delete(pictureId);
      return;
    }

    if (this.atLimit) {
      this.snackBar.open(
        `You can only select ${this.selectedPackage.quantity} photos for this package.`,
        'OK',
        { duration: 3000 },
      );
      return;
    }

    this.selectedIds.add(pictureId);
  }

  checkout(): void {
    if (!this.selectedPackage || this.selectedIds.size === 0) return;

    if (!this.customerEmail) {
      this.snackBar.open('Please provide your email to continue.', 'OK', {
        duration: 3000,
      });
      return;
    }

    this.paying = true;
    const pictureIds = Array.from(this.selectedIds);

    this.packageService
      .checkout(
        this.selectedPackage.id,
        this.customerEmail,
        this.customerName,
        this.inviteCode,
        pictureIds,
      )
      .subscribe({
        next: (data) => {
          window.location.href = data.url;
        },
        error: (err) => {
          this.paying = false;
          const msg = err?.error?.error ?? 'Checkout failed. Try again.';
          this.snackBar.open(msg, 'OK', { duration: 4000 });
        },
      });
  }
}
