import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonButton, 
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonButton, 
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonInput
  ]
})
export class RegisterPage implements OnInit {
  
  tipologia_utente = 'studente'; 
  nome = '';
  cognome = '';
  email = '';
  password = '';
  confermaPassword = '';

  constructor(private router: Router) {
    addIcons({ personOutline, mailOutline, lockClosedOutline, checkmarkCircleOutline });
  }

  ngOnInit() {}

  gestisciRegistrazione() {
    if (!this.nome || !this.cognome || !this.email || !this.password || !this.confermaPassword) {
      alert('Compila tutti i campi.');
      return;
    }

    if (this.password !== this.confermaPassword) {
      alert('Le password non coincidono.');
      return;
    }

    const datiRegistrazione = {
      nome: this.nome,
      cognome: this.cognome,
      email: this.email,
      password: this.password, 
      tipologia_utente: this.tipologia_utente
    };

    console.log('Payload per il backend Node.js:', datiRegistrazione);
    
    alert('Registrazione completata!');
    this.router.navigate(['/login']);
  }

  vaiAlLogin() {
    this.router.navigate(['/login']);
  }
}