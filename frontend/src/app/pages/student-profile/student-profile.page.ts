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
  createOutline,
  closeOutline
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
  hasReviewed: boolean; // TRUE: Recensione già lasciata, FALSE: Recensione mancante
}

interface Material {
  id: string;
  title: string;
  author: string;
  type: 'pdf' | 'notes';
  fileLabel: string; 
  sizeInMb: string;
}

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.page.html',
  styleUrls: ['./student-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class StudentProfilePage implements OnInit {
  
  isModalOpen = false;

  student: StudentData = {
    firstName: 'Alessandro',
    lastName: 'Rossi',
    avatar: 'https://i.pravatar.cc/150?u=alessandro',
    about: 'Appassionato di intelligenza artificiale e machine learning. Attualmente concentrato sullo sviluppo di algoritmi efficienti per l\'analisi dei dati e integrazioni backend.',
    sessionsCompleted: 24,
    studyHours: 112
  };

  // Elenco Prenotazioni Recenti (Dashboard)
  recentBookings: Booking[] = [
    {
      id: 'b1',
      tutorName: 'Dr. Samuel Chen',
      tutorAvatar: 'https://i.pravatar.cc/150?u=samuel',
      subject: 'Calcolo Avanzato',
      date: new Date('2026-05-25'),
      dataItaliana: '25 Mag 2026', 
      startTime: '10:00',
      endTime: '11:30',
      status: 'IN PROGRAMMA',
      hasReviewed: false // Non modificabile (In programma)
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
      status: 'COMPLETATA',
      hasReviewed: false // COMPLETATA e non ancora recensita -> MOSTRA IL PULSANTE
    }
  ];

  // Storico completo di tutte le prenotazioni
  allBookings: Booking[] = [
    {
      id: 'b1',
      tutorName: 'Dr. Samuel Chen',
      tutorAvatar: 'https://i.pravatar.cc/150?u=samuel',
      subject: 'Calcolo Avanzato',
      date: new Date('2026-05-25'),
      dataItaliana: '25 Mag 2026', 
      startTime: '10:00',
      endTime: '11:30',
      status: 'IN PROGRAMMA',
      hasReviewed: false
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
      status: 'COMPLETATA',
      hasReviewed: false // COMPLETATA e non ancora recensita -> MOSTRA IL PULSANTE
    },
    {
      id: 'b3',
      tutorName: 'Prof. Enrico Verdi',
      tutorAvatar: 'https://i.pravatar.cc/150?u=enrico',
      subject: 'Algebra Lineare',
      date: new Date('2026-05-10'),
      dataItaliana: '10 Mag 2026',
      startTime: '09:00',
      endTime: '11:00',
      status: 'COMPLETATA',
      hasReviewed: true // COMPLETATA MA GIÀ RECENSITA -> IL PULSANTE NON SARA VISIBILE
    },
    {
      id: 'b4',
      tutorName: 'Elena Rostova',
      tutorAvatar: 'https://i.pravatar.cc/150?u=elena',
      subject: 'Fisica Sperimentale I',
      date: new Date('2026-04-18'),
      dataItaliana: '18 Apr 2026',
      startTime: '16:00',
      endTime: '17:30',
      status: 'COMPLETATA',
      hasReviewed: false // COMPLETATA e non ancora recensita -> MOSTRA IL PULSANTE
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
      createOutline,
      closeOutline
    });
  }

  ngOnInit() {}

  // Ritorna lo storico ordinato dal più recente al meno recente
  get allBookingsSorted(): Booking[] {
    return [...this.allBookings].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  apriModalPrenotazioni() {
    this.isModalOpen = true;
  }

  // Azione specifica per la recensione che aggiorna dinamicamente lo stato locale a true
  lasciaRecensione(bookingId: string) {
    console.log(`Apertura sistema di recensione per la prenotazione: ${bookingId}`);
    
    // Aggiorna lo storico principale
    const bookingInAll = this.allBookings.find(b => b.id === bookingId);
    if (bookingInAll) {
      bookingInAll.hasReviewed = true;
    }

    // Aggiorna l'anteprima recente se presente
    const bookingInRecent = this.recentBookings.find(b => b.id === bookingId);
    if (bookingInRecent) {
      bookingInRecent.hasReviewed = true;
    }
  }

  eseguiAzione(azione: string, id?: string) {
    console.log(`Azione intercettata: ${azione}${id ? ' su elemento con ID: ' + id : ''}`);
  }
}