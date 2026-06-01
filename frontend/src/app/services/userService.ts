import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  AggiornamentoUtentePayload,
  UtenteApi,
} from '../interfaces/user.interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
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
}
