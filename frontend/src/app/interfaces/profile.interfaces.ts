import type { SafeResourceUrl } from '@angular/platform-browser';

export interface DatiStudente {
  nome: string;
  cognome: string;
  immagineProfilo: string;
  biografia: string;
  sessioniCompletate: number;
  oreStudio: number;
}

export interface SelezioneAvatar {
  file: File;
  anteprima: string;
}

export interface PrenotazioneProfilo {
  id: string | number;
  tutorId: string | number;
  nomeTutor: string;
  avatarTutor: string;
  materia: string;
  dataOra: Date;
  dataFine: Date;
  dataItaliana: string;
  oraInizio: string;
  oraFine: string;
  stato: 'IN PROGRAMMA' | 'IN CORSO' | 'COMPLETATA';
  recensita: boolean;
}

export interface MaterialeAcquistato {
  id: string | number;
  materialeId?: string | number;
  titolo: string;
  autore: string;
  tipo: 'pdf' | 'appunti';
  etichettaFile: string;
  dimensioneMb: string;
  urlFile?: string;
  urlCopertina?: string;
  urlAnteprima?: string | SafeResourceUrl;
  urlAnteprimaRaw?: string;
  anteprimaPdf?: boolean;
}

export interface Dispensa {
  id?: number | string;
  titolo: string;
  descrizione: string;
  prezzo: number | null;
  urlCopertina?: string;
  urlAnteprima?: string | SafeResourceUrl;
  urlAnteprimaRaw?: string;
  anteprimaPdf?: boolean;
  fileCopertina?: File | null;
  fileAnteprima?: File | null;
  fileCompleto?: File | null;
  urlFile?: string;
  haAnteprima: boolean;
  haFileCompleto: boolean;
}
