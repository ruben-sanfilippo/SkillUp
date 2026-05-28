import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
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
  lingue: string[] = ['Italiano', 'Inglese'];

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

    const tutor = await this.tutorService.getTutor(id);
    this.nome = tutor.nome;
    this.cognome = tutor.cognome;
    this.biografia = tutor.bio || '';
    this.mediaRecensioni = tutor.rating;
    this.numeroRecensioni = tutor.reviews;
    this.prezzoOrario = tutor.price;
    this.avatarUrl = tutor.image;
    this.materie = tutor.subjects || [];
    this.lingue = tutor.languages || [];

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
      haAnteprima: !!materiale.anteprima_url,
      isPdfPreview: false,
      anteprimaUrl: materiale.anteprima_url,
    }));
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

  generaSlotOrari(inizio: string, fine: string) {
    this.orariGenerati = [];
    let startHour = parseInt(inizio.split(':')[0]);
    let endHour = parseInt(fine.split(':')[0]);
    for (let i = startHour; i <= endHour; i++) {
      const oraIntera = `${i.toString().padStart(2, '0')}:00`;
      if (this.puoPrenotareOrario(oraIntera)) {
        this.orariGenerati.push(oraIntera);
      }
      if (i !== endHour)
        {
          const mezzaOra = `${i.toString().padStart(2, '0')}:30`;
          if (this.puoPrenotareOrario(mezzaOra)) {
            this.orariGenerati.push(mezzaOra);
          }
        }
    }
    this.oraInizioSelezionata = this.orariGenerati[0] || '';
    this.oraFineSelezionata =
      this.orariGenerati[2] ||
      this.orariGenerati[this.orariGenerati.length - 1] ||
      '';
  }

  contattaTutor() {
    this.router.navigate(['/tabs/messages']);
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
    if (!this.giornoSelezionato || !this.giornoSelezionato.info.attivo) return;
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

  private dataLocale(data: Date): string {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  }
}
