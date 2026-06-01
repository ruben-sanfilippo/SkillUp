import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type {
  AggiornamentoTutorPayload,
  DisponibilitaTutor,
  FiltriRicerca,
  TutorApi,
} from '../interfaces/tutor.interfaces';
import type { RispostaOperazione } from '../interfaces/risposta.interfaces';

export type {
  AggiornamentoTutorPayload,
  DisponibilitaTutor,
  FiltriRicerca,
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
}
