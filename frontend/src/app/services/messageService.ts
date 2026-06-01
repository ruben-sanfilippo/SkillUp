import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  ConversazioneApi,
  MessaggioApi,
} from '../interfaces/messages.interfaces';
import type {
  RispostaOperazione,
} from '../interfaces/risposta.interfaces';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}

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
}
