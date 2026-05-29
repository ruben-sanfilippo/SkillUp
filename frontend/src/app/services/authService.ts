import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

type DatiRegistrazione = {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  tipologia_utente: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  login(email: string, password: string) {
    const url = `${environment.apiUrl}/api/auth/login`;
    return this.httpClient.post(url, { email: email, password: password });
  }

  register(datiRegistrazione: DatiRegistrazione) {
    const url = `${environment.apiUrl}/api/auth/register`;
    return this.httpClient.post(url, {
      nome: datiRegistrazione.nome,
      cognome: datiRegistrazione.cognome,
      email: datiRegistrazione.email,
      password: datiRegistrazione.password,
      tipologia_utente: datiRegistrazione.tipologia_utente,
    });
  }

  richiediOtpPassword(email: string) {
    return this.httpClient.post(`${environment.apiUrl}/api/auth/password/otp`, {
      email,
    });
  }

  verificaOtpPassword(email: string, otp: string) {
    return this.httpClient.post<any>(
      `${environment.apiUrl}/api/auth/password/verify-otp`,
      { email, otp },
    );
  }

  modificaPassword(email: string, resetToken: string, nuovaPassword: string) {
    return this.httpClient.post(`${environment.apiUrl}/api/auth/password/reset`, {
      email,
      resetToken,
      nuovaPassword,
    });
  }
}
