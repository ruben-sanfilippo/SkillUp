import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
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
    IonToolbar,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class LandingPagePage implements OnInit {
  constructor(private router: Router) {
    addIcons({
      schoolOutline,
      arrowForwardOutline,
      bookOutline,
      peopleOutline,
      ribbonOutline,
    });
  }

  ngOnInit() {}

  vaiAlLogin() {
    this.router.navigate(['/login']);
  }

  vaiAlRegister() {
    this.router.navigate(['/register']);
  }
}
