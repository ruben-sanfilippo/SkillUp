import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  schoolOutline, 
  searchOutline, 
  calendarOutline, 
  documentTextOutline, 
  bookOutline, 
  downloadOutline, 
  chevronForwardOutline,
  createOutline
} from 'ionicons/icons';

interface StudentData {
  firstName: string;
  lastName: string;
  avatar: string;
  about: string;
  sessionsCompleted: number;
  studyHours: number;
}

interface Booking {
  id: string;
  tutorName: string;
  tutorAvatar: string;
  subject: string;
  date: Date;
  dataItaliana: string; 
  startTime: string;
  endTime: string;
  status: 'IN PROGRAMMA' | 'COMPLETATA';
}

interface Material {
  id: string;
  title: string;
  author: string;
  type: 'pdf' | 'notes';
  fileLabel: string; 
  sizeInMb: string; // Gestisce unicamente il valore in MB
}

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.page.html',
  styleUrls: ['./student-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class StudentProfilePage implements OnInit {
  
  student: StudentData = {
    firstName: 'Alessandro',
    lastName: 'Rossi',
    avatar: 'https://i.pravatar.cc/150?u=alessandro',
    about: 'Appassionato di intelligenza artificiale e machine learning. Attualmente concentrato sullo sviluppo di algoritmi efficienti per l\'analisi dei dati e integrazioni backend.',
    sessionsCompleted: 24,
    studyHours: 112
  };

  recentBookings: Booking[] = [
    {
      id: 'b1',
      tutorName: 'Dr. Samuel Chen',
      tutorAvatar: 'https://i.pravatar.cc/150?u=samuel',
      subject: 'Calcolo Avanzato',
      date: new Date(),
      dataItaliana: '25 Mag 2026', 
      startTime: '10:00',
      endTime: '11:30',
      status: 'IN PROGRAMMA'
    },
    {
      id: 'b2',
      tutorName: 'Maria Gonzalez',
      tutorAvatar: 'https://i.pravatar.cc/150?u=maria',
      subject: 'Strutture Dati',
      date: new Date('2026-05-20'),
      dataItaliana: '20 Mag 2026', 
      startTime: '14:00',
      endTime: '15:00',
      status: 'COMPLETATA'
    }
  ];

  purchasedMaterials: Material[] = [
    {
      id: 'm1',
      title: 'Guida al Calcolo Avanzato: Padroneggiare l\'Integrazione',
      author: 'Dr. Samuel Chen',
      type: 'pdf',
      fileLabel: 'PDF',
      sizeInMb: '4.2 MB'
    },
    {
      id: 'm2',
      title: 'Appunti Completi di Algoritmi e Strutture Dati - Esame A.A. 2025',
      author: 'Alessandro Rossi',
      type: 'notes',
      fileLabel: 'NOTE',
      sizeInMb: '2.8 MB'
    },
    {
      id: 'm3',
      title: 'Dispensa di Algebra Lineare e Geometria Analitica',
      author: 'Prof. Enrico Verdi',
      type: 'pdf',
      fileLabel: 'PDF',
      sizeInMb: '6.8 MB'
    },
    {
      id: 'm4',
      title: 'Esercitazioni Risolte di Fisica Sperimentale I',
      author: 'Studio Co-Tutor',
      type: 'notes',
      fileLabel: 'NOTE',
      sizeInMb: '5.1 MB'
    },
    {
      id: 'm5',
      title: 'Prontuario di Comandi e Sintassi SQL per Database',
      author: 'Alessandro Rossi',
      type: 'pdf',
      fileLabel: 'PDF',
      sizeInMb: '1.5 MB'
    }
  ];

  constructor() {
    addIcons({
      schoolOutline,
      searchOutline,
      calendarOutline,
      documentTextOutline,
      bookOutline,
      downloadOutline,
      chevronForwardOutline,
      createOutline
    });
  }

  ngOnInit() {}

  eseguiAzione(azione: string, id?: string) {
    console.log(`Azione intercettata: ${azione}${id ? ' su elemento con ID: ' + id : ''}`);
  }
}