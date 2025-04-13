// picture.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LandingData } from '../models/image';
import landingDataMock from '../+ahelper.json/images';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  //private apiUrl = 'http://10.0.2.2:8080/api/pictures/';
  private apiUrl = 'http://localhost:8080/api/pictures/';
  //private apiUrl =' http://192.168.0.107:8080/api/pictures/'

  constructor(private http: HttpClient) {}

  // Only pass the QR code to the backend
  getPicturesByQrCode(qrCode: string): Observable<LandingData> {
    // const params = new HttpParams().set('qrCode', qrCode);
    //return this.http.get<any[]>(this.apiUrl, { params });
    //return this.http.get<any>(this.apiUrl + qrCode);
    const mockedResponseFromBackend = landingDataMock;
    return of(mockedResponseFromBackend);
  }
}
