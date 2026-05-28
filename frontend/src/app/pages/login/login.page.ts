import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import {
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  arrowForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  messaggioErrore = '';
  erroreEmail = false;
  errorePassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {}

  async gestisciLogin() {
    this.resettaErrori();

    if (!this.email) {
      this.erroreEmail = true;
    }
    if (!this.password) {
      this.errorePassword = true;
    }

    if (this.erroreEmail || this.errorePassword) {
      this.messaggioErrore = 'Compila tutti i campi richiesti.';
      return;
    }

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('tipologia_utente');

      // Usiamo firstValueFrom per aspettare la risposta HTTP del servizio
      const risposta: any = await firstValueFrom(
        this.authService.login(this.email.toLowerCase(), this.password),
      );
      const tipologiaUtente = risposta.tipologia_utente?.toLowerCase();

      if (!risposta.token || !tipologiaUtente) {
        this.messaggioErrore = 'Risposta del server non valida.';
        return;
      }

      console.log('Login riuscito, ecco i dati:', tipologiaUtente);

      // salvo il token e la tipologia nel localStorage:
      localStorage.setItem('token', risposta.token);
      localStorage.setItem('tipologia_utente', tipologiaUtente);

      if (tipologiaUtente === 'amministratore') {
        this.router.navigate(['/admin-view']);
      } else if (tipologiaUtente === 'tutor') {
        this.router.navigate(['/tabs/tutor-dashboard']);
      } else {
        this.router.navigate(['/tabs/search-tutor']);
      }
    } catch (error: any) {
      const messaggioServer =
        error?.error?.message || 'Errore di connessione al server.';
      this.messaggioErrore = messaggioServer;
    }
  }

  resettaErrori() {
    this.messaggioErrore = '';
    this.erroreEmail = false;
    this.errorePassword = false;
  }

  vaiAlRegister() {
    this.router.navigate(['/register']);
  }

  recuperaPassword() {
    console.log('Link di recupero credenziali premuto');
  }
}
