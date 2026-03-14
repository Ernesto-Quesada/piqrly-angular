// src/app/services/event-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../config/api-endpoints';

export interface MyEvent {
  id: number;
  eventName: string;
  eventAddress: string;
  eventDate: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  eventQrCode: string;
  forSale: boolean;
  isPublic: boolean;
  allowGuestUploads: boolean;
  active: boolean;
  eventStatus: string;
  eventPriceSmall?: number;
  eventPriceFull?: number;
  eventPriceRoyalty?: number;
}

export interface CreateEventPayload {
  eventName: string;
  eventAddress: string;
  eventDate: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  forSale: boolean;
  isPublic: boolean;
  allowGuestUploads: boolean;
  eventPriceSmall?: number;
  eventPriceFull?: number;
  eventPriceRoyalty?: number;
}

@Injectable({ providedIn: 'root' })
export class EventManagementService {
  constructor(private http: HttpClient) {}

  getMyEvents(): Observable<MyEvent[]> {
    return this.http.get<MyEvent[]>(`${API.events.myEvents}`);
  }

  createEvent(payload: CreateEventPayload): Observable<MyEvent> {
    return this.http.post<MyEvent>(`${API.events.myEvents}`, payload);
  }

  updateEvent(
    id: number,
    payload: Partial<CreateEventPayload>,
  ): Observable<MyEvent> {
    return this.http.put<MyEvent>(`${API.events.myEvents}/${id}`, payload);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${API.events.myEvents}/${id}`);
  }
}
