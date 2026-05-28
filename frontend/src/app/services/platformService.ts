import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  constructor(private http: HttpClient) {}

  getMe() {
    return firstValueFrom(this.http.get<any>(`${environment.apiUrl}/api/users/me`));
  }

  updateMe(payload: any) {
    return firstValueFrom(
      this.http.put<any>(`${environment.apiUrl}/api/users/me`, payload),
    );
  }

  getBookingsMe() {
    return firstValueFrom(
      this.http.get<any[]>(`${environment.apiUrl}/api/bookings/me`),
    );
  }

  createReview(payload: any) {
    return firstValueFrom(
      this.http.post<any[]>(`${environment.apiUrl}/api/reviews`, payload),
    );
  }

  getPurchasedMaterials() {
    return firstValueFrom(
      this.http.get<any[]>(`${environment.apiUrl}/api/materials/purchased/me`),
    );
  }

  getConversations() {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/messages`));
  }

  getMessages(userId: number | string) {
    return firstValueFrom(
      this.http.get<any[]>(`${environment.apiUrl}/api/messages/${userId}`),
    );
  }

  sendMessage(destinatarioId: number | string, contenuto: string) {
    return firstValueFrom(
      this.http.post<any[]>(`${environment.apiUrl}/api/messages`, {
        destinatario_id: destinatarioId,
        contenuto,
      }),
    );
  }

  getAdminUsers() {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/api/admin/users`));
  }

  updateUserStatus(id: number | string, stato: 'attivo' | 'bloccato') {
    return firstValueFrom(
      this.http.put<any[]>(`${environment.apiUrl}/api/admin/users/${id}/status`, {
        stato,
      }),
    );
  }

  deleteUser(id: number | string) {
    return firstValueFrom(
      this.http.delete<any[]>(`${environment.apiUrl}/api/admin/users/${id}`),
    );
  }
}
