import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
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

interface InfoDisponibilita {
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
  dispense = [
    {
      titolo: 'Appunti di Analisi 1',
      descrizione: 'Tutti i teoremi dimostrati.',
      prezzo: 5.0,
      haAnteprima: true,
      isPdfPreview: false,
      anteprimaUrl: 'https://ionicframework.com/docs/img/demos/thumbnail.svg', // Immagine demo per l'anteprima
    },
    {
      titolo: 'Esercizi Fisica',
      descrizione: 'Dinamica e cinematica con soluzioni.',
      prezzo: 3.5,
      haAnteprima: false,
      isPdfPreview: false,
      anteprimaUrl: '',
    },
  ];

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
  databaseDisponibilita: { [key: string]: InfoDisponibilita } = {
    '2026-05-28': { attivo: true, dalle: '15:00', alle: '18:00' },
    '2026-05-29': { attivo: true, dalle: '10:00', alle: '12:00' },
  };

  orariGenerati: string[] = [];
  oraInizioSelezionata: string = '';
  oraFineSelezionata: string = '';

  // Logica Anteprima (Replica di tutor-profile)
  isViewingAnteprima = false;
  dispensaInEvidenza: any = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private sanitizer: DomSanitizer,
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

  ngOnInit() {
    this.costruisciCalendarioMensile();
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
      this.orariGenerati.push(`${i.toString().padStart(2, '0')}:00`);
      if (i !== endHour)
        this.orariGenerati.push(`${i.toString().padStart(2, '0')}:30`);
    }
    this.oraInizioSelezionata = this.orariGenerati[0];
    this.oraFineSelezionata =
      this.orariGenerati[2] ||
      this.orariGenerati[this.orariGenerati.length - 1];
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
          handler: () => console.log('Acquistato', dispensa),
        },
      ],
    });
    await alert.present();
  }

  async prenotaLezione() {
    if (!this.giornoSelezionato || !this.giornoSelezionato.info.attivo) return;
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

    const alert = await this.alertController.create({
      header: 'Conferma Prenotazione',
      message: `Vuoi prenotare una lezione per il ${this.dataFormattataPannello} dalle ${this.oraInizioSelezionata} alle ${this.oraFineSelezionata}?`,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Prenota',
          cssClass: 'alert-button-primary',
          handler: () => console.log('Prenotato!'),
        },
      ],
    });
    await alert.present();
  }
}
