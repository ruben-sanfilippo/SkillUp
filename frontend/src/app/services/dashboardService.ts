import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RicavoMensile {
  mese: string;
  ricavi: number;
}

export interface MateriaPiuPrenotata {
  nome: string;
  prenotazioni: number;
}

export interface StatisticaMateriale {
  id: number;
  titolo: string;
  materia: string;
  acquisti: number;
  ricavi: number;
}

export interface ProssimaLezione {
  id: number;
  studente_id: number;
  studenteNome: string;
  studenteEmail: string;
  studenteAvatar: string;
  materia: string;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  importo: number;
}

export interface TutorDashboardStats {
  anno: number;
  ricaviMensili: RicavoMensile[];
  materiaPiuPrenotata: MateriaPiuPrenotata | null;
  materialePiuAcquistato: StatisticaMateriale | null;
  materiali: StatisticaMateriale[];
  prossimeLezioni: ProssimaLezione[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getTutorDashboard() {
    return firstValueFrom(
      this.http.get<TutorDashboardStats>(
        `${environment.apiUrl}/api/dashboard/tutor`,
      ),
    );
  }
}
