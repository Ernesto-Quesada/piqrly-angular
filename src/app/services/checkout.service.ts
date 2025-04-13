import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  // Create a Checkout Session by posting payload to your Java backend
  createCheckoutSession(payload: any): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(
      'http://localhost:8080/create-checkout-session',
      payload
    );
  }

  verifyCheckoutSession(sessionId: string): Observable<any> {
    return this.http.post<any>(
      `http://localhost:8080/verify-checkout-session`,
      { sessionId: sessionId }
    );
  }
  fetchPaidPictures(sessionId: string) {
    return this.http.get<{ pictureUrls: string[] }>(
      `http://localhost:8080/verify-checkout-session/paid-pictures/${sessionId}`
    );
  }
}
