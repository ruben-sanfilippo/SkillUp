import { Component } from '@angular/core';
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
  arrowForwardOutline,
  keyOutline,
  mailOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/authService';

@Component({
  selector: 'app-profile-password',
  templateUrl: './profile-password.page.html',
  styleUrls: ['../forgot-password/forgot-password.page.scss'],
  standalone: true,
  imports: [FormsModule, IonButton, IonContent, IonIcon, IonInput],
})
export class ProfilePasswordPage {
  email = '';
  otp = '';
  otpInviato = false;
  isLoading = false;
  messaggioErrore = '';
  messaggioSuccesso = '';
  erroreEmail = false;
  erroreOtp = false;
  private returnUrl = '/tabs/search-tutor';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      arrowForwardOutline,
      keyOutline,
      mailOutline,
    });

    const state = this.router.getCurrentNavigation()?.extras.state as
      | { email?: string; returnUrl?: string }
      | undefined;
    this.email = state?.email?.trim().toLowerCase() || '';
    this.returnUrl = state?.returnUrl || this.returnUrl;
  }

  async inviaOtp() {
    this.resettaMessaggi();
    const emailNormalizzata = this.email.trim().toLowerCase();
    if (!emailNormalizzata) {
      this.erroreEmail = true;
      this.messaggioErrore = 'E-mail non trovata nel profilo.';
      return;
    }

    try {
      this.isLoading = true;
      await firstValueFrom(this.authService.richiediOtpPassword(emailNormalizzata));
      this.email = emailNormalizzata;
      this.otpInviato = true;
      this.messaggioSuccesso = 'Codice OTP inviato alla tua e-mail.';
    } catch (error: any) {
      this.messaggioErrore =
        error?.error?.message || 'Non è stato possibile inviare il codice OTP.';
    } finally {
      this.isLoading = false;
    }
  }

  async verificaOtp() {
    this.resettaMessaggi();
    const codice = this.otp.trim();

    if (!codice) {
      this.erroreOtp = true;
      this.messaggioErrore = 'Inserisci il codice OTP ricevuto.';
      return;
    }

    try {
      this.isLoading = true;
      const risposta = await firstValueFrom(
        this.authService.verificaOtpPassword(this.email, codice),
      );
      sessionStorage.setItem('skillup_profile_reset_email', risposta.email);
      sessionStorage.setItem('skillup_profile_reset_token', risposta.resetToken);
      sessionStorage.setItem('skillup_profile_return_url', this.returnUrl);
      this.router.navigate(['/conferma-password-profilo']);
    } catch (error: any) {
      this.messaggioErrore =
        error?.error?.message || 'Codice OTP non valido o scaduto.';
    } finally {
      this.isLoading = false;
    }
  }

  resettaMessaggi() {
    this.messaggioErrore = '';
    this.messaggioSuccesso = '';
    this.erroreEmail = false;
    this.erroreOtp = false;
  }

  tornaAlProfilo() {
    this.router.navigate([this.returnUrl]);
  }
}
