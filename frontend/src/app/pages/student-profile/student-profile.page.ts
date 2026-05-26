import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
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
  closeOutline,
  cameraOutline,
  imageOutline,
  trashOutline
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
  hasReviewed: boolean; 
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
  imports: [CommonModule, FormsModule, IonicModule] 
})
export class StudentProfilePage implements OnInit {
  
  isModalOpen = false;       
  isReviewModalOpen = false; 
  isBioModalOpen = false;    
  isAvatarActionSheetOpen = false; // Stato per l'apertura del foglio d'azione dell'avatar

  selectedBookingForReview: Booking | null = null;
  currentRating: number = 0; 
  tempBio: string = '';      

  student: StudentData = {
    firstName: 'Alessandro',
    lastName: 'Rossi',
    avatar: 'https://i.pravatar.cc/150?u=alessandro', // Può essere svuotata ('') per testare il placeholder con le iniziali
    about: 'Appassionato di intelligenza artificiale e machine learning. Attualmente concentrato sullo sviluppo di algoritmi efficienti per l\'analisi dei dati e integrazioni backend.',
    sessionsCompleted: 24,
    studyHours: 112
  };

  // Configurazione dei bottoni dell'Action Sheet per la gestione foto
  public avatarActionSheetButtons = [
    {
      text: 'Carica / Modifica foto',
      icon: 'image-outline',
      handler: () => {
        this.triggerFileInput();
      }
    },
    {
      text: 'Rimuovi foto',
      role: 'destructive',
      icon: 'trash-outline',
      handler: () => {
        this.rimuoviAvatar();
      }
    },
    {
      text: 'Annulla',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

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
      hasReviewed: false 
    }
  ];

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
      hasReviewed: false 
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
      hasReviewed: true 
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
      hasReviewed: false 
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
      createOutline,
      closeOutline,
      cameraOutline,
      imageOutline,
      trashOutline
    });
  }

  ngOnInit() {}

  get allBookingsSorted(): Booking[] {
    return [...this.allBookings].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  apriModalPrenotazioni() {
    this.isModalOpen = true;
  }

  apriModalRecensione(booking: Booking) {
    this.selectedBookingForReview = booking;
    this.currentRating = 0; 
    this.isReviewModalOpen = true;
  }

  chiudiModalRecensione() {
    this.isReviewModalOpen = false;
    this.selectedBookingForReview = null;
    this.currentRating = 0;
  }

  setRating(rating: number) {
    this.currentRating = rating; 
  }

  inviaRecensione() {
    if (!this.selectedBookingForReview) return;
    
    const targetId = this.selectedBookingForReview.id;
    console.log(`Valutazione inviata per il Tutor ID: ${targetId} con ${this.currentRating} stelle`);

    const bookingInAll = this.allBookings.find(b => b.id === targetId);
    if (bookingInAll) {
      bookingInAll.hasReviewed = true;
    }

    const bookingInRecent = this.recentBookings.find(b => b.id === targetId);
    if (bookingInRecent) {
      bookingInRecent.hasReviewed = true;
    }

    this.chiudiModalRecensione();
  }

  /* --- GESTIONE FOTO PROFILO (ADD / MODIFY / DELETE) --- */
  apriMenuAvatar() {
    this.isAvatarActionSheetOpen = true;
  }

  triggerFileInput() {
    const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Aggiorna l'avatar convertendolo in una stringa Base64 per la visualizzazione immediata
        this.student.avatar = reader.result as string;
        console.log('Nuova foto profilo caricata con successo!');
      };
      reader.readAsDataURL(file);
    }
  }

  rimuoviAvatar() {
    this.student.avatar = ''; // Svuotando la stringa, l'HTML mostrerà il segnaposto con le iniziali
    console.log('Foto profilo rimossa.');
  }

  /* --- LOGICA MODIFICA BIOGRAFIA --- */
  apriModalBio() {
    this.tempBio = this.student.about; 
    this.isBioModalOpen = true;
  }

  chiudiModalBio() {
    this.isBioModalOpen = false;
    this.tempBio = '';
  }

  salvaBio() {
    if (this.tempBio && this.tempBio.trim()) {
      this.student.about = this.tempBio.trim(); 
      console.log('Biografia aggiornata con successo!');
      this.chiudiModalBio();
    }
  }

  /* --- LOGICA DOWNLOAD FILE --- */
  scaricaMateriale(item: Material) {
    console.log(`Inizio download: ${item.title}`);

    const contenutoMock = `STUDY HUB - FILE ACQUISTATO\n\nTitolo: ${item.title}\nAutore: ${item.author}\nFormato: ${item.fileLabel}\nDimensione: ${item.sizeInMb}\nID Transazione: SEC-${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\nContenuto protetto da licenza utente.`;
    
    const estensione = item.type === 'pdf' ? 'pdf' : 'txt';
    const nomeFile = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${estensione}`;

    const blob = new Blob([contenutoMock], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const ancoraDownload = document.createElement('a');
    ancoraDownload.href = url;
    ancoraDownload.download = nomeFile;
    
    document.body.appendChild(ancoraDownload);
    ancoraDownload.click();
    
    document.body.removeChild(ancoraDownload);
    window.URL.revokeObjectURL(url);
  }

  eseguiAzione(azione: string, id?: string) {
    console.log(`Azione: ${azione}${id ? ' ID: ' + id : ''}`);
  }
}