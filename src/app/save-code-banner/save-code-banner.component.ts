// save-event-banner.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-save-code-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './save-code-banner.component.html',
  styleUrl: './save-code-banner.component.scss',
})
export class SaveCodeBannerComponent implements OnInit {
  @Input() pageUrl: string = '';
  @Input() title: string = 'Photos';
  @Input() contextKey: string = ''; // unique per QR/invite code

  isLoggedIn = false;
  visible = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('access_token');
    const neverShow =
      localStorage.getItem(`save_modal_${this.contextKey}`) === '1';
    if (!neverShow) {
      setTimeout(() => (this.visible = true), 800);
    }
  }

  get currentUrl(): string {
    return this.pageUrl || window.location.href;
  }

  dismiss(): void {
    this.visible = false;
  }

  dismissForever(): void {
    localStorage.setItem(`save_modal_${this.contextKey}`, '1');
    this.visible = false;
  }

  copyLink(): void {
    const url = this.currentUrl;
    // fallback for localhost / non-HTTPS
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.snackBar.open('Link copied!', '', { duration: 2000 });
          this.dismiss();
        })
        .catch(() => this.fallbackCopy(url));
    } else {
      this.fallbackCopy(url);
    }
  }

  private fallbackCopy(url: string): void {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    this.snackBar.open('Link copied!', '', { duration: 2000 });
    this.dismiss();
  }
  async share(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({ title: this.title, url: this.currentUrl });
        this.dismiss();
      } catch (_) {
        // user cancelled — do nothing
      }
    } else {
      // desktop fallback — just copy
      this.copyLink();
      this.snackBar.open('Link copied to clipboard!', '', { duration: 2000 });
    }
  }

  saveToHistory(): void {
    // TODO: POST /api/user/history { url: this.currentUrl, title: this.title }
    this.snackBar.open('Saved!', '', { duration: 2000 });
    this.dismiss();
  }
}
