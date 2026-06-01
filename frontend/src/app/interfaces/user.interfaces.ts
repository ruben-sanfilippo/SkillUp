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
  metodo_pagamento?: MetodoPagamentoStudente;
}

export interface MetodoPagamentoStudente {
  presente: boolean;
  titolare?: string;
  scadenza?: string;
  ultime_quattro?: string;
  carta_mascherata?: string;
}

export interface MetodoPagamentoPayload {
  numero_carta: string;
  scadenza: string;
  titolare: string;
  cvv: string;
}

export interface AggiornamentoUtentePayload {
  nome?: string;
  cognome?: string;
  immagine_profilo?: string;
  bio?: string;
  metodo_pagamento?: MetodoPagamentoPayload;
}
