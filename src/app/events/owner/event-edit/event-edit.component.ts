// src/app/my-events/event-form/event-form.component.ts
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  EventManagementService,
  MyEvent,
} from '../../../services/event-management.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
  ],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.scss',
})
export class EventEditComponent implements OnInit {
  isEdit = false;
  eventId: number | null = null;
  saving = false;
  loading = false;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventManagementService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.eventId = Number(id);
      this.loading = true;
      this.eventService.getMyEvents().subscribe({
        next: (events) => {
          const event = events.find((e) => e.id === this.eventId);
          this.loading = false;
          if (event) {
            this.buildForm(event);
          } else {
            this.router.navigate(['/my-events']);
          }
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/my-events']);
        },
      });
    } else {
      this.buildForm();
    }
  }

  private buildForm(event?: MyEvent): void {
    this.form = this.fb.group({
      eventName: [event?.eventName ?? '', Validators.required],
      eventAddress: [event?.eventAddress ?? '', Validators.required],
      eventDate: [event?.eventDate ?? '', Validators.required],
      contactName: [event?.contactName ?? ''],
      contactPhone: [event?.contactPhone ?? ''],
      contactEmail: [event?.contactEmail ?? ''],
      forSale: [event?.forSale ?? false],
      isPublic: [event?.isPublic ?? true],
      allowGuestUploads: [event?.allowGuestUploads ?? false],
      eventPriceSmall: [event?.eventPriceSmall ?? null],
      eventPriceFull: [event?.eventPriceFull ?? null],
      eventPriceRoyalty: [event?.eventPriceRoyalty ?? null],
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.value;

    const call$ = this.isEdit
      ? this.eventService.updateEvent(this.eventId!, payload)
      : this.eventService.createEvent(payload);

    call$.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(
          this.isEdit ? 'Event updated!' : 'Event created!',
          'OK',
          { duration: 3000 },
        );
        this.router.navigate(['/my-events']);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err?.error?.message ?? 'Error saving event.', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/my-events']);
  }

  get forSaleValue(): boolean {
    return this.form.get('forSale')?.value ?? false;
  }
}
