import type { RispostaMessaggio } from './auth.interfaces';

export interface UtenteApi {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  immagine_profilo?: string;
  stato?: 'attivo' | 'bloccato';
  tipologia_utente: 'studente' | 'tutor' | 'amministratore';
  data_iscrizione?: string;
  bio?: string;
}

export interface AggiornamentoUtentePayload {
  nome?: string;
  cognome?: string;
  immagine_profilo?: string;
  bio?: string;
}

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

export interface RecensionePayload {
  prenotazione_id: string | number;
  voto: number;
  commento?: string;
}

export interface MaterialeAcquistatoApi {
  id: number;
  titolo: string;
  descrizione?: string;
  autore: string;
  file_url: string;
  anteprima_url?: string;
  copertina_url?: string;
  importo: number;
  importo_pagato?: number;
  data_acquisto?: string;
}

export interface ConversazioneApi {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  immagine_profilo?: string;
  lastMessageTime?: string;
  lastMessageText?: string;
  unreadCount?: number;
}

export interface MessaggioApi {
  id: number;
  mittente_id: number;
  destinatario_id: number;
  contenuto: string;
  data_invio: string;
  letto?: number;
}

export type RispostaOperazione = RispostaMessaggio & Record<string, unknown>;
