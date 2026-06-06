import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  optionsOutline,
  chevronDownOutline,
  chevronUpOutline,
  languageOutline,
  closeCircle,
} from 'ionicons/icons';
import { TutorCardComponent } from '../../components/tutor-card/tutor-card.component';
import {
  IonContent,
  IonIcon,
  IonRange,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';

import { TutorService, FiltriRicerca } from '../../services/tutorService';
import type { TutorApi } from '../../interfaces/tutor.interfaces';

@Component({
  selector: 'app-search-tutor',
  templateUrl: './search-tutor.page.html',
  styleUrls: ['./search-tutor.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TutorCardComponent,
    IonContent,
    IonIcon,
    IonRange,
    IonSearchbar,
    IonSpinner,
  ],
})
export class SearchTutorPage implements OnInit {
  mostraFiltriMobile = false;
  tipologiaUtente = 'studente';

  isCaricamento = false;

  testoRicerca = '';
  rangePrezzo = { lower: 0, upper: 100 };
  dataDa = '';
  dataA = '';

  mostraListaMaterie = false;
  materieDisponibili = [
    'Matematica',
    'Fisica',
    'Chimica',
    'Biologia',
    'Scienze',
    'Italiano',
    'Letteratura',
    'Storia',
    'Geografia',
    'Filosofia',
    'Latino',
    'Greco',
    'Inglese',
    'Informatica',
    'Analisi Matematica 1',
    'Analisi Matematica 2',
    'Geometria',
    'Algebra Lineare',
    'Statistica',
    'Programmazione',
    'Basi di Dati',
    'Ingegneria del Software',
    'Economia',
    'Diritto',
    'Anatomia',
    'Psicologia',
  ];
  materieFiltrate = [...this.materieDisponibili];
  materiaFiltro: string[] = [];

  mostraListaLingue = false;
  lingueDisponibili = [
    'Italiano',
    'Inglese',
    'Spagnolo',
    'Francese',
    'Tedesco',
    'Portoghese',
    'Cinese',
    'Giapponese',
    'Arabo',
    'Russo',
    'Coreano',
    'Hindi',
    'Olandese',
    'Polacco',
    'Turco',
  ];
  lingueFiltrate = [...this.lingueDisponibili];
  linguaFiltro: string[] = [];

  tutorsFiltrati: TutorApi[] = [];

  constructor(private tutorService: TutorService) {
    addIcons({
      searchOutline,
      optionsOutline,
      chevronDownOutline,
      chevronUpOutline,
      languageOutline,
      closeCircle,
    });
  }

  ngOnInit() {
    this.aggiornaRuolo();
    this.applicaFiltri();
  }

  ionViewWillEnter() {
    this.aggiornaRuolo();
    this.applicaFiltri();
  }

  private aggiornaRuolo() {
    this.tipologiaUtente = (
      localStorage.getItem('tipologia_utente') || 'studente'
    ).toLowerCase();
  }

  filtraMaterie(event: any) {
    const q = event.target.value.toLowerCase();
    this.materieFiltrate = this.materieDisponibili.filter((m) =>
      m.toLowerCase().includes(q),
    );
  }
  aggiungiMateria(materia: string) {
    if (!this.materiaFiltro.includes(materia)) this.materiaFiltro.push(materia);
    this.mostraListaMaterie = false;
  }
  rimuoviMateria(materia: string) {
    this.materiaFiltro = this.materiaFiltro.filter((m) => m !== materia);
  }

  filtraLingue(event: any) {
    const q = event.target.value.toLowerCase();
    this.lingueFiltrate = this.lingueDisponibili.filter((l) =>
      l.toLowerCase().includes(q),
    );
  }
  aggiungiLingua(lingua: string) {
    if (!this.linguaFiltro.includes(lingua)) this.linguaFiltro.push(lingua);
    this.mostraListaLingue = false;
  }
  rimuoviLingua(lingua: string) {
    this.linguaFiltro = this.linguaFiltro.filter((l) => l !== lingua);
  }

  async applicaFiltri() {
    this.mostraFiltriMobile = false;
    this.isCaricamento = true;

    const payloadFiltri: FiltriRicerca = {
      testo: this.testoRicerca,
      materie: this.materiaFiltro,
      lingue: this.linguaFiltro,
      prezzoMin: this.rangePrezzo.lower,
      prezzoMax: this.rangePrezzo.upper,
      dataDa: this.dataDa,
      dataA: this.dataA,
    };

    try {
      this.tutorsFiltrati =
        await this.tutorService.ricercaTutors(payloadFiltri);
    } catch (error) {
      console.error('Errore durante la ricerca:', error);
    } finally {
      this.isCaricamento = false;
    }
  }

  cancellaFiltri() {
    this.testoRicerca = '';
    this.materiaFiltro = [];
    this.linguaFiltro = [];
    this.rangePrezzo = { lower: 0, upper: 100 };
    this.dataDa = '';
    this.dataA = '';
    this.applicaFiltri();
  }
}
