import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { PrenotazioneApi } from '../interfaces/booking.interfaces';
import type { RecensionePayload } from '../interfaces/review.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private http: HttpClient) {}

  createReview(payload: RecensionePayload) {
    return firstValueFrom(
      this.http.post<PrenotazioneApi[]>(`${environment.apiUrl}/api/reviews`, payload),
    );
  }
}
