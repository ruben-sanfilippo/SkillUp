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
import { mailOutline, lockClosedOutline, arrowForwardOutline } from 'ionicons/icons';

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

  constructor(private router: Router) {
    addIcons({ mailOutline, lockClosedOutline, arrowForwardOutline });
  }

  ngOnInit() {}

  gestisciLogin() {
    if (!this.email || !this.password) {
      alert('Per favore, compila tutti i campi richiesti.');
      return;
    }

    const emailLower = this.email.toLowerCase();

    // Logica di routing condizionale definita in base al ruolo utente
    if (emailLower.includes('admin')) {
      this.router.navigate(['/admin-view']); // Vista amministratore desktop a schermo intero
    } else if (emailLower.includes('tutor')) {
      this.router.navigate(['/tabs/tutor-dashboard']); // Vista Tutor interna al guscio Tabs
    } else {
      this.router.navigate(['/tabs/search-tutor']); // Vista Studente interna al guscio Tabs
    }
  }  

  vaiAlRegister() {
    this.router.navigate(['/register']);
  }

  recuperaPassword() {
    console.log('Link di recupero credenziali premuto');
  }
}