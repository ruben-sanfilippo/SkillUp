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
