export interface DatiRegistrazione {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  tipologia_utente: string;
}

export type TipologiaUtente = 'studente' | 'tutor' | 'amministratore';

export interface RispostaLogin {
  token: string;
  tipologia_utente: TipologiaUtente;
}

export interface RispostaMessaggio {
  message?: string;
}

export interface RispostaOtpVerificato extends RispostaMessaggio {
  email: string;
  resetToken: string;
}
