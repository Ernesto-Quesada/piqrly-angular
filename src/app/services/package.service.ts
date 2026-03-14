// src/app/services/package.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../config/api-endpoints';

export interface EventPackage {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface PackagePurchaseStatus {
  purchaseId: number;
  sessionId: string;
  packageName: string;
  limit: number;
  selectedPictureIds: string[];
  paid: boolean;
  eventQrCode: string;
}

@Injectable({ providedIn: 'root' })
export class PackageService {
  constructor(private http: HttpClient) {}

  // Load packages for an event by qrCode
  getPackagesForEvent(qrCode: string): Observable<EventPackage[]> {
    return this.http.get<EventPackage[]>(
      `${API.events.packagesForEvent(qrCode)}`,
    );
  }

  // ✅ Create package for an event (used in my-events management page)
  createPackage(
    eventId: number,
    name: string,
    quantity: number,
    price: number,
  ): Observable<EventPackage> {
    return this.http.post<EventPackage>(
      `${API.events.createPackage(eventId)}`,
      { name, quantity, price },
    );
  }

  // ✅ Delete a package (used in my-events management page)
  deletePackage(packageId: number): Observable<void> {
    return this.http.delete<void>(`${API.events.deletePackage(packageId)}`);
  }

  // Checkout: send selected picture IDs + user info in one call
  checkout(
    packageId: number,
    email: string,
    name: string,
    inviteCode: string,
    pictureIds: string[],
  ): Observable<{ sessionId: string; url: string }> {
    return this.http.post<{ sessionId: string; url: string }>(
      `${API.events.eventPackageCheckout(packageId)}`,
      { email, name, inviteCode, pictureIds },
    );
  }

  // Success page: verify payment + get selected picture IDs
  getPurchaseStatus(sessionId: string): Observable<PackagePurchaseStatus> {
    return this.http.get<PackagePurchaseStatus>(
      `${API.events.eventPackagePurchaseStatus(sessionId)}`,
    );
  }
}
