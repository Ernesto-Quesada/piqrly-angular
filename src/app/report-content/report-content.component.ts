import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { environment } from '../../environments/environment';

export interface ReportSheetData {
  pictureId: string;
}

@Component({
  selector: 'app-report-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './report-content.component.html',
  styleUrl: './report-content.component.scss',
})
export class ReportContentComponent {
  private http = inject(HttpClient);
  private bottomSheetRef = inject(MatBottomSheetRef<ReportContentComponent>);
  data = inject<ReportSheetData>(MAT_BOTTOM_SHEET_DATA);

  readonly reasons = [
    { value: 'STOLEN', label: 'Stolen / Copyright', icon: 'copyright' },
    { value: 'NUDITY', label: 'Nudity / Explicit', icon: 'no_adult_content' },
    { value: 'SPAM', label: 'Spam / Misleading', icon: 'report_problem' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate', icon: 'flag' },
    { value: 'OTHER', label: 'Other', icon: 'more_horiz' },
  ];

  selectedReason: string | null = null;
  details = '';
  isLoading = signal(false);
  submitted = signal(false);
  errorMsg = signal('');

  selectReason(value: string): void {
    this.selectedReason = this.selectedReason === value ? null : value;
  }

  submit(): void {
    if (!this.selectedReason) {
      this.errorMsg.set('Please select a reason.');
      return;
    }

    this.errorMsg.set('');
    this.isLoading.set(true);

    const payload: any = {
      pictureId: this.data.pictureId,
      reason: this.selectedReason,
    };

    if (this.details.trim()) {
      payload.details = this.details.trim();
    }

    this.http.post(`${environment.apiBaseUrl}/api/reports`, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
        setTimeout(() => this.bottomSheetRef.dismiss({ reported: true }), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMsg.set('You have already reported this photo.');
        } else if (err.status === 401) {
          this.errorMsg.set('You must be logged in to report.');
        } else {
          this.errorMsg.set('Failed to submit. Please try again.');
        }
      },
    });
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }
}
