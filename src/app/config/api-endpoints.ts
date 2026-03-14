import { environment } from '../../environments/environment';

export const API = {
  pictures: {
    byQr: (qr: string) => `${environment.apiBaseUrl}/api/pictures/nt/${qr}`,

    paidPictures: (sessionId: string) =>
      `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}`,

    // ✅ Paid ORIGINALS zip (Event / QR / legacy flows)
    paidZip: (sessionId: string) =>
      `${environment.apiBaseUrl}/api/pictures/paid-pictures/${sessionId}/download-zip`,
  },

  events: {
    myEvents: `${environment.apiBaseUrl}/api/events`,
    byEventQr: (qr: string) =>
      `${environment.apiBaseUrl}/api/events/invite/${qr}`,
    packagesForEvent: (qrCode: string) =>
      `${environment.apiBaseUrl}/api/packages/event/${qrCode}`,
    eventPackageCheckout: (packageId: number) =>
      `${environment.apiBaseUrl}/api/packages/${packageId}/checkout`,
    eventPackagePurchaseStatus: (sessionId: string) =>
      `${environment.apiBaseUrl}/api/packages/purchase/status?sessionId=${sessionId}`,
    createPackage: (eventId: number) =>
      `${environment.apiBaseUrl}/api/packages/event/${eventId}`,
    deletePackage: (packageId: number) =>
      `${environment.apiBaseUrl}/api/packages/${packageId}`,
  },

  galleries: {
    meta: (galleryId: string) =>
      `${environment.apiBaseUrl}/api/galleries/${galleryId}`,

    unlock: (galleryId: string) =>
      `${environment.apiBaseUrl}/api/galleries/${galleryId}/unlock`,

    // ✅ NEW: tier-aware gallery download
    downloadTiered: (galleryId: string, sessionId: string) =>
      `${environment.apiBaseUrl}/api/galleries/${galleryId}/download-tiered?sessionId=${encodeURIComponent(sessionId)}`,
  },

  checkout: {
    createSession: `${environment.apiBaseUrl}/create-checkout-session`,

    webCheckoutSession: `${environment.apiBaseUrl}/api/web-checkout-session`,

    verifyWebCheckoutSession: `${environment.apiBaseUrl}/api/verify-web-checkout-session`,

    webCart: (cartId: string) =>
      `${environment.apiBaseUrl}/api/web-cart/${cartId}`,
  },
};
