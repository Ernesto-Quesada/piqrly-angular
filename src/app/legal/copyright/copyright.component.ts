import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss'],
})
export class CopyrightComponent {
  pdfUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'assets/legal/piqrly_dmca_copyright_policy.pdf',
    );
  }
}
