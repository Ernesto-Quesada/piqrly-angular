// src/app/my-events/my-events.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  EventManagementService,
  MyEvent,
} from '../../../services/event-management.service';
import { AuthService } from '../../../services/auth.service';
import { PrintQrDialogComponent } from '../print-qr-dialog/print-qr-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss',
})
export class MyEventsComponent implements OnInit {
  events: MyEvent[] = [];
  loading = false;
  deleting = false;
  isPremium = false;

  constructor(
    private eventService: EventManagementService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.isPremium = this.authService.isPremium();
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getMyEvents().subscribe({
      next: (evts) => {
        this.events = evts ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.router.navigate(['/my-events/create']);
  }

  openEdit(event: MyEvent): void {
    this.router.navigate(['/my-events', event.id, 'edit']);
  }

  openPackages(event: MyEvent): void {
    if (!this.isPremium) {
      this.snackBar.open(
        'Package management requires a premium subscription.',
        'OK',
        { duration: 4000 },
      );
      return;
    }
    this.router.navigate(['/my-events', event.id, 'packages']);
  }

  viewEventPage(event: MyEvent): void {
    if (!event.eventQrCode) {
      this.snackBar.open('This event has no QR code yet.', 'OK', {
        duration: 3000,
      });
      return;
    }
    this.router.navigate(['/events/invite', event.eventQrCode]);
  }

  openPrintQr(event: MyEvent): void {
    if (!event.eventQrCode) {
      this.snackBar.open('This event has no QR code yet.', 'OK', {
        duration: 3000,
      });
      return;
    }
    this.dialog.open(PrintQrDialogComponent, {
      data: { eventName: event.eventName, qrCode: event.eventQrCode },
    });
  }

  copyEventLink(event: MyEvent): void {
    if (!event.eventQrCode) {
      this.snackBar.open('This event has no QR code yet.', 'OK', {
        duration: 3000,
      });
      return;
    }
    const url = `${environment.webBaseUrl}/events/invite/${event.eventQrCode}`;
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Link copied!', 'OK', { duration: 2500 });
    });
  }

  deleteEvent(event: MyEvent): void {
    if (!confirm(`Delete "${event.eventName}"? This cannot be undone.`)) return;
    this.deleting = true;
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.deleting = false;
        this.snackBar.open('Event deleted.', 'OK', { duration: 3000 });
        this.loadEvents();
      },
      error: () => {
        this.deleting = false;
        this.snackBar.open('Error deleting event.', 'OK', { duration: 3000 });
      },
    });
  }

  getEventStatus(event: MyEvent): string {
    const today = new Date();
    const eventDate = new Date(event.eventDate);
    return eventDate < today ? 'PAST' : 'UPCOMING';
  }
}
