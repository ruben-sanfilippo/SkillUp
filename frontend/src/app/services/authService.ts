import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  login(email: string, password: string) {
    const url = `${environment.apiUrl}/api/auth/login`;
    return this.httpClient.post(url, { email: email, password: password });
  }
}
