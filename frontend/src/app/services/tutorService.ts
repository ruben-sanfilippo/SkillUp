import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FiltriRicerca {
  testo: string;
  materie: string[];
  lingue: string[];
  prezzoMin: number;
  prezzoMax: number;
  dataDa: string;
  dataA: string;
}

export interface DisponibilitaTutor {
  id?: number;
  data: string;
  giorno_settimana?: string;
  materia_id?: number;
  materia?: string;
  attivo?: boolean;
  dalle?: string;
  alle?: string;
  ora_inizio?: string;
  ora_fine?: string;
  tariffa_oraria?: number;
}

export interface MaterialeDidatticoPayload {
  titolo: string;
  descrizione: string;
  materia?: string;
  file_url: string;
  anteprima_url?: string;
  copertina_url?: string;
  importo: number;
}

@Injectable({
  providedIn: 'root',
})
export class TutorService {
  constructor(private http: HttpClient) {}

  async ricercaTutors(filtri: FiltriRicerca): Promise<any[]> {
    const url = `${environment.apiUrl}/api/tutors/search`;
    return firstValueFrom(this.http.post<any[]>(url, filtri));
  }

  getTutor(id: number | string) {
    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/api/tutors/${id}`),
    );
  }

  getTutorMe() {
    return firstValueFrom(this.http.get<any>(`${environment.apiUrl}/api/tutors/me`));
  }

  updateTutorMe(payload: any) {
    return firstValueFrom(
      this.http.put<any>(`${environment.apiUrl}/api/tutors/me`, payload),
    );
  }

  updateDisponibilitaMe(disponibilita: DisponibilitaTutor[], tariffaOraria: number) {
    return firstValueFrom(
      this.http.put<any>(`${environment.apiUrl}/api/tutors/me/availability`, {
        disponibilita,
        tariffa_oraria: tariffaOraria,
      }),
    );
  }

  createMaterial(payload: MaterialeDidatticoPayload) {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/api/materials`, payload),
    );
  }

  deleteMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.delete<any>(`${environment.apiUrl}/api/materials/${materialeId}`),
    );
  }

  purchaseMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.post<any>(
        `${environment.apiUrl}/api/materials/${materialeId}/purchase`,
        {},
      ),
    );
  }

  createBooking(payload: any) {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/api/bookings`, payload),
    );
  }
}
