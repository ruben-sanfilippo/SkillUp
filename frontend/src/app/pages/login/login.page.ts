import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, arrowForwardOutline, alertCircleOutline } from 'ionicons/icons';

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
    IonIcon
  ]  
})

export class LoginPage implements OnInit {
  email = '';
  password = '';

  messaggioErrore = '';
  erroreEmail = false;
  errorePassword = false;

  constructor(private router: Router) {
    addIcons({ mailOutline, lockClosedOutline, arrowForwardOutline, alertCircleOutline });
  }

  ngOnInit() {}

  gestisciLogin() {
    this.resettaErrori();

    if (!this.email) { this.erroreEmail = true; }
    if (!this.password) { this.errorePassword = true; }

    if (this.erroreEmail || this.errorePassword) {
      this.messaggioErrore = 'Compila tutti i campi richiesti.';
      return;
    }

    const emailLower = this.email.toLowerCase();

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