export interface UtenteAdmin {
  id: string | number;
  nome: string;
  cognome: string;
  email: string;
  immagineProfilo: string;
  ruolo: 'Studente' | 'Tutor';
  dataIscrizione: Date;
  dataIscrizioneFormattata: string;
  stato: 'Attivo' | 'Bloccato';
}
