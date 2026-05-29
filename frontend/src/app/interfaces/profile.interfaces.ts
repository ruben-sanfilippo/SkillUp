import type { SafeResourceUrl } from '@angular/platform-browser';

export interface DatiStudente {
  nome: string;
  cognome: string;
  immagineProfilo: string;
  biografia: string;
  sessioniCompletate: number;
  oreStudio: number;
}

export interface PrenotazioneProfilo {
  id: string | number;
  nomeTutor: string;
  avatarTutor: string;
  materia: string;
  dataOra: Date;
  dataItaliana: string;
  oraInizio: string;
  oraFine: string;
  stato: 'IN PROGRAMMA' | 'COMPLETATA';
  recensita: boolean;
}

export interface MaterialeAcquistato {
  id: string | number;
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
  fileCompleto?: File | null;
  urlFile?: string;
  haAnteprima: boolean;
  haFileCompleto: boolean;
}
