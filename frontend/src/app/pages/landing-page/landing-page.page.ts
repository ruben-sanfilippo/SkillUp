import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  arrowForwardOutline,
  bookOutline,
  peopleOutline,
  ribbonOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class LandingPagePage implements OnInit {
  constructor(private router: Router) {
    // Registriamo le icone necessarie per la pagina
    addIcons({
      schoolOutline,
      arrowForwardOutline,
      bookOutline,
      peopleOutline,
      ribbonOutline,
    });
  }

  ngOnInit() {}

  // Metodi di navigazione semplici e chiari
  vaiAlLogin() {
    this.router.navigate(['/login']);
  }

  vaiAlRegister() {
    this.router.navigate(['/register']);
  }
}
