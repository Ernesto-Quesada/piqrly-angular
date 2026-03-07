import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
export class FeedbackFormComponent {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  // ✅ panel open/close state
  isOpen = signal(false);

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isModalOpen(): boolean {
    return this.dialog.openDialogs.length > 0;
  }

  // form fields
  message = '';
  subtype = 'OTHER';
  rating: number | null = null;

  // ui state
  isLoading = signal(false);
  submitted = signal(false);
  errorMsg = signal('');

  readonly subtypes = [
    { value: 'BUG', label: 'Bug Report', icon: 'bug_report' },
    { value: 'SUGGESTION', label: 'Suggestion', icon: 'lightbulb' },
    { value: 'OTHER', label: 'Other', icon: 'chat' },
  ];

  readonly stars = [1, 2, 3, 4, 5];

  togglePanel(): void {
    this.isOpen.update((v) => !v);
    // reset form when closing
    if (!this.isOpen()) {
      this._reset();
    }
  }

  setRating(star: number): void {
    // clicking same star deselects it
    this.rating = this.rating === star ? null : star;
  }

  submit(): void {
    if (!this.message.trim()) {
      this.errorMsg.set('Please enter a message.');
      return;
    }

    this.errorMsg.set('');
    this.isLoading.set(true);

    const payload: any = {
      message: this.message.trim(),
      subtype: this.subtype,
    };

    // ✅ only include rating if set (keeps backend flexible for future)
    if (this.rating !== null) {
      payload.rating = this.rating;
    }

    this.http
      .post(`${environment.apiBaseUrl}/api/feedback`, payload)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.submitted.set(true);
          // auto close after 2.5s
          setTimeout(() => {
            this.isOpen.set(false);
            this._reset();
          }, 2500);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMsg.set('Failed to send feedback. Please try again.');
        },
      });
  }

  private _reset(): void {
    this.message = '';
    this.subtype = 'OTHER';
    this.rating = null;
    this.errorMsg.set('');
    this.submitted.set(false);
    this.isLoading.set(false);
  }
}
