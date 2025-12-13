export interface QrViewResponse {
  pictures: QrPicture[];
  owner: QrOwner | null;
  forSale: boolean;
  price: QrPrice | null;
}

export interface QrPicture {
  id: string;
  pictureId: string;
  qrCode: string;
  imageUrl: string;
  //   createdAt: string; // ISO date string
}

export interface QrOwner {
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string | null;
  displayName: string | null;
  shortBio: string | null;
  stripeAccountId: string | null;
  followers: number;
  following: number;
  sales: number;
  revenue: number;
}

export interface QrPrice {
  priceSmall: number;
  priceFull: number;
  priceRoyalty: number;
}
