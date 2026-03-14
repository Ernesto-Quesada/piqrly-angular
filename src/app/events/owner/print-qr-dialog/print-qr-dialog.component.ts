// src/app/my-events/print-qr-dialog/print-qr-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import QRCode from 'qrcode';
import { environment } from '../../../../environments/environment';

export interface PrintQrDialogData {
  eventName: string;
  qrCode: string;
}

@Component({
  selector: 'app-print-qr-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './print-qr-dialog.component.html',
  styleUrl: './print-qr-dialog.component.scss',
})
export class PrintQrDialogComponent implements OnInit {
  form!: FormGroup;
  qrDataUrl = '';

  readonly fonts = [
    { value: 'Roboto, sans-serif', label: 'Business — clean' },
    { value: '"Pinyon Script", cursive', label: 'Elegant — weddings' },
    { value: '"Fredoka One", cursive', label: 'Playful — kids events' },
  ];

  readonly eventUrl: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PrintQrDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrintQrDialogData,
  ) {
    this.eventUrl = `${environment.webBaseUrl}/events/invite/${data.qrCode}`;
  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      title: [this.data.eventName],
      footer: [''],
      font: [this.fonts[0].value],
      type: ['poster'], // 'poster' | 'stickers'
    });

    // Generate QR image once
    this.qrDataUrl = await QRCode.toDataURL(this.eventUrl, {
      width: 600,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }

  print(): void {
    const { title, footer, font, type } = this.form.value;
    const html =
      type === 'poster'
        ? this.buildPosterHtml(title, footer, font)
        : this.buildStickersHtml(title, font);

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    // slight delay so fonts load before print dialog
    setTimeout(() => {
      win.print();
    }, 600);
  }

  // ─── Poster: one QR centered on 8.5" x 11" ─────────────────────────────────

  private buildPosterHtml(title: string, footer: string, font: string): string {
    const fontImport = this.googleFontImport(font);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event QR Poster</title>
  ${fontImport}
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 8.5in; height: 11in;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: ${font};
      background: white;
    }
    .title {
      font-size: 36pt; font-weight: bold;
      text-align: center;
      position: absolute; top: 2in; left: 0; right: 0;
    }
    .qr {
      width: 3in; height: 3in;
    }
    .footer {
      font-size: 24pt;
      text-align: center;
      margin-top: 0.5in;
    }
    .url {
      font-size: 10pt; color: #666;
      margin-top: 0.25in; font-family: monospace;
    }
  </style>
</head>
<body>
  ${title ? `<div class="title">${this.esc(title)}</div>` : ''}
  <img class="qr" src="${this.qrDataUrl}" />
  ${footer ? `<div class="footer">${this.esc(footer)}</div>` : ''}
  <div class="url">${this.eventUrl}</div>
</body>
</html>`;
  }

  // ─── Stickers: 3×4 grid of 2"×2" cells on Letter ───────────────────────────

  private buildStickersHtml(label: string, font: string): string {
    const fontImport = this.googleFontImport(font);
    const cells = Array(12)
      .fill(null)
      .map(
        () => `
      <div class="cell">
        <img class="qr" src="${this.qrDataUrl}" />
        ${label ? `<div class="label">${this.esc(label)}</div>` : ''}
      </div>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event QR Stickers</title>
  ${fontImport}
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 8.5in; height: 11in;
      font-family: ${font};
      background: white;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 2in);
      grid-template-rows: repeat(4, 2in);
      column-gap: calc((8.5in - 6in) / 4);
      row-gap: calc((11in - 8in) / 5);
      padding-top: calc((11in - 8in) / 5);
      padding-left: calc((8.5in - 6in) / 4);
    }
    .cell {
      width: 2in; height: 2in;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border: 0.5pt dashed #ccc;
    }
    .qr { width: 1.5in; height: 1.5in; }
    .label { font-size: 8pt; margin-top: 3pt; text-align: center; }
  </style>
</head>
<body>
  <div class="grid">${cells}</div>
</body>
</html>`;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private googleFontImport(font: string): string {
    if (font.includes('Pinyon Script')) {
      return `<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet">`;
    }
    if (font.includes('Fredoka One')) {
      return `<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet">`;
    }
    return `<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">`;
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  close(): void {
    this.dialogRef.close();
  }
}
