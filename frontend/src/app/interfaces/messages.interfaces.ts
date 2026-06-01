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

export interface MessaggioChat {
  id: string | number;
  testo: string;
  orario: string;
  mittente: 'studente' | 'tutor';
}

export interface ConversazioneChat {
  id: string | number;
  utenteId: number;
  nome: string;
  immagineProfilo: string;
  ultimoMessaggioTesto: string;
  ultimoMessaggioOrario: string;
  ultimoMessaggioData: string;
  nonLetta: boolean;
  messaggi: MessaggioChat[];
}
