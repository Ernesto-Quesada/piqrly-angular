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
    byEventQr: (qr: string) => `${environment.apiBaseUrl}/api/share/${qr}/data`,

    // paidEventPictures: (sessionId: string) =>
    //   `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}`,

    // // ✅ Paid ORIGINALS zip
    // paidEventZip: (sessionId: string) =>
    //   `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}/download-zip`,
  },

  checkout: {
    createSession: `${environment.apiBaseUrl}/create-checkout-session`,

    verifySession: `${environment.apiBaseUrl}/api/verify-checkout-session`, //not in use

    webCheckoutSession: `${environment.apiBaseUrl}/api/web-checkout-session`,

    verifyWebCheckoutSession: `${environment.apiBaseUrl}/api/verify-web-checkout-session`,

    webCart: (cartId: string) =>
      `${environment.apiBaseUrl}/api/web-cart/${cartId}`,
  },
};

// import { environment } from '../../environments/environment';

// export const API = {
//   // apiBaseUrl: 'http://192.168.0.107:8080', for local development
//   //apiBaseUrl: 'https://api.piqrly.com', for prod

//   pictures: {
//     byQr: (qr: string) => `${environment.apiBaseUrl}/api/pictures/nt/${qr}`,
//     paidPictures: (sessionId: string) =>
//       `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}`,
//     // paidPictures: (sessionId: string) =>
//     //   `${environment.apiBaseUrl}/api/mobile/paid-pictures/${sessionId}`,
//   },

//   checkout: {
//     createSession: `${environment.apiBaseUrl}/create-checkout-session`,
//     verifySession: `${environment.apiBaseUrl}/api/verify-checkout-session`,
//     webCheckoutSession: `${environment.apiBaseUrl}/api/web-checkout-session`,
//     verifyWebCheckoutSession: `${environment.apiBaseUrl}/api/verify-web-checkout-session`,
//     webCart: (cartId: string) =>
//       `${environment.apiBaseUrl}/api/web-cart/${cartId}`,
//   },
// };
