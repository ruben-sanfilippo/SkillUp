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

@Injectable({
  providedIn: 'root',
})
export class TutorService {
  // SPOSTIAMO QUI I DATI FITTIZI (Fingiamo che sia il Database del tuo backend)
  private tutorsMock = [
    {
      id: 1,
      name: 'Dr.ssa Elena Rostova',
      subjects: ['Matematica', 'Fisica'],
      bio: 'Dottorato in Matematica.',
      rating: 4.9,
      reviews: 124,
      price: 45,
      image: 'https://i.pravatar.cc/150?img=1',
      disponibileDal: '2026-05-01',
      disponibileAl: '2026-07-31',
      languages: ['Italiano', 'Inglese'],
    },
    {
      id: 2,
      name: 'Marco Chen',
      subjects: ['Fisica', 'Informatica'],
      bio: 'Ex ingegnere.',
      rating: 5.0,
      reviews: 89,
      price: 60,
      image: 'https://i.pravatar.cc/150?img=11',
      disponibileDal: '2026-06-15',
      disponibileAl: '2026-12-31',
      languages: ['Italiano', 'Francese'],
    },
    {
      id: 3,
      name: 'Sara Jenkins',
      subjects: ['Letteratura', 'Inglese'],
      bio: 'Appassionata di scrittura.',
      rating: 4.8,
      reviews: 210,
      price: 35,
      image: 'https://i.pravatar.cc/150?img=5',
      disponibileDal: '2026-01-01',
      disponibileAl: '2026-06-10',
      languages: ['Inglese', 'Spagnolo'],
    },
  ];

  constructor(private http: HttpClient) {}

  // METODO CHE CHIAMEREMO DALLA PAGINA
  async ricercaTutors(filtri: FiltriRicerca): Promise<any[]> {
    // ==========================================
    // FASE 1: SIMULAZIONE ATTUALE (Finge di essere il Backend)
    // ==========================================
    const risultati = this.tutorsMock.filter((tutor) => {
      const matchTesto =
        !filtri.testo ||
        tutor.name.toLowerCase().includes(filtri.testo.toLowerCase());
      const matchMateria =
        filtri.materie.length === 0 ||
        filtri.materie.some((m) => tutor.subjects.includes(m));
      const matchLingua =
        filtri.lingue.length === 0 ||
        filtri.lingue.some((l) => tutor.languages.includes(l));
      const matchPrezzo =
        tutor.price >= filtri.prezzoMin && tutor.price <= filtri.prezzoMax;

      let matchData = true;
      if (filtri.dataDa && tutor.disponibileAl < filtri.dataDa)
        matchData = false;
      if (filtri.dataA && tutor.disponibileDal > filtri.dataA)
        matchData = false;

      return (
        matchTesto && matchMateria && matchLingua && matchPrezzo && matchData
      );
    });

    // Simuliamo un ritardo di rete di 600 millisecondi per rendere realistico il caricamento
    return new Promise((resolve) => setTimeout(() => resolve(risultati), 600));

    // ==========================================
    // FASE 2: IL CODICE REALE (Da decommentare in futuro)
    // ==========================================
    /*
    const url = `${environment.apiUrl}/api/tutors/search`;
    return await firstValueFrom(this.http.post<any[]>(url, filtri));
    */
  }
}
