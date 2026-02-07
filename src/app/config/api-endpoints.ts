import { environment } from '../../environments/environment';

export const API = {
  pictures: {
    byQr: (qr: string) => `${environment.apiBaseUrl}/api/pictures/nt/${qr}`,

    paidPictures: (sessionId: string) =>
      `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}`,

    // ✅ Paid ORIGINALS zip
    paidZip: (sessionId: string) =>
      `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}/download-zip`,
  },
  events: {
    byEventQr: (qr: string) =>
      `${environment.apiBaseUrl}/api/events/invite/${qr}`,

    // paidEventPictures: (sessionId: string) =>
    //   `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}`,

    // // ✅ Paid ORIGINALS zip
    // paidEventZip: (sessionId: string) =>
    //   `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}/download-zip`,
  },

  checkout: {
    createSession: `${environment.apiBaseUrl}/create-checkout-session`,

    webCheckoutSession: `${environment.apiBaseUrl}/api/web-checkout-session`,

    verifyWebCheckoutSession: `${environment.apiBaseUrl}/api/verify-web-checkout-session`,

    webCart: (cartId: string) =>
      `${environment.apiBaseUrl}/api/web-cart/${cartId}`,

    // verifySession: `${environment.apiBaseUrl}/api/verify-checkout-session`, //not in use
  },
};
