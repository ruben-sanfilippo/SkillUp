import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
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
  trashOutline,
  checkmarkCircleOutline,
  logOutOutline,
} from 'ionicons/icons';
import { PlatformService } from 'src/app/services/platformService';

interface StudentData {
  firstName: string;
  lastName: string;
  avatar: string;
  about: string;
  sessionsCompleted: number;
  studyHours: number;
}

interface Booking {
  id: string | number;
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
  id: string | number;
  title: string;
  author: string;
  type: 'pdf' | 'notes';
  fileLabel: string;
  sizeInMb: string;
  fileUrl?: string;
}

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.page.html',
  styleUrls: ['./student-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class StudentProfilePage implements OnInit {
  isModalOpen = false;
  isReviewModalOpen = false;
  isBioModalOpen = false;
  isAvatarActionSheetOpen = false;

  selectedBookingForReview: Booking | null = null;
  currentRating: number = 0;
  tempBio: string = '';

  student: StudentData = {
    firstName: 'Alessandro',
    lastName: 'Rossi',
    avatar: 'https://i.pravatar.cc/150?u=alessandro',
    about:
      "Appassionato di intelligenza artificiale e machine learning. Sviluppo algoritmi efficienti per l'analisi dati.",
    sessionsCompleted: 24,
    studyHours: 112,
  };

  public avatarActionSheetButtons = [
    {
      text: 'Carica / Modifica foto',
      icon: 'image-outline',
      handler: () => {
        this.triggerFileInput();
      },
    },
    {
      text: 'Rimuovi foto',
      role: 'destructive',
      icon: 'trash-outline',
      handler: () => {
        this.rimuoviAvatar();
      },
    },
    {
      text: 'Annulla',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  recentBookings: Booking[] = [];
  allBookings: Booking[] = [];
  purchasedMaterials: Material[] = [];

  constructor(
    private platformService: PlatformService,
    private router: Router,
  ) {
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
      trashOutline,
      checkmarkCircleOutline,
      logOutOutline,
    });
  }

  async ngOnInit() {
    await this.caricaDatiStudente();
  }

  async caricaDatiStudente() {
    const [utente, prenotazioni, materiali] = await Promise.all([
      this.platformService.getMe(),
      this.platformService.getBookingsMe(),
      this.platformService.getPurchasedMaterials(),
    ]);

    this.student = {
      firstName: utente.nome,
      lastName: utente.cognome,
      avatar: utente.immagine_profilo || '',
      about: utente.bio || '',
      sessionsCompleted: prenotazioni.length,
      studyHours: prenotazioni.length,
    };

    this.allBookings = prenotazioni.map((booking) =>
      this.mappaPrenotazione(booking),
    );
    this.recentBookings = this.allBookingsSorted.slice(0, 2);
    this.purchasedMaterials = materiali.map((materiale) => ({
      id: materiale.id,
      title: materiale.titolo,
      author: materiale.autore,
      type: 'pdf',
      fileLabel: 'PDF',
      sizeInMb: materiale.sizeInMb,
      fileUrl: materiale.file_url,
    }));
  }

  get allBookingsSorted(): Booking[] {
    return [...this.allBookings].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
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

  async inviaRecensione() {
    if (!this.selectedBookingForReview) return;

    const targetId = this.selectedBookingForReview.id;
    await this.platformService.createReview({
      prenotazione_id: targetId,
      voto: this.currentRating,
    });

    const bookingInAll = this.allBookings.find((b) => b.id === targetId);
    if (bookingInAll) {
      bookingInAll.hasReviewed = true;
    }

    const bookingInRecent = this.recentBookings.find((b) => b.id === targetId);
    if (bookingInRecent) {
      bookingInRecent.hasReviewed = true;
    }

    localStorage.setItem(
      'skillup_recensioni_aggiornate',
      Date.now().toString(),
    );

    this.chiudiModalRecensione();
  }

  apriMenuAvatar() {
    this.isAvatarActionSheetOpen = true;
  }

  triggerFileInput() {
    const fileInput = document.getElementById(
      'avatarFileInput',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.student.avatar = reader.result as string;
        this.platformService.updateMe({
          immagine_profilo: this.student.avatar,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  rimuoviAvatar() {
    this.student.avatar = '';
    this.platformService.updateMe({ immagine_profilo: '' });
  }

  apriModalBio() {
    this.tempBio = this.student.about
      ? this.student.about.substring(0, 200)
      : '';
    this.isBioModalOpen = true;
  }

  chiudiModalBio() {
    this.isBioModalOpen = false;
    this.tempBio = '';
  }

  async salvaBio() {
    if (this.tempBio && this.tempBio.trim() && this.tempBio.length <= 200) {
      this.student.about = this.tempBio.trim();
      await this.platformService.updateMe({ bio: this.student.about });
      this.chiudiModalBio();
    }
  }

  scaricaMateriale(item: Material) {
    const contenutoMock =
      item.fileUrl || `Titolo: ${item.title}\nAutore: ${item.author}`;
    const estensione = item.type === 'pdf' ? 'pdf' : 'txt';
    const nomeFile = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${estensione}`;

    const blob = new Blob([contenutoMock], {
      type: 'text/plain;charset=utf-8',
    });
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tipologia_utente');
    localStorage.removeItem('skillup_recensioni_aggiornate');
    this.router.navigate(['/login']);
  }

  private mappaPrenotazione(booking: any): Booking {
    const data = new Date(booking.data);
    return {
      id: booking.id,
      tutorName: booking.tutorName,
      tutorAvatar:
        booking.tutorAvatar ||
        `https://i.pravatar.cc/150?u=${booking.tutor_id}`,
      subject: booking.materia,
      date: data,
      dataItaliana: data.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      startTime: booking.ora_inizio,
      endTime: booking.ora_fine,
      status: data >= new Date() ? 'IN PROGRAMMA' : 'COMPLETATA',
      hasReviewed: !!booking.hasReviewed,
    };
  }
}
