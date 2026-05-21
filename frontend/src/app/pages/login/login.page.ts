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

    const emailLower = this.email.toLowerCase();

    try {
      // Usiamo firstValueFrom per aspettare la risposta HTTP del servizio
      const risposta: any = await firstValueFrom(
        this.authService.login(this.email, this.password),
      );

      console.log('Login riuscito, ecco i dati:', risposta);

      // salvo il token nel localStorage:
      localStorage.setItem('token', risposta.token);

      this.router.navigateByUrl('/tabs');
    } catch (error: any) {
      // Catturiamo l'errore del tuo backend
      const messaggioServer =
        error?.error?.message || 'Errore di connessione al server.';
    }

    if (emailLower.includes('admin')) {
      this.router.navigate(['/admin-view']); // Vista amministratore desktop a schermo intero
    } else if (emailLower.includes('tutor')) {
      this.router.navigate(['/tabs/tutor-dashboard']); // Vista Tutor interna al guscio Tabs
    } else {
      this.router.navigate(['/tabs/search-tutor']); // Vista Studente interna al guscio Tabs
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
