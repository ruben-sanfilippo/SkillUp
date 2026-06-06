import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/authService';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonIcon, IonInput],
})
export class ResetPasswordPage implements OnInit {
  nuovaPassword = '';
  confermaNuovaPassword = '';
  messaggioErrore = '';
  messaggioSuccesso = '';
  errorePassword = false;
  erroreConfermaPassword = false;
  isLoading = false;
  private email = '';
  private resetToken = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({
      alertCircleOutline,
      checkmarkCircleOutline,
      lockClosedOutline,
    });
  }

  ngOnInit() {
    this.email = sessionStorage.getItem('skillup_reset_email') || '';
    this.resetToken = sessionStorage.getItem('skillup_reset_token') || '';

    if (!this.email || !this.resetToken) {
      this.router.navigate(['/recupera-password']);
    }
  }

  async confermaModificaPassword() {
    this.resettaMessaggi();

    if (!this.nuovaPassword) {
      this.errorePassword = true;
    }
    if (!this.confermaNuovaPassword) {
      this.erroreConfermaPassword = true;
    }
    if (this.errorePassword || this.erroreConfermaPassword) {
      this.messaggioErrore = 'Compila tutti i campi.';
      return;
    }
    if (
      this.nuovaPassword.length < 8 ||
      !/[A-Z]/.test(this.nuovaPassword) ||
      !/[0-9]/.test(this.nuovaPassword)
    ) {
      this.errorePassword = true;
      this.messaggioErrore =
        'La password deve contenere almeno 8 caratteri, una lettera maiuscola e un numero.';
      return;
    }
    if (this.nuovaPassword !== this.confermaNuovaPassword) {
      this.errorePassword = true;
      this.erroreConfermaPassword = true;
      this.messaggioErrore = 'Le password non coincidono.';
      return;
    }

    try {
      this.isLoading = true;
      await firstValueFrom(
        this.authService.modificaPassword(
          this.email,
          this.resetToken,
          this.nuovaPassword,
        ),
      );
      sessionStorage.removeItem('skillup_reset_email');
      sessionStorage.removeItem('skillup_reset_token');
      localStorage.removeItem('token');
      localStorage.removeItem('tipologia_utente');
      localStorage.removeItem('skillup_messaggi_non_letti');
      this.messaggioSuccesso = 'Password modificata con successo.';
      setTimeout(() => this.router.navigate(['/login']), 1200);
    } catch (error: any) {
      this.messaggioErrore =
        error?.error?.message || 'Non è stato possibile modificare la password.';
    } finally {
      this.isLoading = false;
    }
  }

  resettaMessaggi() {
    this.messaggioErrore = '';
    this.messaggioSuccesso = '';
    this.errorePassword = false;
    this.erroreConfermaPassword = false;
  }
}
