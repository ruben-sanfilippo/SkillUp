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
  studenteId: number;
  studenteNome: string;
  studenteEmail: string;
  studenteAvatar: string;
  materia: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  importo: number;
}

export interface StatisticheDashboardTutor {
  anno: number;
  ricaviMensili: RicavoMensile[];
  materiaPiuPrenotata: MateriaPiuPrenotata | null;
  materialePiuAcquistato: StatisticaMateriale | null;
  materiali: StatisticaMateriale[];
  prossimeLezioni: ProssimaLezione[];
}
