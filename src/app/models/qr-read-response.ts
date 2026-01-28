import { Image, Price, ImageOwner } from './response';

export interface QrViewResponse {
  pictures: Image[];
  owner: ImageOwner | null;
  forSale: boolean;
  price: Price | null;

  // ✅ Event invite flow extras (optional so QR flow doesn’t break)
  eventName?: string | null;
  isPublic?: boolean | null;

  // (optional: present in your JSON, safe to include)
  qrCode?: string | null;
  isOwner?: boolean | null;
  isInvited?: boolean | null;
}
