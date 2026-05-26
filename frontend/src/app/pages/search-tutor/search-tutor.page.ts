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
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonRange,
  IonSearchbar,
} from '@ionic/angular/standalone';

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
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonRange,
    IonSearchbar,
  ],
})
export class SearchTutorPage implements OnInit {
  mostraFiltriMobile = false;

  testoRicerca = '';
  rangePrezzo = { lower: 10, upper: 100 };
  dataDa = '';
  dataA = '';

  mostraListaMaterie = false;
  materieDisponibili = [
    'Matematica',
    'Fisica',
    'Letteratura',
    'Informatica',
    'Inglese',
    'Scienze',
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
  ];
  lingueFiltrate = [...this.lingueDisponibili];
  linguaFiltro: string[] = [];

  tutorsOriginali = [
    {
      id: 1,
      name: 'Dr.ssa Elena Rostova',
      subjects: ['Matematica', 'Fisica'],
      bio: 'Dottorato in Matematica Applicata.',
      rating: 4.9,
      reviews: 124,
      price: 45,
      image: 'https://i.pravatar.cc/150?img=1',
      disponibileDal: '2026-05-01',
      disponibileAl: '2026-07-31',
      languages: ['Italiano', 'Inglese'],
    },
    {
      id: 2,
      name: 'Marco Chen',
      subjects: ['Fisica', 'Informatica'],
      bio: 'Ex ingegnere aerospaziale diventato tutor.',
      rating: 5.0,
      reviews: 89,
      price: 60,
      image: 'https://i.pravatar.cc/150?img=11',
      disponibileDal: '2026-06-15',
      disponibileAl: '2026-12-31',
      languages: ['Italiano', 'Francese'],
    },
    {
      id: 3,
      name: 'Sara Jenkins',
      subjects: ['Letteratura', 'Inglese'],
      bio: 'Appassionata di scrittura e poesia.',
      rating: 4.8,
      reviews: 210,
      price: 35,
      image: 'https://i.pravatar.cc/150?img=5',
      disponibileDal: '2026-01-01',
      disponibileAl: '2026-06-10',
      languages: ['Inglese', 'Spagnolo'],
    },
  ];

  tutorsFiltrati = [...this.tutorsOriginali];

  constructor() {
    addIcons({
      searchOutline,
      optionsOutline,
      chevronDownOutline,
      chevronUpOutline,
      languageOutline,
      closeCircle,
    });
  }

  ngOnInit() {}

  // --- METODI MATERIE ---
  filtraMaterie(event: any) {
    const query = event.target.value.toLowerCase();
    this.materieFiltrate = this.materieDisponibili.filter((m) =>
      m.toLowerCase().includes(query),
    );
  }
  aggiungiMateria(materia: string) {
    if (!this.materiaFiltro.includes(materia)) {
      this.materiaFiltro.push(materia);
    }
    this.mostraListaMaterie = false;
  }
  rimuoviMateria(materia: string) {
    this.materiaFiltro = this.materiaFiltro.filter((m) => m !== materia);
  }

  // --- METODI LINGUE ---
  filtraLingue(event: any) {
    const query = event.target.value.toLowerCase();
    this.lingueFiltrate = this.lingueDisponibili.filter((l) =>
      l.toLowerCase().includes(query),
    );
  }
  aggiungiLingua(lingua: string) {
    if (!this.linguaFiltro.includes(lingua)) {
      this.linguaFiltro.push(lingua);
    }
    this.mostraListaLingue = false;
  }
  rimuoviLingua(lingua: string) {
    this.linguaFiltro = this.linguaFiltro.filter((l) => l !== lingua);
  }

  applicaFiltri() {
    this.tutorsFiltrati = this.tutorsOriginali.filter((tutor) => {
      const termine = this.testoRicerca.toLowerCase();
      const matchTesto = tutor.name.toLowerCase().includes(termine);

      const matchMateria =
        this.materiaFiltro.length === 0 ||
        this.materiaFiltro.some((m) => tutor.subjects.includes(m));

      const matchLingua =
        this.linguaFiltro.length === 0 ||
        this.linguaFiltro.some((l) => tutor.languages.includes(l));

      const matchPrezzo =
        tutor.price >= this.rangePrezzo.lower &&
        tutor.price <= this.rangePrezzo.upper;

      let matchData = true;
      if (this.dataDa && tutor.disponibileAl < this.dataDa) matchData = false;
      if (this.dataA && tutor.disponibileDal > this.dataA) matchData = false;

      return (
        matchTesto && matchMateria && matchLingua && matchPrezzo && matchData
      );
    });

    this.mostraFiltriMobile = false;
  }

  cancellaFiltri() {
    this.testoRicerca = '';
    this.materiaFiltro = [];
    this.linguaFiltro = [];
    this.rangePrezzo = { lower: 10, upper: 100 };
    this.dataDa = '';
    this.dataA = '';

    this.tutorsFiltrati = [...this.tutorsOriginali];
  }
}
