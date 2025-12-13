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
      payload
    );
  }

  // ⚠️ This is your MOBILE PaymentIntent verify endpoint (clientSecret)
  //not in use
  verifyCheckoutSession(sessionId: string): Observable<any> {
    return this.http.post<any>(
      ///api/mobile/verify-checkout-session
      API.checkout.verifySession,
      {
        sessionId,
      }
    );
  }

  // ✅ NEW: Web Checkout verify endpoint (sessionId)
  verifyWebCheckoutSession(sessionId: string): Observable<any> {
    return this.http.post<any>(API.checkout.verifyWebCheckoutSession, {
      sessionId,
    });
  }

  // fetchPaidPictures(sessionId: string) {
  //   return this.http.get<{ pictureUrls: string[] }>(
  //     `http://localhost:8080/verify-checkout-session/paid-pictures/${sessionId}`
  //   );
  // }

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
      payload
    );
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class CheckoutService {
//   constructor(private http: HttpClient) {}

//   private mobileApiBaseUrl = 'http://192.168.0.107:8080/api/mobile'; // 👈 adjust IP if needed

//   // existing methods ---------------

//   createCheckoutSession(payload: any): Observable<{ sessionId: string }> {
//     return this.http.post<{ sessionId: string }>(
//       'http://localhost:8080/create-checkout-session',
//       // for test on phone
//       // 'http://192.168.0.107:8080/create-checkout-session',
//       payload
//     );
//   }

//   verifyCheckoutSession(sessionId: string): Observable<any> {
//     return this.http.post<any>(
//       `${this.mobileApiBaseUrl}/verify-checkout-session`,
//       { sessionId }
//     );
//   }

//   fetchPaidPictures(sessionId: string) {
//     return this.http.get<{ pictureUrls: string[] }>(
//       `http://localhost:8080/verify-checkout-session/paid-pictures/${sessionId}`
//     );
//   }

//   // 🔹 NEW: get web cart created by the mobile app
//   getWebCart(cartId: string): Observable<any> {
//     return this.http.get<any>(`${this.mobileApiBaseUrl}/web-cart/${cartId}`);
//   }

//   // 🔹 NEW: create Stripe Checkout session for *web cart* (app → web flow)
//   createWebCartCheckoutSession(payload: {
//     cartId: string;
//     fullName: string;
//     email: string;
//   }): Observable<{ sessionId: string }> {
//     return this.http.post<{ sessionId: string }>(
//       `${this.mobileApiBaseUrl}/web-checkout-session`,
//       payload
//     );
//   }
// }
