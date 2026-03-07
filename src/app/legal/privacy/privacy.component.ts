import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent {
  pdfUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'assets/legal/piqrly_privacy_policy.pdf',
    );
  }
}
