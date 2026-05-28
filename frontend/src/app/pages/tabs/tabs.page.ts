import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  IonContent,
  IonLabel,
  IonIcon,
  IonTabButton,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
} from '@ionic/angular/standalone';
import {
  searchOutline,
  personOutline,
  chatbubblesOutline,
  statsChartOutline,
  schoolOutline,
} from 'ionicons/icons'; // Aggiunta l'icona per i messaggi
import { PlatformService } from '../../services/platformService';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonLabel,
    IonTabButton,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    CommonModule,
    FormsModule,
  ],
})
export class TabsPage implements OnInit {
  // 1. Definiamo la variabile con un valore di default
  tipologiaUtente = 'studente';

  constructor(private platformService: PlatformService) {
    addIcons({
      searchOutline,
      chatbubblesOutline,
      personOutline,
      statsChartOutline,
      schoolOutline,
    });
  }

  ngOnInit() {
    this.aggiornaTipologiaUtente();
  }

  ionViewWillEnter() {
    this.aggiornaTipologiaUtente();
  }

  private async aggiornaTipologiaUtente() {
    const ruoloSalvato = localStorage.getItem('tipologia_utente') || 'studente';
    this.tipologiaUtente = ruoloSalvato.toLowerCase();

    try {
      const utente = await this.platformService.getMe();
      const ruoloBackend = utente?.tipologia_utente?.toLowerCase();

      if (ruoloBackend) {
        this.tipologiaUtente = ruoloBackend;
        localStorage.setItem('tipologia_utente', ruoloBackend);
      }
    } catch {
      this.tipologiaUtente = 'studente';
    }
  }
}
