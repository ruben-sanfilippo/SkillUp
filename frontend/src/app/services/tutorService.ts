import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  AggiornamentoTutorPayload,
  DatiMaterialeDidattico,
  DisponibilitaTutor,
  FiltriRicerca,
  MaterialeDidatticoApi,
  PrenotazionePayload,
  TutorApi,
} from '../interfaces/tutor.interfaces';
import type { PrenotazioneApi, RispostaOperazione } from '../interfaces/api.interfaces';

export type {
  AggiornamentoTutorPayload,
  DatiMaterialeDidattico,
  DisponibilitaTutor,
  FiltriRicerca,
  MaterialeDidatticoApi,
  PrenotazionePayload,
  TutorApi,
} from '../interfaces/tutor.interfaces';

@Injectable({
  providedIn: 'root',
})
export class TutorService {
  constructor(private http: HttpClient) {}

  async ricercaTutors(filtri: FiltriRicerca): Promise<TutorApi[]> {
    const url = `${environment.apiUrl}/api/tutors/search`;
    return firstValueFrom(this.http.post<TutorApi[]>(url, filtri));
  }

  getTutor(id: number | string) {
    return firstValueFrom(
      this.http.get<TutorApi>(`${environment.apiUrl}/api/tutors/${id}`),
    );
  }

  getTutorMe() {
    return firstValueFrom(
      this.http.get<TutorApi>(`${environment.apiUrl}/api/tutors/me`),
    );
  }

  updateTutorMe(payload: AggiornamentoTutorPayload) {
    return firstValueFrom(
      this.http.put<TutorApi>(`${environment.apiUrl}/api/tutors/me`, payload),
    );
  }

  updateDisponibilitaMe(disponibilita: DisponibilitaTutor[], tariffaOraria: number) {
    return firstValueFrom(
      this.http.put<DisponibilitaTutor[] | RispostaOperazione>(
        `${environment.apiUrl}/api/tutors/me/availability`,
        {
        disponibilita,
        tariffa_oraria: tariffaOraria,
        },
      ),
    );
  }

  createMaterial(payload: DatiMaterialeDidattico) {
    return firstValueFrom(
      this.http.post<MaterialeDidatticoApi>(`${environment.apiUrl}/api/materials`, {
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
      this.http.delete<RispostaOperazione>(
        `${environment.apiUrl}/api/materials/${materialeId}`,
      ),
    );
  }

  purchaseMaterial(materialeId: number | string) {
    return firstValueFrom(
      this.http.post<MaterialeDidatticoApi | RispostaOperazione>(
        `${environment.apiUrl}/api/materials/${materialeId}/purchase`,
        {},
      ),
    );
  }

  createBooking(payload: PrenotazionePayload) {
    return firstValueFrom(
      this.http.post<PrenotazioneApi>(`${environment.apiUrl}/api/bookings`, payload),
    );
  }
}
