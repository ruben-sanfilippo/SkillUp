export interface DatiMaterialeDidattico {
  titolo: string;
  descrizione: string;
  materia?: string;
  file: File;
  anteprima?: File | null;
  copertina?: File | null;
  importo: number;
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

export interface MaterialeAcquistatoApi {
  id: number;
  materiale_id?: number;
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
