import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent {
  pdfUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'assets/legal/piqrly_terms_of_service.pdf',
    );
  }
}
