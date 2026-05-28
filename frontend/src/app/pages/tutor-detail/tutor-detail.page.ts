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
  fasce?: FasciaDisponibilita[];
}

interface MateriaTutor {
  id: number;
  nome: string;
}

interface FasciaDisponibilita {
  id?: number;
  dalle: string;
  alle: string;
  orariInizio?: string[];
  orariFinePerInizio?: Record<string, string[]>;
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
  databaseDisponibilita: { [key: string]: FasciaDisponibilita[] } = {};
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
    this.materiePrenotabili = this.normalizzaMateriePrenotabili(tutor);
    this.materiaSelezionataId = this.materiePrenotabili[0]?.id || null;
    this.lingue = tutor.languages || [];
    this.slotPrenotati = tutor.bookedSlots || [];

    this.databaseDisponibilita = this.creaDisponibilitaDaSchedule(
      tutor.availableSchedule || [],
    );

    if (Object.keys(this.databaseDisponibilita).length === 0) {
      this.databaseDisponibilita = this.creaDisponibilitaDaFasce(
        tutor.availability || [],
      );
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

  private creaDisponibilitaDaSchedule(schedule: any[]): {
    [key: string]: FasciaDisponibilita[];
  } {
    const disponibilita: { [key: string]: FasciaDisponibilita[] } = {};

    for (const item of schedule) {
      const data = this.normalizzaData(item.data);
      const orariInizio = (item.availableStarts || [])
        .map((orario: string) => this.normalizzaOrario(orario))
        .filter(Boolean);

      if (!data || orariInizio.length === 0) continue;

      const fascia: FasciaDisponibilita = {
        id: item.disponibilita_id,
        dalle: this.normalizzaOrario(item.ora_inizio),
        alle: this.normalizzaOrario(item.ora_fine),
        orariInizio,
        orariFinePerInizio: item.availableEndsByStart || {},
      };

      disponibilita[data] = [...(disponibilita[data] || []), fascia];
    }

    return disponibilita;
  }

  private creaDisponibilitaDaFasce(items: any[]): {
    [key: string]: FasciaDisponibilita[];
  } {
    const disponibilita: { [key: string]: FasciaDisponibilita[] } = {};

    for (const item of items) {
      const data = this.normalizzaData(item.data);
      if (!data) continue;

      const fascia = {
        id: item.id,
        dalle: this.normalizzaOrario(item.ora_inizio),
        alle: this.normalizzaOrario(item.ora_fine),
      };

      if (!fascia.dalle || !fascia.alle) continue;

      const fasceGiorno = disponibilita[data] || [];
      const giaPresente = fasceGiorno.some(
        (esistente) =>
          esistente.dalle === fascia.dalle && esistente.alle === fascia.alle,
      );

      if (!giaPresente) {
        fasceGiorno.push(fascia);
      }

      disponibilita[data] = fasceGiorno;
    }

    return disponibilita;
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

  private normalizzaMateriePrenotabili(tutor: any): MateriaTutor[] {
    const materieConId = new Map<number, string>();

    for (const materia of tutor.subjectOptions || []) {
      const id = Number(materia.id);
      if (Number.isFinite(id) && materia.nome) {
        materieConId.set(id, materia.nome);
      }
    }

    for (const disponibilita of tutor.availability || []) {
      const id = Number(disponibilita.materia_id);
      if (Number.isFinite(id) && disponibilita.materia) {
        materieConId.set(id, disponibilita.materia);
      }
    }

    return Array.from(materieConId, ([id, nome]) => ({ id, nome }));
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
      const fasceGiorno = this.databaseDisponibilita[dataStr] || [];
      const fasceLibere = fasceGiorno.filter((fascia) =>
        this.esisteSlotDisponibile(dataStr, fascia),
      );
      const primaFascia = fasceLibere[0] || fasceGiorno[0];
      const info = primaFascia
        ? {
            id: primaFascia.id,
            attivo: fasceLibere.length > 0,
            dalle: primaFascia.dalle,
            alle: primaFascia.alle,
            fasce: fasceLibere,
          }
        : {
            attivo: false,
            dalle: '',
            alle: '',
          };

      this.giorniDelMese.push({
        giorno: g,
        dataString: dataStr,
        info,
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
      this.generaSlotOrari();
    } else {
      this.orariGenerati = [];
      this.oraInizioSelezionata = '';
      this.oraFineSelezionata = '';
    }
  }

  cambiaMateriaPrenotazione(event?: CustomEvent) {
    const valore = event?.detail?.value;
    if (valore !== undefined && valore !== null) {
      this.materiaSelezionataId = Number(valore);
    }

    if (this.giornoSelezionato?.info.attivo) {
      this.generaSlotOrari();
    }
  }

  generaSlotOrari() {
    if (!this.giornoSelezionato) {
      this.orariGenerati = [];
      this.oraInizioSelezionata = '';
      this.oraFineSelezionata = '';
      return;
    }

    const fasce = this.giornoSelezionato.info.fasce || [];
    const orari: string[] = [];

    for (const fascia of fasce) {
      if (fascia.orariInizio?.length) {
        orari.push(...fascia.orariInizio);
      } else {
        orari.push(...this.generaOrariInizioDisponibili(
          this.giornoSelezionato!.dataString,
          fascia.dalle,
          fascia.alle,
        ));
      }
    }

    this.orariGenerati = Array.from(new Set(orari)).sort();
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
                disponibilita_id: this.disponibilitaIdPerPrenotazione(),
                materia_id: this.materiaSelezionataId,
                data: this.giornoSelezionato?.dataString,
                ora_inizio: this.oraInizioSelezionata,
                ora_fine: this.oraFineSelezionata,
              });
              const dataPrenotata = this.giornoSelezionato?.dataString;
              const toast = await this.toastController.create({
                message: 'Prenotazione effettuata con successo.',
                duration: 2500,
                position: 'bottom',
                color: 'success',
              });
              await toast.present();
              await this.caricaTutor();
              this.costruisciCalendarioMensile();
              if (dataPrenotata) {
                const giornoAggiornato = this.giorniDelMese.find(
                  (giorno) => giorno.dataString === dataPrenotata,
                );
                if (giornoAggiornato) {
                  this.selezionaGiorno(giornoAggiornato);
                }
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
    return this.puoPrenotareOrarioPerData(this.giornoSelezionato.dataString, orario);
  }

  private puoPrenotareOrarioPerData(data: string, orario: string): boolean {
    const oggi = this.dataLocale(new Date());
    if (data < oggi) return false;
    if (data !== oggi) return true;

    const dataOraSelezionata = new Date(`${data}T${orario}:00`);

    return dataOraSelezionata > new Date();
  }

  get orariFineDisponibili(): string[] {
    if (!this.oraInizioSelezionata || !this.giornoSelezionato?.info.attivo) {
      return [];
    }

    const fascia = this.fasciaPerOrarioInizio(this.oraInizioSelezionata);
    if (!fascia) return [];

    const orariBackend = fascia.orariFinePerInizio?.[this.oraInizioSelezionata];
    if (orariBackend?.length) {
      return orariBackend
        .map((orario) => this.normalizzaOrario(orario))
        .filter(Boolean);
    }

    return this.generaOrariFineDisponibili(
      this.giornoSelezionato.dataString,
      this.oraInizioSelezionata,
      fascia.alle,
    );
  }

  sincronizzaOraFine() {
    if (!this.orariFineDisponibili.includes(this.oraFineSelezionata)) {
      this.oraFineSelezionata = this.orariFineDisponibili[0] || '';
    }
  }

  private esisteSlotDisponibile(data: string, info: FasciaDisponibilita): boolean {
    return this.generaOrariInizioDisponibili(data, info.dalle, info.alle).length > 0;
  }

  private generaOrariInizioDisponibili(
    data: string,
    inizio: string,
    fine: string,
  ): string[] {
    const inizioMinuti = this.minutiDaOrario(inizio);
    const fineMinuti = this.minutiDaOrario(fine);
    if (inizioMinuti === null || fineMinuti === null) return [];

    const orari: string[] = [];
    for (let minuti = inizioMinuti; minuti + 30 <= fineMinuti; minuti += 30) {
      const orario = this.orarioDaMinuti(minuti);
      const fineSlot = this.orarioDaMinuti(minuti + 30);
      if (
        this.puoPrenotareOrarioPerData(data, orario) &&
        !this.intervalloOccupaPrenotazione(data, orario, fineSlot)
      ) {
        orari.push(orario);
      }
    }

    return orari;
  }

  private generaOrariFineDisponibili(
    data: string,
    oraInizio: string,
    fineDisponibilita: string,
  ): string[] {
    const inizioMinuti = this.minutiDaOrario(oraInizio);
    const fineMinuti = this.minutiDaOrario(fineDisponibilita);
    if (inizioMinuti === null || fineMinuti === null) return [];

    const orari: string[] = [];
    for (let minuti = inizioMinuti + 30; minuti <= fineMinuti; minuti += 30) {
      const oraFine = this.orarioDaMinuti(minuti);
      if (!this.intervalloOccupaPrenotazione(data, oraInizio, oraFine)) {
        orari.push(oraFine);
      } else {
        break;
      }
    }

    return orari;
  }

  private intervalloOccupaPrenotazione(
    data: string,
    oraInizio: string,
    oraFine: string,
  ): boolean {
    const dataNormalizzata = this.normalizzaData(data);
    const inizioMinuti = this.minutiDaOrario(oraInizio);
    const fineMinuti = this.minutiDaOrario(oraFine);
    if (!dataNormalizzata || inizioMinuti === null || fineMinuti === null) {
      return false;
    }

    return this.slotPrenotati.some((slot) => {
      const stessaData = this.normalizzaData(slot.data) === dataNormalizzata;
      const slotInizio = this.minutiDaOrario(slot.ora_inizio);
      const slotFine = this.minutiDaOrario(slot.ora_fine);
      if (slotInizio === null || slotFine === null) return false;

      return (
        stessaData &&
        slotInizio < fineMinuti &&
        slotFine > inizioMinuti
      );
    });
  }

  private fasciaPerOrarioInizio(orario: string): FasciaDisponibilita | null {
    if (!this.giornoSelezionato) return null;

    const orarioMinuti = this.minutiDaOrario(orario);
    if (orarioMinuti === null) return null;

    return (
      this.giornoSelezionato.info.fasce?.find((fascia) => {
        const dalle = this.minutiDaOrario(fascia.dalle);
        const alle = this.minutiDaOrario(fascia.alle);
        return dalle !== null && alle !== null && orarioMinuti >= dalle && orarioMinuti < alle;
      }) || null
    );
  }

  private disponibilitaIdPerPrenotazione(): number | undefined {
    return this.fasciaPerOrarioInizio(this.oraInizioSelezionata)?.id;
  }

  private minutiDaOrario(orario: string): number | null {
    const parti = String(orario || '').split(':').slice(0, 2).map(Number);
    if (parti.length < 2 || parti.some((parte) => Number.isNaN(parte))) {
      return null;
    }
    return parti[0] * 60 + parti[1];
  }

  private normalizzaOrario(orario: string): string {
    const minuti = this.minutiDaOrario(orario);
    return minuti === null ? '' : this.orarioDaMinuti(minuti);
  }

  private normalizzaData(data: string): string {
    return String(data || '').slice(0, 10);
  }

  private orarioDaMinuti(minutiTotali: number): string {
    const ore = Math.floor(minutiTotali / 60).toString().padStart(2, '0');
    const minuti = (minutiTotali % 60).toString().padStart(2, '0');
    return `${ore}:${minuti}`;
  }

  private dataLocale(data: Date): string {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  }
}
