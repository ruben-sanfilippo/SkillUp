import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  personOutline,
  cameraOutline,
  star,
  briefcaseOutline,
  documentTextOutline,
  globeOutline,
  locationOutline,
  calendarOutline,
  saveOutline,
  libraryOutline,
  closeCircle,
  checkmarkDoneOutline,
  searchOutline,
  folderOpenOutline,
  createOutline,
  cashOutline,
  imageOutline,
  cloudUploadOutline,
  addCircleOutline,
  documentOutline,
  eyeOutline,
  checkmarkCircleOutline,
  closeOutline,
  downloadOutline,
  timeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  informationCircleOutline,
} from 'ionicons/icons';

interface Dispensa {
  titolo: string;
  descrizione: string;
  prezzo: number | null;
  copertinaUrl?: string;
  anteprimaUrl?: string | SafeResourceUrl;
  isPdfPreview?: boolean;
  fileCompleto?: File | null;
  haAnteprima: boolean;
  haFileCompleto: boolean;
}

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
  selector: 'app-tutor-profile',
  templateUrl: './tutor-profile.page.html',
  styleUrls: ['./tutor-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TutorProfilePage implements OnInit {
  nome = 'Ruben';
  cognome = 'Sanfilippo';
  biografia = "Ingegnere informatico con passione per l'insegnamento delle materie scientifiche.";
  mediaRecensioni = 4.8;
  numeroRecensioni = 24;
  prezzoOrario = 15;

  materieSelezionate: string[] = ['Matematica', 'Fisica'];
  lingueSelezionate: string[] = ['Italiano'];

  isEditingBiografia = false;
  isEditingLingue = false;
  isEditingMaterie = false;
  isEditingDisponibilita = false;
  isViewingAnteprima = false;

  biografiaTmp = '';
  prezzoOrarioTmp = 0;
  materieSelezionateTmp: string[] = [];
  lingueSelezionateTmp: string[] = [];
  dispensaInEvidenza: Dispensa | null = null;

  dataCorrenteCalendario: Date = new Date();
  giorniDelMese: GiornoCalendario[] = [];
  spaziVuotiIniziali: number[] = [];
  giornoSelezionato: GiornoCalendario | null = null;

  databaseDisponibilita: { [key: string]: InfoDisponibilita } = {};
  databaseDisponibilitaTmp: { [key: string]: InfoDisponibilita } = {};

  mesiNomi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  materieDisponibili = [
    'Matematica', 'Fisica', 'Analisi Matematica 1', 'Informatica', 'Chimica', 'Geometria'
  ];
  materieFiltrate: string[] = [];
  mostraListaMaterie = false;

  lingueDisponibili = [
    'Italiano', 'Inglese', 'Spagnolo', 'Francese', 'Tedesco'
  ];
  lingueFiltrate: string[] = [];
  mostraListaLingue = false;

  avatarUrl = '';
  
  // Stati per la gestione del menu contestuale dell'avatar
  isActionSheetAvatarOpen = false;
  @ViewChild('avatarInputHidden') avatarInputHidden!: ElementRef<HTMLInputElement>;

  nuovaDispensa: Dispensa = {
    titolo: '',
    descrizione: '',
    prezzo: null,
    copertinaUrl: '',
    anteprimaUrl: '',
    fileCompleto: null,
    haAnteprima: false,
    haFileCompleto: false,
    isPdfPreview: false,
  };
  listaDispense: Dispensa[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
  ) {
    addIcons({
      personOutline,
      cameraOutline,
      star,
      briefcaseOutline,
      documentTextOutline,
      globeOutline,
      locationOutline,
      calendarOutline,
      saveOutline,
      libraryOutline,
      closeCircle,
      checkmarkDoneOutline,
      searchOutline,
      folderOpenOutline,
      createOutline,
      cashOutline,
      imageOutline,
      cloudUploadOutline,
      addCircleOutline,
      documentOutline,
      eyeOutline,
      checkmarkCircleOutline,
      closeOutline,
      downloadOutline,
      timeOutline,
      chevronBackOutline,
      chevronForwardOutline,
      informationCircleOutline,
    });
  }

  ngOnInit() {
    this.biografiaTmp = this.biografia;
    this.prezzoOrarioTmp = this.prezzoOrario;
    this.materieFiltrate = [...this.materieDisponibili];
    this.lingueFiltrate = [...this.lingueDisponibili];

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

  // Generatore pulsanti dinamici per l'Action Sheet dell'avatar
  get actionSheetButtons() {
    const buttons: any[] = [
      {
        text: this.avatarUrl ? 'Modifica foto' : 'Carica foto',
        icon: 'cloud-upload-outline',
        handler: () => {
          this.avatarInputHidden.nativeElement.click();
        },
      },
    ];

    if (this.avatarUrl) {
      buttons.push({
        text: 'Rimuovi foto',
        role: 'destructive',
        icon: 'close-outline',
        handler: () => {
          this.rimuoviAvatar();
        },
      });
    }

    buttons.push({
      text: 'Annulla',
      role: 'cancel',
      icon: 'close-circle',
    });

    return buttons;
  }

  apriMenuAvatar() {
    this.isActionSheetAvatarOpen = true;
  }

  rimuoviAvatar() {
    this.avatarUrl = '';
    if (this.avatarInputHidden && this.avatarInputHidden.nativeElement) {
      this.avatarInputHidden.nativeElement.value = '';
    }
  }

  costruisciCalendarioMensile() {
    const anno = this.dataCorrenteCalendario.getFullYear();
    const mese = this.dataCorrenteCalendario.getMonth();

    const primoGiornoMese = new Date(anno, mese, 1);
    let giornoSettimanaInizio = primoGiornoMese.getDay();
    if (giornoSettimanaInizio === 0) giornoSettimanaInizio = 7;

    const nSpaziVuoti = giornoSettimanaInizio - 1;
    this.spaziVuotiIniziali = Array(nSpaziVuoti).fill(0);

    const totaleGiorni = new Date(anno, mese + 1, 0).getDate();
    const dbAttivo = this.isEditingDisponibilita ? this.databaseDisponibilitaTmp : this.databaseDisponibilita;

    this.giorniDelMese = [];
    for (let g = 1; g <= totaleGiorni; g++) {
      const meseString = (mese + 1).toString().padStart(2, '0');
      const giornoString = g.toString().padStart(2, '0');
      const dataStr = `${anno}-${meseString}-${giornoString}`;

      if (!dbAttivo[dataStr]) {
        dbAttivo[dataStr] = { attivo: false, dalle: '09:00', alle: '18:00' };
      }

      this.giorniDelMese.push({
        giorno: g,
        dataString: dataStr,
        info: dbAttivo[dataStr],
      });
    }

    if (this.giornoSelezionato) {
      const trovato = this.giorniDelMese.find(d => d.dataString === this.giornoSelezionato!.dataString);
      if (trovato) {
        this.giornoSelezionato = trovato;
      } else {
        const dataStr = this.giornoSelezionato.dataString;
        if (!dbAttivo[dataStr]) dbAttivo[dataStr] = { attivo: false, dalle: '09:00', alle: '18:00' };
        this.giornoSelezionato = {
          giorno: parseInt(dataStr.split('-')[2]),
          dataString: dataStr,
          info: dbAttivo[dataStr],
        };
      }
    }
  }

  cambiaMese(direzione: number) {
    const nuovoMese = this.dataCorrenteCalendario.getMonth() + direzione;
    this.dataCorrenteCalendario = new Date(this.dataCorrenteCalendario.getFullYear(), nuovoMese, 1);
    this.costruisciCalendarioMensile();
  }

  selezionaGiorno(giorno: GiornoCalendario) {
    this.giornoSelezionato = giorno;
  }

  attivaModificaLingue() {
    this.lingueSelezionateTmp = [...this.lingueSelezionate];
    this.isEditingLingue = true;
  }
  attivaModificaMaterie() {
    this.materieSelezionateTmp = [...this.materieSelezionate];
    this.isEditingMaterie = true;
  }

  attivaModificaDisponibilita() {
    this.prezzoOrarioTmp = this.prezzoOrario;
    this.databaseDisponibilitaTmp = {};

    for (const key in this.databaseDisponibilita) {
      this.databaseDisponibilitaTmp[key] = { ...this.databaseDisponibilita[key] };
    }

    this.isEditingDisponibilita = true;
    this.costruisciCalendarioMensile();
  }

  filtraMaterie(ev: any) {
    const val = ev.target.value.toLowerCase();
    this.materieFiltrate = this.materieDisponibili.filter(m => m.toLowerCase().includes(val));
  }

  filtraLingue(ev: any) {
    const val = ev.target.value.toLowerCase();
    this.lingueFiltrate = this.lingueDisponibili.filter(l => l.toLowerCase().includes(val));
  }

  aggiungiMateria(m: string) {
    if (!this.materieSelezionateTmp.includes(m)) this.materieSelezionateTmp.push(m);
    this.mostraListaMaterie = false;
  }
  rimuoviMateria(m: string) {
    this.materieSelezionateTmp = this.materieSelezionateTmp.filter(item => item !== m);
  }
  aggiungiLingua(l: string) {
    if (!this.lingueSelezionateTmp.includes(l)) this.lingueSelezionateTmp.push(l);
    this.mostraListaLingue = false;
  }
  rimuoviLingua(l: string) {
    this.lingueSelezionateTmp = this.lingueSelezionateTmp.filter(item => item !== l);
  }

  async mostraPopupErroreOrario() {
    const alert = await this.alertController.create({
      header: 'Orario non valido',
      subHeader: 'Controlla le fasce orarie',
      message: "L'orario di inizio non può essere successivo o uguale all'orario di fine. Correggi le giornate configurate errate prima di procedere.",
      buttons: [{ text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' }],
    });
    await alert.present();
  }

  async mostraPopupErroreDispensa() {
    const alert = await this.alertController.create({
      header: 'Campi incompleti',
      subHeader: 'Impossibile pubblicare',
      message: 'Per caricare una nuova dispensa devi compilare obbligatoriamente il Titolo, impostare un Prezzo e inserire il File Completo (PDF o ZIP).',
      buttons: [{ text: 'Ho capito', role: 'cancel', cssClass: 'alert-button-primary' }],
    });
    await alert.present();
  }

  async salvaSezione(sezione: string) {
    if (sezione === 'biografia') {
      this.biografia = this.biografiaTmp ? this.biografiaTmp.substring(0, 200) : '';
      this.isEditingBiografia = false;
    } else if (sezione === 'lingue') {
      this.lingueSelezionate = [...this.lingueSelezionateTmp];
      this.isEditingLingue = false;
    } else if (sezione === 'materie') {
      this.materieSelezionate = [...this.materieSelezionateTmp];
      this.isEditingMaterie = false;
    } else if (sezione === 'disponibilita') {
      for (const dataKey in this.databaseDisponibilitaTmp) {
        const blocco = this.databaseDisponibilitaTmp[dataKey];
        if (blocco.attivo) {
          if (blocco.dalle >= blocco.alle) {
            await this.mostraPopupErroreOrario();
            return;
          }
        }
      }

      this.prezzoOrario = this.prezzoOrarioTmp;
      this.databaseDisponibilita = {};

      for (const key in this.databaseDisponibilitaTmp) {
        this.databaseDisponibilita[key] = { ...this.databaseDisponibilitaTmp[key] };
      }

      this.isEditingDisponibilita = false;
      this.costruisciCalendarioMensile();
    }
  }

  annullaModifica(sezione: string) {
    if (sezione === 'biografia') {
      this.biografiaTmp = this.biografia;
      this.isEditingBiografia = false;
    } else if (sezione === 'lingue') this.isEditingLingue = false;
    else if (sezione === 'materie') this.isEditingMaterie = false;
    else if (sezione === 'disponibilita') {
      this.prezzoOrarioTmp = this.prezzoOrario;
      this.isEditingDisponibilita = false;
      this.databaseDisponibilitaTmp = {};
      this.costruisciCalendarioMensile();
    }
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.avatarUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onCopertinaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.nuovaDispensa.copertinaUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onAnteprimaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        const blobUrl = URL.createObjectURL(file);
        this.nuovaDispensa.anteprimaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.nuovaDispensa.isPdfPreview = true;
        this.nuovaDispensa.haAnteprima = true;
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.nuovaDispensa.anteprimaUrl = reader.result as string;
          this.nuovaDispensa.isPdfPreview = false;
          this.nuovaDispensa.haAnteprima = true;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onFileCompletoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.nuovaDispensa.fileCompleto = file;
      this.nuovaDispensa.haFileCompleto = true;
    }
  }

  async aggiungiDispensa(
    copertinaEl: HTMLInputElement,
    anteprimaEl: HTMLInputElement,
    fileCompletoEl: HTMLInputElement,
  ) {
    if (!this.nuovaDispensa.titolo || this.nuovaDispensa.prezzo === null || !this.nuovaDispensa.haFileCompleto) {
      await this.mostraPopupErroreDispensa();
      return;
    }

    const dispensaDaSalvare: Dispensa = {
      titolo: this.nuovaDispensa.titolo,
      descrizione: this.nuovaDispensa.descrizione,
      prezzo: this.nuovaDispensa.prezzo,
      copertinaUrl: this.nuovaDispensa.copertinaUrl,
      anteprimaUrl: this.nuovaDispensa.anteprimaUrl,
      isPdfPreview: this.nuovaDispensa.isPdfPreview,
      fileCompleto: this.nuovaDispensa.fileCompleto,
      haAnteprima: this.nuovaDispensa.haAnteprima,
      haFileCompleto: this.nuovaDispensa.haFileCompleto,
    };

    this.listaDispense.push(dispensaDaSalvare);

    if (copertinaEl) copertinaEl.value = '';
    if (anteprimaEl) anteprimaEl.value = '';
    if (fileCompletoEl) fileCompletoEl.value = '';

    this.nuovaDispensa = {
      titolo: '',
      descrizione: '',
      prezzo: null,
      copertinaUrl: '',
      anteprimaUrl: '',
      fileCompleto: null,
      haAnteprima: false,
      haFileCompleto: false,
      isPdfPreview: false,
    };
  }

  scaricaFileCompleto(dispensa: Dispensa) {
    if (!dispensa.fileCompleto) {
      alert('Nessun file scaricabile trovato.');
      return;
    }
    const url = URL.createObjectURL(dispensa.fileCompleto);
    const link = document.createElement('a');
    link.href = url;
    link.download = dispensa.fileCompleto.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  apriAnteprimaStudente(dispensa: Dispensa) {
    this.dispensaInEvidenza = dispensa;
    this.isViewingAnteprima = true;
  }
  chiudiAnteprimaStudente() {
    this.isViewingAnteprima = false;
    this.dispensaInEvidenza = null;
  }
}