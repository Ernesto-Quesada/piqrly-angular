export interface Image {
  pictureId: string; // Unique identifier for the image
  url: string; // URL of the image
  description?: string; // Optional description for the image
}
export interface Price {
  small: number; // Price for small size
  full: number; // Price for full size
}

export interface ImageOwner {
  // Represents an item in the shopping cart
  name: string;
  email: string;
  phone: string;
  business?: Company | null; // Optional business information
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
