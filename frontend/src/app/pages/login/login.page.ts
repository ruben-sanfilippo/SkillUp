import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonLabel,
  IonList, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonLabel,
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

  constructor(private router: Router) {
    // Iniezione ottimizzata icone Standalone
    addIcons({ mailOutline, lockClosedOutline, arrowForwardOutline });
  }

  ngOnInit() {}

  gestisciLogin() {
    if (!this.email || !this.password) {
      alert('Compila tutti i campi richiesti.');
      return;
    }

    const emailLower = this.email.toLowerCase();

    // Reindirizzamento basato sui ruoli definiti nel file app.routes.ts
    if (emailLower.includes('admin')) {
      this.router.navigate(['/admin-view']); // Pannello di controllo a schermo intero
    } else if (emailLower.includes('tutor')) {
      this.router.navigate(['/tabs/tutor-dashboard']); // Reindirizza all'area protetta delle tabs
    } else {
      this.router.navigate(['/tabs/search-tutor']); // Atterra sul motore di ricerca interno
    }
  }

  vaiAlRegister() {
    this.router.navigate(['/register']);
  }

  recuperaPassword() {
    console.log('Procedura recupero credenziali avviata');
  }
}