import { LandingData } from './image';
import { Cart, CheckoutCartPayload, ShopCart } from './shopCart';

export interface AppState {
  landingData: LandingData;
  shopCart: ShopCart;
}
