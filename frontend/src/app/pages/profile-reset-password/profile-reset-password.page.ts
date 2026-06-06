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
  arrowBackOutline,
  checkmarkCircleOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/authService';

@Component({
  selector: 'app-profile-reset-password',
  templateUrl: './profile-reset-password.page.html',
  styleUrls: ['../reset-password/reset-password.page.scss'],
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonIcon, IonInput],
})
export class ProfileResetPasswordPage implements OnInit {
  nuovaPassword = '';
  confermaNuovaPassword = '';
  messaggioErrore = '';
  messaggioSuccesso = '';
  errorePassword = false;
  erroreConfermaPassword = false;
  isLoading = false;
  private email = '';
  private resetToken = '';
  private returnUrl = '/tabs/search-tutor';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      lockClosedOutline,
    });
  }

  ngOnInit() {
    this.email = sessionStorage.getItem('skillup_profile_reset_email') || '';
    this.resetToken = sessionStorage.getItem('skillup_profile_reset_token') || '';
    this.returnUrl =
      sessionStorage.getItem('skillup_profile_return_url') || this.returnUrl;

    if (!this.email || !this.resetToken) {
      this.router.navigate([this.returnUrl]);
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
      this.pulisciSessioneReset();
      this.messaggioSuccesso = 'Password modificata con successo.';
      setTimeout(() => this.router.navigate([this.returnUrl]), 1200);
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

  tornaAlProfilo() {
    this.pulisciSessioneReset();
    this.router.navigate([this.returnUrl]);
  }

  private pulisciSessioneReset() {
    sessionStorage.removeItem('skillup_profile_reset_email');
    sessionStorage.removeItem('skillup_profile_reset_token');
    sessionStorage.removeItem('skillup_profile_return_url');
  }
}
