import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  PrenotazioneApi,
  PrenotazionePayload,
} from '../interfaces/booking.interfaces';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor(private http: HttpClient) {}

  getBookingsMe() {
    return firstValueFrom(
      this.http.get<PrenotazioneApi[]>(`${environment.apiUrl}/api/bookings/me`),
    );
  }

  createBooking(payload: PrenotazionePayload) {
    return firstValueFrom(
      this.http.post<PrenotazioneApi>(`${environment.apiUrl}/api/bookings`, payload),
    );
  }
}
