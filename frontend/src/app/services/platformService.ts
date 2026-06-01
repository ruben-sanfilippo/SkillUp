import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { UtenteAdmin } from '../interfaces/admin.interfaces';
import type {
  AggiornamentoUtentePayload,
  ConversazioneApi,
  MaterialeAcquistatoApi,
  MessaggioApi,
  PrenotazioneApi,
  RecensionePayload,
  RispostaOperazione,
  UtenteApi,
} from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  constructor(private http: HttpClient) {}

  getMe() {
    return firstValueFrom(
      this.http.get<UtenteApi>(`${environment.apiUrl}/api/users/me`),
    );
  }

  updateMe(payload: AggiornamentoUtentePayload) {
    return firstValueFrom(
      this.http.put<UtenteApi>(`${environment.apiUrl}/api/users/me`, payload),
    );
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('immagine_profilo', file);
    return firstValueFrom(
      this.http.post<UtenteApi>(`${environment.apiUrl}/api/users/me/avatar`, formData),
    );
  }

  getUser(id: number | string) {
    return firstValueFrom(
      this.http.get<UtenteApi>(`${environment.apiUrl}/api/users/${id}`),
    );
  }

  getBookingsMe() {
    return firstValueFrom(
      this.http.get<PrenotazioneApi[]>(`${environment.apiUrl}/api/bookings/me`),
    );
  }

  createReview(payload: RecensionePayload) {
    return firstValueFrom(
      this.http.post<PrenotazioneApi[]>(`${environment.apiUrl}/api/reviews`, payload),
    );
  }

  getPurchasedMaterials() {
    return firstValueFrom(
      this.http.get<MaterialeAcquistatoApi[]>(
        `${environment.apiUrl}/api/materials/purchased/me`,
      ),
    );
  }

  downloadMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.get(`${environment.apiUrl}/api/materials/${materialeId}/download`, {
        responseType: 'blob',
      }),
    );
  }

  getConversations() {
    return firstValueFrom(
      this.http.get<ConversazioneApi[]>(`${environment.apiUrl}/api/messages`),
    );
  }

  getMessages(userId: number | string) {
    return firstValueFrom(
      this.http.get<MessaggioApi[]>(`${environment.apiUrl}/api/messages/${userId}`),
    );
  }

  markMessagesRead(userId: number | string) {
    return firstValueFrom(
      this.http.patch<RispostaOperazione>(
        `${environment.apiUrl}/api/messages/${userId}/read`,
        {},
      ),
    );
  }

  sendMessage(destinatarioId: number | string, contenuto: string) {
    return firstValueFrom(
      this.http.post<MessaggioApi[]>(`${environment.apiUrl}/api/messages`, {
        destinatario_id: destinatarioId,
        contenuto,
      }),
    );
  }

  getAdminUsers() {
    return firstValueFrom(
      this.http.get<UtenteAdmin[]>(`${environment.apiUrl}/api/admin/users`),
    );
  }

  updateUserStatus(id: number | string, stato: 'attivo' | 'bloccato') {
    return firstValueFrom(
      this.http.put<UtenteAdmin[]>(
        `${environment.apiUrl}/api/admin/users/${id}/status`,
        { stato },
      ),
    );
  }

  deleteUser(id: number | string) {
    return firstValueFrom(
      this.http.delete<UtenteAdmin[]>(`${environment.apiUrl}/api/admin/users/${id}`),
    );
  }
}
