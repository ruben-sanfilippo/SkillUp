import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/authService';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonIcon, IonInput],
})
export class RegisterPage implements OnInit {
  tipologia_utente = 'studente';
  nome = '';
  cognome = '';
  email = '';
  password = '';
  confermaPassword = '';

  messaggioErrore = '';
  erroreNome = false;
  erroreCognome = false;
  erroreEmail = false;
  errorePassword = false;
  erroreConfermaPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {}

  async gestisciRegistrazione() {
    this.resettaErrori();

    if (!this.nome) {
      this.erroreNome = true;
    }
    if (!this.cognome) {
      this.erroreCognome = true;
    }
    if (!this.email) {
      this.erroreEmail = true;
    }
    if (!this.password) {
      this.errorePassword = true;
    }
    if (!this.confermaPassword) {
      this.erroreConfermaPassword = true;
    }

    if (
      this.erroreNome ||
      this.erroreCognome ||
      this.erroreEmail ||
      this.errorePassword ||
      this.erroreConfermaPassword
    ) {
      this.messaggioErrore = 'Compila tutti i campi.';
      return;
    }
    if (
      this.password.length < 8 ||
      !/[A-Z]/.test(this.password) ||
      !/[0-9]/.test(this.password)
    ) {
      this.errorePassword = true;
      this.messaggioErrore =
        'La password deve contenere almeno 8 caratteri, una lettera maiuscola e un numero.';
      return;
    }

    if (this.password !== this.confermaPassword) {
      this.errorePassword = true;
      this.erroreConfermaPassword = true;
      this.messaggioErrore = 'Le password non coincidono.';
      return;
    }

    const datiRegistrazione = {
      nome: this.nome,
      cognome: this.cognome,
      email: this.email,
      password: this.password,
      tipologia_utente: this.tipologia_utente,
    };

    try {
      const risposta: any = await firstValueFrom(
        this.authService.register({
          ...datiRegistrazione,
          email: datiRegistrazione.email.toLowerCase(),
        }),
      );

      console.log('Registrazione riuscita');

      this.router.navigate(['/login']);
    } catch (error: any) {
      const messaggioServer =
        error?.error?.message || 'Errore di connessione al server.';
      this.messaggioErrore = messaggioServer;
    }
  }

  resettaErrori() {
    this.messaggioErrore = '';
    this.erroreNome = false;
    this.erroreCognome = false;
    this.erroreEmail = false;
    this.errorePassword = false;
    this.erroreConfermaPassword = false;
  }

  vaiAlLogin() {
    this.router.navigate(['/login']);
  }
}
