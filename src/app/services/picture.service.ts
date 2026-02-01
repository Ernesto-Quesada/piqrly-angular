// picture.service.ts (FULL FILE)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QrViewResponse } from '../models/qr-read-response';
import { API } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  constructor(private http: HttpClient) {}

  // QR landing response (pictures + owner + forSale + price)
  getPicturesByQrCode(qrCode: string): Observable<QrViewResponse> {
    return this.http.get<QrViewResponse>(API.pictures.byQr(qrCode));
  }

  // FREE preview ZIP (already working)
  getPreviewZipUrlByQrCode(qrCode: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${API.pictures.byQr(qrCode)}/download-preview-zip`,
    );
  }

  // ✅ Step 1: FREE preview ZIP for selected pictures only
  getPreviewZipUrlByQrCodeAndPictures(
    qrCode: string,
    pictureIds: string[],
  ): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(
      `${API.pictures.byQr(qrCode)}/download-preview-zip-selected`,
      { pictureIds },
    );
  }

  // (optional) if you still want it later for UI listing; NOT needed for download
  getPaidPictures(sessionId: string): Observable<any> {
    return this.http.get<any>(API.pictures.paidPictures(sessionId));
  }

  // ✅ NEW: Paid ORIGINALS ZIP by Stripe session id (cs_...)
  // Backend should return: { url: "https://....zip" }
  getPaidZipUrl(sessionId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(API.pictures.paidZip(sessionId));
  }
}
