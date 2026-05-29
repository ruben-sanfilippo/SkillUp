import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  eyeOutline,
  keyOutline,
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
  coverUrl?: string;
  previewUrl?: string | SafeResourceUrl;
  rawPreviewUrl?: string;
  isPdfPreview?: boolean;
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
  isPreviewModalOpen = false;

  selectedBookingForReview: Booking | null = null;
  selectedMaterialPreview: Material | null = null;
  currentRating: number = 0;
  tempBio: string = '';
  email = '';

  student: StudentData = {
    firstName: 'Alessandro',
    lastName: 'Rossi',
    avatar: '',
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
    private sanitizer: DomSanitizer,
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
      eyeOutline,
      keyOutline,
    });
  }

  async ngOnInit() {
    await this.caricaDatiStudente();
  }

  async ionViewWillEnter() {
    await this.caricaDatiStudente();
  }

  async caricaDatiStudente() {
    const [utente, prenotazioni, materiali] = await Promise.all([
      this.platformService.getMe(),
      this.platformService.getBookingsMe(),
      this.platformService.getPurchasedMaterials(),
    ]);

    this.email = utente.email || '';
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
      type: this.tipoMateriale(materiale.file_url),
      fileLabel: this.etichettaFile(materiale.file_url),
      sizeInMb: this.dimensioneFile(materiale.file_url),
      fileUrl: materiale.file_url,
      coverUrl: materiale.copertina_url,
      rawPreviewUrl: materiale.anteprima_url,
      previewUrl: this.preparaAnteprima(materiale.anteprima_url),
      isPdfPreview: this.isPdfDataUrl(materiale.anteprima_url),
    }));
  }

  get allBookingsSorted(): Booking[] {
    const adesso = Date.now();
    return [...this.allBookings].sort((a, b) => {
      const aFuture = a.date.getTime() >= adesso;
      const bFuture = b.date.getTime() >= adesso;
      if (aFuture !== bFuture) return aFuture ? -1 : 1;
      return aFuture
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    });
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

  apriAnteprimaMateriale(item: Material) {
    if (!item.previewUrl) return;
    this.selectedMaterialPreview = item;
    this.isPreviewModalOpen = true;
  }

  chiudiAnteprimaMateriale() {
    this.isPreviewModalOpen = false;
    setTimeout(() => (this.selectedMaterialPreview = null), 250);
  }

  async scaricaMateriale(item: Material) {
    const estensione = this.estensioneFile(item.fileUrl);
    const nomeFile = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${estensione}`;
    const blob = await this.creaBlobDownload(item);
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

  vaiAModificaPassword() {
    this.router.navigate(['/modifica-password-profilo'], {
      state: {
        email: this.email,
        returnUrl: '/tabs/student-profile',
      },
    });
  }

  private mappaPrenotazione(booking: any): Booking {
    const data = new Date(`${booking.data}T${booking.ora_inizio}:00`);
    return {
      id: booking.id,
      tutorName: booking.tutorName,
      tutorAvatar: booking.tutorAvatar || this.avatarTutorPredefinito(booking),
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

  private avatarTutorPredefinito(booking: any): string {
    const nome = encodeURIComponent(booking.tutorName || 'Tutor');
    return `https://ui-avatars.com/api/?name=${nome}&background=1e40af&color=fff`;
  }

  private preparaAnteprima(url?: string): string | SafeResourceUrl {
    if (!url) return '';
    if (this.isPdfDataUrl(url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return url;
  }

  private isPdfDataUrl(url?: string): boolean {
    return !!url && url.startsWith('data:application/pdf');
  }

  private tipoMateriale(url?: string): 'pdf' | 'notes' {
    return this.mimeDaDataUrl(url).includes('pdf') ? 'pdf' : 'notes';
  }

  private etichettaFile(url?: string): string {
    const mime = this.mimeDaDataUrl(url);
    if (mime.includes('pdf')) return 'PDF';
    if (mime.includes('image')) return 'IMMAGINE';
    if (mime.includes('plain')) return 'TXT';
    return 'FILE';
  }

  private dimensioneFile(url?: string): string {
    if (!url?.startsWith('data:')) return 'File';
    const base64 = url.split(',')[1] || '';
    const bytes = Math.floor((base64.length * 3) / 4);
    const mb = bytes / (1024 * 1024);
    return `${Math.max(0.01, mb).toFixed(2)} MB`;
  }

  private estensioneFile(url?: string): string {
    const mime = this.mimeDaDataUrl(url);
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('png')) return 'png';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('plain')) return 'txt';
    return 'dat';
  }

  private mimeDaDataUrl(url?: string): string {
    const match = String(url || '').match(/^data:([^;,]+)/);
    return match?.[1] || 'text/plain';
  }

  private async creaBlobDownload(item: Material): Promise<Blob> {
    if (item.fileUrl?.startsWith('data:')) {
      const response = await fetch(item.fileUrl);
      return response.blob();
    }

    return new Blob([`Titolo: ${item.title}\nAutore: ${item.author}`], {
      type: 'text/plain;charset=utf-8',
    });
  }
}
