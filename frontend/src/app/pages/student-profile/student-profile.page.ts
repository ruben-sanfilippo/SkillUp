import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
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
  logOutOutline,
  eyeOutline,
  keyOutline,
  cardOutline,
} from 'ionicons/icons';
import { BookingService } from 'src/app/services/bookingService';
import { MaterialService } from 'src/app/services/materialService';
import { ReviewService } from 'src/app/services/reviewService';
import { UserService } from 'src/app/services/userService';
import { MaterialPreviewModalComponent } from 'src/app/components/material-preview-modal/material-preview-modal.component';
import { PaymentMethodModalComponent } from 'src/app/components/payment-method-modal/payment-method-modal.component';
import { BookingCardComponent } from 'src/app/components/booking-card/booking-card.component';
import { ProfileAvatarEditorComponent } from 'src/app/components/profile-avatar-editor/profile-avatar-editor.component';
import { ReviewModalComponent } from 'src/app/components/review-modal/review-modal.component';
import type {
  PrenotazioneProfilo,
  MaterialeAcquistato,
  DatiStudente,
} from 'src/app/interfaces/profile.interfaces';
import type {
  MetodoPagamentoPayload,
  MetodoPagamentoStudente,
} from 'src/app/interfaces/user.interfaces';
import type {
  PrenotazioneApi,
} from 'src/app/interfaces/booking.interfaces';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.page.html',
  styleUrls: ['./student-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, MaterialPreviewModalComponent, PaymentMethodModalComponent, BookingCardComponent, ProfileAvatarEditorComponent, ReviewModalComponent],
})
export class StudentProfilePage implements OnInit {
  isModalOpen = false;
  isReviewModalOpen = false;
  isBioModalOpen = false;
  isPreviewModalOpen = false;
  isPaymentModalOpen = false;

  selectedBookingForReview: PrenotazioneProfilo | null = null;
  selectedMaterialPreview: MaterialeAcquistato | null = null;
  tempBio: string = '';
  email = '';
  metodoPagamento: MetodoPagamentoStudente = { presente: false };

  student: DatiStudente = {
    nome: '',
    cognome: '',
    immagineProfilo: '',
    biografia: '',
    sessioniCompletate: 0,
    oreStudio: 0,
  };

  recentBookings: PrenotazioneProfilo[] = [];
  allBookings: PrenotazioneProfilo[] = [];
  purchasedMaterials: MaterialeAcquistato[] = [];

