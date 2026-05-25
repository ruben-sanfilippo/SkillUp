import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { TutorCardComponent } from '../../components/tutor-card/tutor-card.component';
//Devo aggiungere in disponibilita Da giorno x a giorno y e levare le checkbox
//levare il bottone vedi profilo e rendere la card cliccabile
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonRange,
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
  ],
})
export class SearchTutorPage implements OnInit {
  tutors = [
    {
      name: 'Dr.ssa Elena Rostova',
      subject: 'Matematica',
      bio: 'Dottorato in Matematica Applicata. Esperta in Analisi Matematica e Algebra.',
      rating: 4.9,
      reviews: 124,
      price: 45,
      image: 'https://i.pravatar.cc/150?img=1',
    },
    {
      name: 'Marco Chen',
      subject: 'Fisica',
      bio: 'Ex ingegnere aerospaziale diventato un appassionato tutor di fisica.',
      rating: 5.0,
      reviews: 89,
      price: 60,
      image: 'https://i.pravatar.cc/150?img=11',
    },
    {
      name: 'Sara Jenkins',
      subject: 'Letteratura',
      bio: 'Appassionata di scrittura di saggi, letteratura moderna e poesia.',
      rating: 4.8,
      reviews: 210,
      price: 35,
      image: 'https://i.pravatar.cc/150?img=5',
    },
  ];

  constructor() {
    addIcons({ searchOutline });
  }

  ngOnInit() {}
}
