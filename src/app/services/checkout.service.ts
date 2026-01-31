import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  createCheckoutSession(payload: any): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(
      API.checkout.createSession,
      payload,
    );
  }

  // ⚠️ This is your MOBILE PaymentIntent verify endpoint (clientSecret)
  //not in use
  // verifyCheckoutSession(sessionId: string): Observable<any> {
  //   return this.http.post<any>(
  //     ///api/mobile/verify-checkout-session
  //     API.checkout.verifySession,
  //     {
  //       sessionId,
  //     },
  //   );
  // }

  // ✅ NEW: Web Checkout verify endpoint (sessionId)
  verifyWebCheckoutSession(sessionId: string): Observable<any> {
    return this.http.post<any>(API.checkout.verifyWebCheckoutSession, {
      sessionId,
    });
  }

  getWebCart(cartId: string): Observable<any> {
    // api/mobile/web-cart/:cartId
    return this.http.get<any>(API.checkout.webCart(cartId));
  }

  createWebCartCheckoutSession(payload: {
    cartId: string;
    fullName: string;
    email: string;
  }): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(
      API.checkout.webCheckoutSession,
      payload,
    );
  }
}
