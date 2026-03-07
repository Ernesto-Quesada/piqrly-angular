import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface FeedbackItem {
  id: number;
  user: { email: string } | null;
  subtype: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Analytics {
  total: number;
  open: number;
  reviewed: number;
  resolved: number;
  dismissed: number;
  bugs: number;
  suggestions: number;
  other: number;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(true);
  feedback = signal<FeedbackItem[]>([]);
  analytics = signal<Analytics | null>(null);

  filterStatus = '';
  filterSubtype = '';

  displayedColumns = [
    'createdAt',
    'user',
    'subtype',
    'message',
    'status',
    'actions',
  ];

  readonly statuses = ['OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
  readonly subtypes = ['BUG', 'SUGGESTION', 'OTHER'];

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.isLoading.set(true);
    let url = `${environment.apiBaseUrl}/api/feedback`;

    const params: string[] = [];
    if (this.filterStatus) params.push(`status=${this.filterStatus}`);
    if (this.filterSubtype) params.push(`subtype=${this.filterSubtype}`);
    if (params.length) url += `?${params.join('&')}`;

    this.http.get<FeedbackItem[]>(url).subscribe({
      next: (data) => {
        this.feedback.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load feedback', 'OK', { duration: 3000 });
      },
    });
  }

  loadAnalytics(): void {
    this.http
      .get<Analytics>(`${environment.apiBaseUrl}/api/feedback/analytics`)
      .subscribe({
        next: (data) => this.analytics.set(data),
        error: () => {},
      });
  }

  updateStatus(item: FeedbackItem, newStatus: string): void {
    this.http
      .patch(`${environment.apiBaseUrl}/api/feedback/${item.id}/status`, {
        status: newStatus,
      })
      .subscribe({
        next: () => {
          item.status = newStatus;
          this.feedback.set([...this.feedback()]);
          this.loadAnalytics();
          this.snackBar.open('Status updated', 'OK', { duration: 2000 });
        },
        error: () =>
          this.snackBar.open('Failed to update status', 'OK', {
            duration: 3000,
          }),
      });
  }

  applyFilters(): void {
    this.loadFeedback();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterSubtype = '';
    this.loadFeedback();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  statusColor(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'warn';
      case 'REVIEWED':
        return 'primary';
      case 'RESOLVED':
        return 'accent';
      case 'DISMISSED':
        return '';
      default:
        return '';
    }
  }

  subtypeIcon(subtype: string): string {
    switch (subtype) {
      case 'BUG':
        return 'bug_report';
      case 'SUGGESTION':
        return 'lightbulb';
      default:
        return 'chat';
    }
  }
}
