import { QrViewResponse } from './qr-read-response';
import { Cart, CheckoutCartPayload, ShopCart } from './shopCart';

export interface AppState {
  landingData: QrViewResponse;
  eventLandingDataLoad: QrViewResponse;
  shopCart: ShopCart;
}
