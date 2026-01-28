export interface Image {
  id: string;
  pictureId: string;
  qrCode: string;
  imageUrl: string;
  previewImageUrl: string;
  description?: string; // Optional description for the image
  createdAt?: string; // Optional creation date of the image
}
export interface Price {
  priceSmall: number;
  priceFull: number;
  priceRoyalty: number;
}

export interface ImageOwner {
  // Represents an item in the shopping cart
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string | null;
  displayName: string | null;
  phone: string;
  business?: Company | null; // Optional business information
  shortBio: string | null;
  stripeAccountId: string | null;
  followers: number;
  following: number;
  // sales: number;
  // revenue: number;
}
export interface Company {
  companyName: string;
  companyEmail: string;
  companyAddress?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyLogo?: string | null;
}
export interface LandingData {
  pictures: Image[]; // Array of images
  qr: string; // QR code ID
  price?: Price; // Price object containing small and full prices
  user?: ImageOwner | null; // User information
}
