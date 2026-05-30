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
import type {
  PrenotazioneProfilo,
  MaterialeAcquistato,
  DatiStudente,
} from 'src/app/interfaces/profile.interfaces';
import type { PrenotazioneApi } from 'src/app/interfaces/api.interfaces';

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

  selectedBookingForReview: PrenotazioneProfilo | null = null;
  selectedMaterialPreview: MaterialeAcquistato | null = null;
  currentRating: number = 0;
  tempBio: string = '';
  email = '';

  student: DatiStudente = {
    nome: 'Alessandro',
    cognome: 'Rossi',
    immagineProfilo: '',
    biografia:
      "Appassionato di intelligenza artificiale e machine learning. Sviluppo algoritmi efficienti per l'analisi dati.",
    sessioniCompletate: 24,
    oreStudio: 112,
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

  recentBookings: PrenotazioneProfilo[] = [];
  allBookings: PrenotazioneProfilo[] = [];
  purchasedMaterials: MaterialeAcquistato[] = [];

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

    const prenotazioniMappate = prenotazioni.map((prenotazione) =>
      this.mappaPrenotazione(prenotazione),
    );

    this.email = utente.email || '';
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
    const tutorId = this.selectedBookingForReview.tutorId;

    try {
      await this.platformService.createReview({
        prenotazione_id: targetId,
        voto: this.currentRating,
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

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.student.immagineProfilo = reader.result as string;
        this.platformService.updateMe({
          immagine_profilo: this.student.immagineProfilo,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  rimuoviAvatar() {
    this.student.immagineProfilo = '';
    this.platformService.updateMe({ immagine_profilo: '' });
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
      await this.platformService.updateMe({ bio: this.student.biografia });
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
      this.avatarTutorPredefinito(nomeTutor);

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

  private avatarTutorPredefinito(nomeTutor: string): string {
    const nome = encodeURIComponent(nomeTutor || 'Tutor');
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

  private tipoMateriale(url?: string): 'pdf' | 'appunti' {
    return this.mimeDaDataUrl(url).includes('pdf') ? 'pdf' : 'appunti';
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

  private async creaBlobDownload(item: MaterialeAcquistato): Promise<Blob> {
    if (item.urlFile?.startsWith('data:')) {
      const response = await fetch(item.urlFile);
      return response.blob();
    }

    return new Blob([`Titolo: ${item.titolo}\nAutore: ${item.autore}`], {
      type: 'text/plain;charset=utf-8',
    });
  }
}

