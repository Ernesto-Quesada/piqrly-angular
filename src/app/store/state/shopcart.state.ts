import { ShopCart } from './..//../models/shopCart';

export const initialShopCartState: ShopCart = JSON.parse(
  localStorage.getItem('appState') || '{}'
)?.shopCart ?? {
  items: [],
  subtotalPrice: 0,
  totalPrice: 0,
  user: {
    fullName: '',
    email: '',
    address: '',
    // Other data required by your backend/Stripe
  },
};
