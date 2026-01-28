// picture.service.ts (FULL FILE)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QrViewResponse } from '../models/qr-read-response';
import { API } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private http: HttpClient) {}

  // QR landing response (pictures + owner + forSale + price)
  getEventPicturesByQrCode(qrCode: string): Observable<QrViewResponse> {
    return this.http.get<QrViewResponse>(API.events.byEventQr(qrCode));
  }

  // FREE preview ZIP (already working)
  getEventPreviewZipUrlByQrCode(qrCode: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${API.pictures.byQr(qrCode)}/download-preview-zip`,
    );
  }

  //   // (optional) if you still want it later for UI listing; NOT needed for download
  //   getEventPaidPictures(sessionId: string): Observable<any> {
  //     /////////// ${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}`,
  //     return this.http.get<any>(API.pictures.paidPictures(sessionId));
  //   }

  // ✅ NEW: Paid ORIGINALS ZIP by Stripe session id (cs_...)
  // Backend should return: { url: "https://....zip" }
  getEventPaidZipUrl(sessionId: string): Observable<{ url: string }> {
    ////////*** API.pictures.paidZip(sessionId) = api/pictures/paid-pictures/${sessionId}/download-zip
    return this.http.get<{ url: string }>(API.pictures.paidZip(sessionId));
  }
}
