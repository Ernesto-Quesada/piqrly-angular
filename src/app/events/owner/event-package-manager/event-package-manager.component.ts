// src/app/my-events/event-packages-manager/event-packages-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  EventManagementService,
  MyEvent,
} from '../../../services/event-management.service';
import {
  EventPackage,
  PackageService,
} from '../../../services/package.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-event-packages-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './event-package-manager.component.html',
  styleUrl: './event-package-manager.component.scss',
})
export class EventPackagesManagerComponent implements OnInit {
  event: MyEvent | null = null;
  packages: EventPackage[] = [];
  packageForm!: FormGroup;

  loading = false;
  pkgLoading = false;
  pkgSaving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventManagementService,
    private packageService: PackageService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isPremium()) {
      this.snackBar.open(
        'Package management requires a premium subscription.',
        'OK',
        { duration: 4000 },
      );
      this.router.navigate(['/my-events']);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.buildPackageForm();
    this.loadEvent(id);
  }

  private buildPackageForm(): void {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [
        5,
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
      price: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  private loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getMyEvents().subscribe({
      next: (events) => {
        this.event = events.find((e) => e.id === id) ?? null;
        this.loading = false;
        if (this.event) {
          this.loadPackages(this.event.eventQrCode);
        } else {
          this.router.navigate(['/my-events']);
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/my-events']);
      },
    });
  }

  loadPackages(qrCode: string): void {
    this.pkgLoading = true;
    this.packageService.getPackagesForEvent(qrCode).subscribe({
      next: (pkgs) => {
        this.packages = pkgs ?? [];
        this.pkgLoading = false;
      },
      error: () => {
        this.pkgLoading = false;
      },
    });
  }

  savePackage(): void {
    if (this.packageForm.invalid || !this.event) return;
    if (this.packages.length >= 3) {
      this.snackBar.open('Maximum 3 packages per event.', 'OK', {
        duration: 3000,
      });
      return;
    }
    this.pkgSaving = true;
    const { name, quantity, price } = this.packageForm.value;

    this.packageService
      .createPackage(this.event.id, name, quantity, price)
      .subscribe({
        next: () => {
          this.pkgSaving = false;
          this.packageForm.reset({ name: '', quantity: 5, price: null });
          this.snackBar.open('Package created!', 'OK', { duration: 3000 });
          this.loadPackages(this.event!.eventQrCode);
        },
        error: (err) => {
          this.pkgSaving = false;
          this.snackBar.open(
            err?.error?.error ?? 'Error creating package.',
            'OK',
            { duration: 3000 },
          );
        },
      });
  }

  deletePackage(pkg: EventPackage): void {
    if (!confirm(`Delete package "${pkg.name}"?`)) return;
    this.packageService.deletePackage(pkg.id).subscribe({
      next: () => {
        this.snackBar.open('Package deleted.', 'OK', { duration: 3000 });
        this.loadPackages(this.event!.eventQrCode);
      },
      error: () =>
        this.snackBar.open('Error deleting package.', 'OK', { duration: 3000 }),
    });
  }

  back(): void {
    this.router.navigate(['/my-events']);
  }
}
