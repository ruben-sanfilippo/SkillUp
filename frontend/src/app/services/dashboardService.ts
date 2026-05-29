import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { StatisticheDashboardTutor } from '../interfaces/dashboard.interfaces';

export type {
  MateriaPiuPrenotata,
  ProssimaLezione,
  RicavoMensile,
  StatisticheDashboardTutor,
  StatisticaMateriale,
} from '../interfaces/dashboard.interfaces';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getTutorDashboard() {
    return firstValueFrom(
      this.http.get<any>(
        `${environment.apiUrl}/api/dashboard/tutor`,
      ),
    ).then((stats) => ({
      ...stats,
      prossimeLezioni: (stats.prossimeLezioni || []).map((lezione: any) => ({
        ...lezione,
        studenteId: lezione.studente_id,
        oraInizio: lezione.ora_inizio,
        oraFine: lezione.ora_fine,
      })),
    }) as StatisticheDashboardTutor);
  }
}
