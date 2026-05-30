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
  materiaId?: number;
  materia_id?: number;
  materia?: string;
  attivo?: boolean;
  dalle?: string;
  alle?: string;
  oraInizio?: string;
  oraFine?: string;
  ora_inizio?: string;
  ora_fine?: string;
  tariffaOraria?: number;
  tariffa_oraria?: number;
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

export interface TutorApi {
  id: number;
  name: string;
  nome: string;
  cognome: string;
  email: string;
  bio: string;
  subjects: string[];
  subjectOptions: MateriaTutor[];
  languages: string[];
  rating: number | string;
  reviews: number;
  price: number;
  image: string;
  disponibileDal?: string;
  disponibileAl?: string;
  availability?: DisponibilitaTutor[];
  schedule?: DisponibilitaTutor[];
  availableSchedule?: DisponibilitaTutor[];
  bookedSlots?: SlotPrenotato[];
  materials?: MaterialeDidatticoApi[];
  opzione_trasferimento?: OpzioneTrasferimentoTutor;
}

export interface AggiornamentoTutorPayload {
  nome?: string;
  cognome?: string;
  bio?: string;
  immagine_profilo?: string;
  materie?: string[];
  lingue?: string[];
  opzione_trasferimento?: OpzioneTrasferimentoPayload;
}

export interface OpzioneTrasferimentoTutor {
  presente: boolean;
  titolare_conto?: string;
  iban?: string;
}

export interface OpzioneTrasferimentoPayload {
  titolare_conto: string;
  iban: string;
}

export interface MaterialeDidatticoApi {
  id: number;
  titolo: string;
  descrizione?: string;
  file_url: string;
  anteprima_url?: string;
  copertina_url?: string;
  importo: number;
  materia?: string;
  acquistato?: number | boolean;
}

export interface PrenotazionePayload {
  disponibilita_id: number | string | undefined;
  materia_id?: number | string | null;
  data: string | undefined;
  ora_inizio: string;
  ora_fine: string;
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
  materiaId?: number;
  materia_id?: number;
  data: string;
  oraInizio: string;
  oraFine: string;
  ora_inizio?: string;
  ora_fine?: string;
}

export interface GiornoCalendario {
  giorno: number;
  dataIso: string;
  info: InfoDisponibilita;
}
