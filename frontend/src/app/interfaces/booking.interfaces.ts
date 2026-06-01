export interface PrenotazioneApi {
  id: number;
  disponibilita_id?: number;
  studente_id: number;
  tutor_id: number;
  tutorId?: number;
  materia_id: number;
  materia: string;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  importo: number;
  tutorName?: string;
  tutorAvatar?: string;
  nomeTutor?: string;
  avatarTutor?: string;
  tutor_nome?: string;
  tutor_cognome?: string;
  immagine_profilo_tutor?: string;
  tutor_immagine_profilo?: string;
  studentName?: string;
  hasReviewed?: number | boolean;
  recensita?: number | boolean;
}

export interface PrenotazionePayload {
  disponibilita_id: number | string | undefined;
  materia_id?: number | string | null;
  data: string | undefined;
  ora_inizio: string;
  ora_fine: string;
}
