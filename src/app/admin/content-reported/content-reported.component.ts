import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-content-reported',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './content-reported.component.html',
  styleUrl: './content-reported.component.scss',
})
export class ContentReportedComponent implements OnInit {
  private http = inject(HttpClient);

  reports = signal<any[]>([]);
  analytics = signal<any>(null);
  isLoading = signal(false);

  filterStatus = '';
  filterReason = '';

  readonly statuses = ['OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
  readonly reasons = ['STOLEN', 'NUDITY', 'SPAM', 'INAPPROPRIATE', 'OTHER'];

  readonly displayedColumns = [
    'createdAt',
    'reportedBy',
    'photographer',
    'pictureId',
    'reason',
    'details',
    'status',
    'actions',
  ];

  ngOnInit(): void {
    this.loadReports();
    this.loadAnalytics();
  }

  loadReports(): void {
    this.isLoading.set(true);
    const params: any = {};
    if (this.filterStatus) params['status'] = this.filterStatus;
    if (this.filterReason) params['reason'] = this.filterReason;

    this.http
      .get<any[]>(`${environment.apiBaseUrl}/api/reports`, { params })
      .subscribe({
        next: (data) => {
          this.reports.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  loadAnalytics(): void {
    this.http
      .get<any>(`${environment.apiBaseUrl}/api/reports/analytics`)
      .subscribe({ next: (data) => this.analytics.set(data) });
  }

  applyFilters(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterReason = '';
    this.loadReports();
  }

  updateStatus(row: any, newStatus: string): void {
    this.http
      .patch(`${environment.apiBaseUrl}/api/reports/${row.id}/status`, {
        status: newStatus,
      })
      .subscribe({
        next: () => {
          this.reports.update((list) =>
            list.map((r) =>
              r.id === row.id ? { ...r, status: newStatus } : r,
            ),
          );
          this.loadAnalytics();
        },
      });
  }

  reasonIcon(reason: string): string {
    switch (reason) {
      case 'STOLEN':
        return 'copyright';
      case 'NUDITY':
        return 'no_adult_content';
      case 'SPAM':
        return 'report_problem';
      case 'INAPPROPRIATE':
        return 'flag';
      default:
        return 'more_horiz';
    }
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
