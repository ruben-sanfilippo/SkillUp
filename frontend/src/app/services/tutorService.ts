import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  DatiMaterialeDidattico,
  DisponibilitaTutor,
  FiltriRicerca,
} from '../interfaces/tutor.interfaces';

export type {
  DatiMaterialeDidattico,
  DisponibilitaTutor,
  FiltriRicerca,
} from '../interfaces/tutor.interfaces';

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

  createMaterial(payload: DatiMaterialeDidattico) {
    return firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/api/materials`, {
        titolo: payload.titolo,
        descrizione: payload.descrizione,
        materia: payload.materia,
        file_url: payload.urlFile,
        anteprima_url: payload.urlAnteprima,
        copertina_url: payload.urlCopertina,
        importo: payload.importo,
      }),
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
