import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { UtenteAdmin } from '../interfaces/admin.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

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
