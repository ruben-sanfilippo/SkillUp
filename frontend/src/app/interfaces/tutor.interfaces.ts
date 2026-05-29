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
  giornoSettimana?: string;
  materiaId?: number;
  materia?: string;
  attivo?: boolean;
  dalle?: string;
  alle?: string;
  oraInizio?: string;
  oraFine?: string;
  tariffaOraria?: number;
}

export interface DatiMaterialeDidattico {
  titolo: string;
  descrizione: string;
  materia?: string;
  urlFile: string;
  urlAnteprima?: string;
  urlCopertina?: string;
  importo: number;
}

export interface MateriaTutor {
  id: number;
  nome: string;
}

export interface FasciaDisponibilita {
  id?: number;
  dalle: string;
  alle: string;
  orariInizio?: string[];
  orariFinePerInizio?: Record<string, string[]>;
}

export interface InfoDisponibilita {
  id?: number;
  attivo: boolean;
  dalle: string;
  alle: string;
  fasce?: FasciaDisponibilita[];
}

export interface SlotPrenotato {
  materiaId: number;
  data: string;
  oraInizio: string;
  oraFine: string;
}

export interface GiornoCalendario {
  giorno: number;
  dataIso: string;
  info: InfoDisponibilita;
}
