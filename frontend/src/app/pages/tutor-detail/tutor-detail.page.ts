import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  personOutline,
  star,
  briefcaseOutline,
  globeOutline,
  calendarOutline,
  libraryOutline,
  chatbubbleEllipsesOutline,
  folderOpenOutline,
  cashOutline,
  documentOutline,
  chevronBackOutline,
  chevronForwardOutline,
  timeOutline,
  informationCircleOutline,
  cartOutline,
  eyeOutline,
  closeOutline,
} from 'ionicons/icons';
import { TutorService } from 'src/app/services/tutorService';

interface InfoDisponibilita {
  id?: number;
  attivo: boolean;
  dalle: string;
  alle: string;
}

interface MateriaTutor {
  id: number;
  nome: string;
}

interface SlotPrenotato {
  materia_id: number;
  data: string;
  ora_inizio: string;
  ora_fine: string;
}
interface GiornoCalendario {
  giorno: number;
  dataString: string;
  info: InfoDisponibilita;
}

@Component({
  selector: 'app-tutor-detail',
  templateUrl: './tutor-detail.page.html',
  styleUrls: ['./tutor-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TutorDetailPage implements OnInit {
  nome = 'Ruben';
  cognome = 'Sanfilippo';
  biografia =
    "Ingegnere informatico con passione per l'insegnamento delle materie scientifiche.";
  mediaRecensioni = 4.8;
  numeroRecensioni = 24;
  prezzoOrario = 15;
  avatarUrl = '';
  materie: string[] = ['Matematica', 'Fisica', 'Informatica'];
  materiePrenotabili: MateriaTutor[] = [];
  materiaSelezionataId: number | null = null;
  lingue: string[] = ['Italiano', 'Inglese'];
  ruoloUtente = localStorage.getItem('tipologia_utente') || '';
  tutorId: string | null = null;

  // Struttura identica a tutor-profile
  dispense: any[] = [];

  // Calendario
  dataCorrenteCalendario: Date = new Date();
  giorniDelMese: GiornoCalendario[] = [];
  spaziVuotiIniziali: number[] = [];
  giornoSelezionato: GiornoCalendario | null = null;
  mesiNomi = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ];
  databaseDisponibilita: { [key: string]: InfoDisponibilita } = {};
  slotPrenotati: SlotPrenotato[] = [];

  orariGenerati: string[] = [];
  oraInizioSelezionata: string = '';
  oraFineSelezionata: string = '';

  // Logica Anteprima (Replica di tutor-profile)
  isViewingAnteprima = false;
  dispensaInEvidenza: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
    private tutorService: TutorService,
  ) {
    addIcons({
      personOutline,
      star,
      briefcaseOutline,
      globeOutline,
      calendarOutline,
      libraryOutline,
      chatbubbleEllipsesOutline,
      folderOpenOutline,
      cashOutline,
      documentOutline,
      chevronBackOutline,
      chevronForwardOutline,
      timeOutline,
      informationCircleOutline,
      cartOutline,
      eyeOutline,
      closeOutline,
    });
  }

  async ngOnInit() {
    await this.caricaTutor();
    this.costruisciCalendarioMensile();
  }

  async caricaTutor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.tutorId = id;

    const tutor = await this.tutorService.getTutor(id);
    this.nome = tutor.nome;
    this.cognome = tutor.cognome;
    this.biografia = tutor.bio || '';
    this.mediaRecensioni = tutor.rating;
    this.numeroRecensioni = tutor.reviews;
    this.prezzoOrario = tutor.price;
    this.avatarUrl = tutor.image;
    this.materie = tutor.subjects || [];
    this.materiePrenotabili = tutor.subjectOptions || [];
    this.materiaSelezionataId = this.materiePrenotabili[0]?.id || null;
    this.lingue = tutor.languages || [];
    this.slotPrenotati = tutor.bookedSlots || [];

    this.databaseDisponibilita = {};
    for (const item of tutor.availability || []) {
      if (!item.data) continue;
      this.databaseDisponibilita[item.data] = {
        id: item.id,
        attivo: true,
        dalle: item.ora_inizio,
        alle: item.ora_fine,
      };
    }

    this.dispense = (tutor.materials || []).map((materiale: any) => ({
      id: materiale.id,
      titolo: materiale.titolo,
      descrizione: materiale.descrizione,
      prezzo: materiale.importo,
      copertinaUrl: materiale.copertina_url,
      haAnteprima: !!materiale.anteprima_url,
      isPdfPreview: this.isPdfDataUrl(materiale.anteprima_url),
      anteprimaUrl: this.preparaAnteprima(materiale.anteprima_url),
    }));
  }

  private isPdfDataUrl(url?: string): boolean {
    return !!url && url.startsWith('data:application/pdf');
  }

  private preparaAnteprima(url?: string): string | SafeResourceUrl {
    if (!url) return '';
    if (this.isPdfDataUrl(url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return url;
  }

  get puoInteragireComeStudente(): boolean {
    return this.ruoloUtente === 'studente';
  }

  get nomeMeseCorrente(): string {
    return this.mesiNomi[this.dataCorrenteCalendario.getMonth()];
  }
  get annoCorrente(): number {
    return this.dataCorrenteCalendario.getFullYear();
  }
  get dataFormattataPannello(): string {
    if (!this.giornoSelezionato) return '';
    const parti = this.giornoSelezionato.dataString.split('-');
    return `${parti[2]} ${this.mesiNomi[parseInt(parti[1]) - 1]} ${parti[0]}`;
  }

  costruisciCalendarioMensile() {
    const anno = this.dataCorrenteCalendario.getFullYear();
    const mese = this.dataCorrenteCalendario.getMonth();
    const primoGiornoMese = new Date(anno, mese, 1);
    let giornoSettimanaInizio = primoGiornoMese.getDay();
    if (giornoSettimanaInizio === 0) giornoSettimanaInizio = 7;
    this.spaziVuotiIniziali = Array(giornoSettimanaInizio - 1).fill(0);
    const totaleGiorni = new Date(anno, mese + 1, 0).getDate();

    this.giorniDelMese = [];
    for (let g = 1; g <= totaleGiorni; g++) {
      const dataStr = `${anno}-${(mese + 1).toString().padStart(2, '0')}-${g.toString().padStart(2, '0')}`;
      this.giorniDelMese.push({
        giorno: g,
        dataString: dataStr,
        info: this.databaseDisponibilita[dataStr] || {
          attivo: false,
          dalle: '',
          alle: '',
        },
      });
    }
  }

  cambiaMese(direzione: number) {
    this.dataCorrenteCalendario = new Date(
      this.dataCorrenteCalendario.getFullYear(),
      this.dataCorrenteCalendario.getMonth() + direzione,
      1,
    );
    this.costruisciCalendarioMensile();
  }

  selezionaGiorno(giorno: GiornoCalendario) {
    this.giornoSelezionato = giorno;
    if (giorno.info && giorno.info.attivo) {
      this.generaSlotOrari(giorno.info.dalle, giorno.info.alle);
    }
  }

  cambiaMateriaPrenotazione() {
    if (this.giornoSelezionato?.info.attivo) {
      this.generaSlotOrari(
        this.giornoSelezionato.info.dalle,
        this.giornoSelezionato.info.alle,
      );
    }
  }

  generaSlotOrari(inizio: string, fine: string) {
    this.orariGenerati = [];
    let startHour = parseInt(inizio.split(':')[0]);
    let endHour = parseInt(fine.split(':')[0]);
    for (let i = startHour; i <= endHour; i++) {
      const oraIntera = `${i.toString().padStart(2, '0')}:00`;
      if (this.puoPrenotareOrario(oraIntera) && this.slotLibero(oraIntera)) {
        this.orariGenerati.push(oraIntera);
      }
      if (i !== endHour)
        {
          const mezzaOra = `${i.toString().padStart(2, '0')}:30`;
          if (this.puoPrenotareOrario(mezzaOra) && this.slotLibero(mezzaOra)) {
            this.orariGenerati.push(mezzaOra);
          }
        }
    }
    this.oraInizioSelezionata = this.orariGenerati[0] || '';
    this.sincronizzaOraFine();
  }

  contattaTutor() {
    if (!this.puoInteragireComeStudente) return;
    this.router.navigate(['/tabs/messages'], {
      queryParams: { userId: this.tutorId },
    });
  }

  // Gestione Modale Anteprima come tutor-profile
  apriAnteprimaStudente(dispensa: any) {
    this.dispensaInEvidenza = dispensa;
    this.isViewingAnteprima = true;
  }
  chiudiAnteprimaStudente() {
    this.isViewingAnteprima = false;
    setTimeout(() => (this.dispensaInEvidenza = null), 300);
  }

  async acquistaDispensa(dispensa: any) {
    if (!this.puoInteragireComeStudente) return;
    const alert = await this.alertController.create({
      header: 'Conferma Acquisto',
      message: `Confermi l'acquisto di "${dispensa.titolo}" per ${dispensa.prezzo}€?`,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Acquista',
          cssClass: 'alert-button-primary',
          handler: async () => {
            await this.tutorService.purchaseMaterial(dispensa.id);
          },
        },
      ],
    });
    await alert.present();
  }

  async prenotaLezione() {
    if (!this.puoInteragireComeStudente) return;
    if (!this.giornoSelezionato || !this.giornoSelezionato.info.attivo) return;
    if (!this.materiaSelezionataId) {
      const alertErrore = await this.alertController.create({
        header: 'Materia richiesta',
        message: 'Seleziona la materia della lezione.',
        buttons: ['OK'],
      });
      await alertErrore.present();
      return;
    }
    if (!this.oraInizioSelezionata || !this.oraFineSelezionata) {
      const alertErrore = await this.alertController.create({
        header: 'Nessun orario disponibile',
        message: 'Per questo giorno non ci sono orari prenotabili.',
        buttons: ['OK'],
      });
      await alertErrore.present();
      return;
    }
    if (this.oraInizioSelezionata >= this.oraFineSelezionata) {
      const alertErrore = await this.alertController.create({
        header: 'Orario non valido',
        message:
          "L'orario di fine deve essere successivo all'orario di inizio.",
        buttons: ['OK'],
      });
      await alertErrore.present();
      return;
    }
    if (!this.puoPrenotareOrario(this.oraInizioSelezionata)) {
      const alertErrore = await this.alertController.create({
        header: 'Orario non prenotabile',
        message:
          "Non puoi prenotare una lezione di oggi con un orario precedente all'ora attuale.",
        buttons: ['OK'],
      });
      await alertErrore.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Conferma Prenotazione',
      message: `Vuoi prenotare una lezione per il ${this.dataFormattataPannello} dalle ${this.oraInizioSelezionata} alle ${this.oraFineSelezionata}?`,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Prenota',
          cssClass: 'alert-button-primary',
          handler: async () => {
            try {
              await this.tutorService.createBooking({
                disponibilita_id: this.giornoSelezionato?.info.id,
                materia_id: this.materiaSelezionataId,
                data: this.giornoSelezionato?.dataString,
                ora_inizio: this.oraInizioSelezionata,
                ora_fine: this.oraFineSelezionata,
              });
              const toast = await this.toastController.create({
                message: 'Prenotazione effettuata con successo.',
                duration: 2500,
                position: 'bottom',
                color: 'success',
              });
              await toast.present();
              await this.caricaTutor();
              this.costruisciCalendarioMensile();
              if (this.giornoSelezionato) {
                this.selezionaGiorno(this.giornoSelezionato);
              }
            } catch (error: any) {
              const alertErrore = await this.alertController.create({
                header: 'Prenotazione non riuscita',
                message:
                  error?.error?.message ||
                  'Non è stato possibile completare la prenotazione.',
                buttons: ['OK'],
              });
              await alertErrore.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private puoPrenotareOrario(orario: string): boolean {
    if (!this.giornoSelezionato) return false;
    const oggi = this.dataLocale(new Date());
    if (this.giornoSelezionato.dataString !== oggi) return true;

    const dataOraSelezionata = new Date(
      `${this.giornoSelezionato.dataString}T${orario}:00`,
    );

    return dataOraSelezionata > new Date();
  }

  get orariFineDisponibili(): string[] {
    if (!this.oraInizioSelezionata || !this.giornoSelezionato?.info.attivo) {
      return [];
    }

    return this.orariGenerati.filter((ora) => {
      return (
        ora > this.oraInizioSelezionata &&
        ora <= this.giornoSelezionato!.info.alle &&
        !this.intervalloOccupaPrenotazione(this.oraInizioSelezionata, ora)
      );
    });
  }

  sincronizzaOraFine() {
    if (!this.orariFineDisponibili.includes(this.oraFineSelezionata)) {
      this.oraFineSelezionata = this.orariFineDisponibili[0] || '';
    }
  }

  private slotLibero(orario: string): boolean {
    return !this.intervalloOccupaPrenotazione(orario, this.aggiungiMinuti(orario, 30));
  }

  private intervalloOccupaPrenotazione(oraInizio: string, oraFine: string): boolean {
    if (!this.giornoSelezionato) return false;

    return this.slotPrenotati.some((slot) => {
      const stessaData = slot.data === this.giornoSelezionato?.dataString;

      return (
        stessaData &&
        slot.ora_inizio < oraFine &&
        slot.ora_fine > oraInizio
      );
    });
  }

  private aggiungiMinuti(orario: string, minutiDaAggiungere: number): string {
    const [ore, minuti] = orario.split(':').map(Number);
    const totale = ore * 60 + minuti + minutiDaAggiungere;
    const nuoveOre = Math.floor(totale / 60).toString().padStart(2, '0');
    const nuoviMinuti = (totale % 60).toString().padStart(2, '0');
    return `${nuoveOre}:${nuoviMinuti}`;
  }

  private dataLocale(data: Date): string {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  }
}
