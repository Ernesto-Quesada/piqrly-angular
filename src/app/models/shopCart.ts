import { Image } from './image';

export interface Cart {
  selectedPictures: Image[];
  chosenSize: 'small' | 'full' | null;
  prices: { small: number; full: number };
}

export interface CheckoutCartPayload {
  images: Image[]; // array of picture IDs or a list of images
  chosenSize: 'small' | 'full' | null; // The size chosen by the user
  totalPrice: number;
  user: {
    fullName: string;
    email: string;
    address: string;
    // Other data required by your backend/Stripe
  };
}
export interface CartItem {
  image: Image;
  size: 'small' | 'full' | null;
  price: number;
}
export interface ShopCart {
  items: CartItem[];
  // prices?: { small: number; full: number } | undefined; // static global prices if needed
  subtotalPrice: number;
  totalPrice: number;
  user?: {
    fullName: string;
    email: string;
    // address: string;
    // Other data required by your backend/Stripe
  };
}
