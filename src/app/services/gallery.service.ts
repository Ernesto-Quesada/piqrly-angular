import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../config/api-endpoints';

// Keep types local to the service (matches your style in other services)
export type GalleryMeta = {
  createdAt?: string;
  purchased?: boolean;
  galleryId?: string;
  locked?: boolean;
  expiresAt?: string;
};

export type GalleryUnlockRequest = { pin: string };

// ✅ IMPORTANT:
// We are making unlock return the SAME SHAPE as /nt and events,
// so ViewGallery can reuse the exact flow (pictures + owner + forSale + price).
// If backend currently returns only pictureIds, we’ll map it later or update backend.
export type GalleryUnlockResponse = {
  galleryId?: string;
  createdAt?: string;
  expiresAt?: string;
  purchased?: boolean;

  // “/nt-style”
  pictures?: any[]; // you can swap to Image[] once you import your Image model
  owner?: any; // swap to ImageOwner
  forSale?: boolean;
  price?: {
    priceSmall: number;
    priceFull: number;
    priceRoyalty: number;
  } | null;

  // (legacy fallback)
  pictureIds?: number[];
};

@Injectable({ providedIn: 'root' })
export class GalleryService {
  constructor(private http: HttpClient) {}

  getMeta(galleryId: string): Observable<GalleryMeta> {
    return this.http.get<GalleryMeta>(API.galleries.meta(galleryId));
  }

  unlock(galleryId: string, pin: string): Observable<GalleryUnlockResponse> {
    return this.http.post<GalleryUnlockResponse>(
      API.galleries.unlock(galleryId),
      { pin },
    );
  }
}
