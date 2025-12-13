// picture.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { QrViewResponse } from '../models/qr-read-response';
import { API } from '../config/api-endpoints';
// import landingDataMock from '../+ahelper.json/images';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  //private apiUrl = 'http://10.0.2.2:8080/api/pictures/';
  // private apiUrl = 'http://localhost:8080/api/pictures/';
  //private apiUrl =' http://192.168.0.107:8080/api/pictures/'
  // Notoken
  //private apiUrlNT = 'http://107.21.177.112:8080/api/pictures/nt/';
  // private apiUrlNT = 'http://api.piqrly.com/api/pictures/nt/'; // For production
  // private apiUrlNT = 'http://api.piqrly.com:8080/api/pictures/nt/'; // For production
  //private apiUrlNT = 'http://localhost:8080/api/pictures/nt/'; // For production

  constructor(private http: HttpClient) {}

  // Only pass the QR code to the backend
  getPicturesByQrCode(qrCode: string): Observable<QrViewResponse> {
    // const params = new HttpParams().set('qrCode', qrCode);
    //return this.http.get<any[]>(this.apiUrl, { params });
    return this.http.get<any>(API.pictures.byQr(qrCode));
    // const mockedResponseFromBackend = landingDataMock;
    // return of(mockedResponseFromBackend);
  }

  getPaidPictures(sessionId: string): Observable<any> {
    return this.http.get<any>(API.pictures.paidPictures(sessionId));
    // return this.http.get<any>(this.apiUrl + 'paid-pictures/' + sessionId);
  }
  // fetchPaidPictures(sessionId: string) {
  //   return this.http.get<{ pictureUrls: string[] }>(
  //     `http://localhost:8080/verify-checkout-session/paid-pictures/${sessionId}`
  //   );
  // }
}