  constructor(
    private userService: UserService,
    private bookingService: BookingService,
    private materialService: MaterialService,
    private reviewService: ReviewService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private toastController: ToastController,
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
      logOutOutline,
      eyeOutline,
      keyOutline,
      cardOutline,
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
      this.userService.getMe(),
      this.bookingService.getBookingsMe(),
      this.materialService.getPurchasedMaterials(),
    ]);

    const prenotazioniMappate = prenotazioni.map((prenotazione) =>
      this.mappaPrenotazione(prenotazione),
    );

    this.email = utente.email || '';
    this.metodoPagamento = utente.metodo_pagamento || { presente: false };
    this.student = {
      nome: utente.nome,
      cognome: utente.cognome,
      immagineProfilo: utente.immagine_profilo || '',
      biografia: utente.bio || '',
      sessioniCompletate: prenotazioni.length,
      oreStudio: this.calcolaOreStudio(prenotazioniMappate),
    };

    this.allBookings = prenotazioniMappate;
    this.recentBookings = this.allBookingsSorted.slice(0, 2);
    this.purchasedMaterials = materiali.map((materiale) => ({
      id: materiale.id,
      materialeId: materiale.materiale_id || materiale.id,
      titolo: materiale.titolo,
      autore: materiale.autore,
      tipo: this.tipoMateriale(materiale.file_url),
      etichettaFile: this.etichettaFile(materiale.file_url),
      dimensioneMb: this.dimensioneFile(materiale.file_url),
      urlFile: materiale.file_url,
      urlCopertina: materiale.copertina_url,
      urlAnteprimaRaw: materiale.anteprima_url,
      urlAnteprima: this.preparaAnteprima(materiale.anteprima_url),
      anteprimaPdf: this.isPdfDataUrl(materiale.anteprima_url),
    }));
  }

  get allBookingsSorted(): PrenotazioneProfilo[] {
    return [...this.allBookings].sort((a, b) => {
      const aAttiva = a.stato !== 'COMPLETATA';
      const bAttiva = b.stato !== 'COMPLETATA';
      if (aAttiva !== bAttiva) return aAttiva ? -1 : 1;
      return aAttiva
        ? a.dataOra.getTime() - b.dataOra.getTime()
        : b.dataOra.getTime() - a.dataOra.getTime();
    });
  }

  apriModalPrenotazioni() {
    this.isModalOpen = true;
  }

  apriModalRecensione(prenotazione: PrenotazioneProfilo) {
    this.selectedBookingForReview = prenotazione;
    this.isReviewModalOpen = true;
  }

  chiudiModalRecensione() {
    this.isReviewModalOpen = false;
    this.selectedBookingForReview = null;
  }

  async inviaRecensione(voto: number) {
    if (!this.selectedBookingForReview) return;

    const targetId = this.selectedBookingForReview.id;
    const tutorId = this.selectedBookingForReview.tutorId;

    try {
      await this.reviewService.createReview({
        prenotazione_id: targetId,
        voto,
      });
    } catch (error: any) {
      alert(
        error?.error?.message ||
          'Non è stato possibile inviare la recensione.',
      );
      return;
    }

    this.allBookings
      .filter((prenotazione) => Number(prenotazione.tutorId) === Number(tutorId))
      .forEach((prenotazione) => {
        prenotazione.recensita = true;
      });

    this.recentBookings
      .filter((prenotazione) => Number(prenotazione.tutorId) === Number(tutorId))
      .forEach((prenotazione) => {
        prenotazione.recensita = true;
      });

    localStorage.setItem(
      'skillup_recensioni_aggiornate',
      Date.now().toString(),
    );

    this.chiudiModalRecensione();
  }

  apriModalMetodoPagamento() {
    this.isPaymentModalOpen = true;
  }

  chiudiModalMetodoPagamento() {
    this.isPaymentModalOpen = false;
  }

  async salvaMetodoPagamento(metodoPagamentoForm: MetodoPagamentoPayload) {
    try {
      const utenteAggiornato = await this.userService.updateMe({
        metodo_pagamento: {
          numero_carta: metodoPagamentoForm.numero_carta,
          scadenza: metodoPagamentoForm.scadenza,
          titolare: metodoPagamentoForm.titolare,
          cvv: metodoPagamentoForm.cvv,
        },
      });
      this.metodoPagamento =
        utenteAggiornato.metodo_pagamento || { presente: false };
      this.chiudiModalMetodoPagamento();
      await this.mostraToast('Metodo di pagamento salvato.', 'success');
    } catch (error: any) {
      await this.mostraToast(
        error?.error?.message ||
          'Non e stato possibile salvare il metodo di pagamento.',
        'danger',
      );
    }
  }

  onAvatarSelected(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.student.immagineProfilo = reader.result as string;
    };
    reader.readAsDataURL(file);
    void this.userService.uploadAvatar(file).then((utente) => {
      this.student.immagineProfilo = utente.immagine_profilo || '';
    });
  }

  rimuoviAvatar() {
    this.student.immagineProfilo = '';
    this.userService.updateMe({ immagine_profilo: '' });
  }

  apriModalBio() {
    this.tempBio = this.student.biografia
      ? this.student.biografia.substring(0, 200)
      : '';
    this.isBioModalOpen = true;
  }

  chiudiModalBio() {
    this.isBioModalOpen = false;
    this.tempBio = '';
  }

  async salvaBio() {
    if (this.tempBio && this.tempBio.trim() && this.tempBio.length <= 200) {
      this.student.biografia = this.tempBio.trim();
      await this.userService.updateMe({ bio: this.student.biografia });
      this.chiudiModalBio();
    }
  }

  apriAnteprimaMateriale(item: MaterialeAcquistato) {
    if (!item.urlAnteprima) return;
    this.selectedMaterialPreview = item;
    this.isPreviewModalOpen = true;
  }

  chiudiAnteprimaMateriale() {
    this.isPreviewModalOpen = false;
    setTimeout(() => (this.selectedMaterialPreview = null), 250);
  }

  async scaricaMateriale(item: MaterialeAcquistato) {
    const estensione = this.estensioneFile(item.urlFile);
    const nomeFile = `${item.titolo.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.${estensione}`;
    const blob = await this.materialService.downloadMaterial(item.materialeId || item.id);
    const url = window.URL.createObjectURL(blob);

    const ancoraDownload = document.createElement('a');
    ancoraDownload.href = url;
    ancoraDownload.download = nomeFile;

    document.body.appendChild(ancoraDownload);
    ancoraDownload.click();

    document.body.removeChild(ancoraDownload);
    window.URL.revokeObjectURL(url);
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

  private async mostraToast(message: string, color: 'success' | 'danger' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2400,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  private mappaPrenotazione(prenotazione: PrenotazioneApi): PrenotazioneProfilo {
    const data = new Date(`${prenotazione.data}T${prenotazione.ora_inizio}:00`);
    const dataFine = new Date(`${prenotazione.data}T${prenotazione.ora_fine}:00`);
    const nomeTutor =
      prenotazione.nomeTutor ||
      prenotazione.tutorName ||
      [prenotazione.tutor_nome, prenotazione.tutor_cognome].filter(Boolean).join(' ') ||
      'Tutor';
    const avatarTutor =
      prenotazione.avatarTutor ||
      prenotazione.tutorAvatar ||
      prenotazione.immagine_profilo_tutor ||
      prenotazione.tutor_immagine_profilo ||
      '';

    return {
      id: prenotazione.id,
      tutorId: prenotazione.tutor_id ?? prenotazione.tutorId ?? 0,
      nomeTutor,
      avatarTutor,
      materia: prenotazione.materia,
      dataOra: data,
      dataFine,
      dataItaliana: data.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      oraInizio: prenotazione.ora_inizio,
      oraFine: prenotazione.ora_fine,
      stato: this.statoPrenotazione(data, dataFine),
      recensita: !!(prenotazione.recensita || prenotazione.hasReviewed),
    };
  }

  private statoPrenotazione(
    dataInizio: Date,
    dataFine: Date,
  ): PrenotazioneProfilo['stato'] {
    const adesso = new Date();
    if (adesso < dataInizio) return 'IN PROGRAMMA';
    if (adesso >= dataInizio && adesso < dataFine) return 'IN CORSO';
    return 'COMPLETATA';
  }

  private calcolaOreStudio(prenotazioni: PrenotazioneProfilo[]): number {
    const totaleOre = prenotazioni.reduce((totale, prenotazione) => {
      const inizio = this.minutiDaOrario(prenotazione.oraInizio);
      const fine = this.minutiDaOrario(prenotazione.oraFine);
      if (inizio === null || fine === null || fine <= inizio) return totale;
      return totale + (fine - inizio) / 60;
    }, 0);

    return Math.round(totaleOre * 10) / 10;
  }

  private minutiDaOrario(orario: string): number | null {
    const parti = String(orario || '')
      .split(':')
      .slice(0, 2)
      .map(Number);
    if (parti.length < 2 || parti.some((parte) => Number.isNaN(parte))) {
      return null;
    }
    return parti[0] * 60 + parti[1];
  }

  private preparaAnteprima(url?: string): string | SafeResourceUrl {
    if (!url) return '';
    if (this.isPdfDataUrl(url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return url;
  }

  private isPdfDataUrl(url?: string): boolean {
    return !!url && (url.startsWith('data:application/pdf') || url.toLowerCase().includes('.pdf'));
  }

  private tipoMateriale(url?: string): 'pdf' | 'appunti' {
    if (url && !url.startsWith('data:')) {
      return url.toLowerCase().includes('.pdf') ? 'pdf' : 'appunti';
    }
    return this.mimeDaDataUrl(url).includes('pdf') ? 'pdf' : 'appunti';
  }

  private etichettaFile(url?: string): string {
    if (url && !url.startsWith('data:')) {
      return this.estensioneFile(url).toUpperCase();
    }
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
    const estensione = String(url || '').split('?')[0].split('.').pop();
    if (url && !url.startsWith('data:') && estensione && estensione.length <= 5) {
      return estensione.toLowerCase();
    }
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

}

