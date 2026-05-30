import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
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
  logOutOutline,
  trashOutline,
  keyOutline,
} from 'ionicons/icons';
import { TutorService } from 'src/app/services/tutorService';
import type { Dispensa } from 'src/app/interfaces/profile.interfaces';
import type {
  GiornoCalendario,
  InfoDisponibilita,
} from 'src/app/interfaces/tutor.interfaces';

@Component({
  selector: 'app-tutor-profile',
  templateUrl: './tutor-profile.page.html',
  styleUrls: ['./tutor-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TutorProfilePage implements OnInit {
  nome = '';
  cognome = '';
  biografia = '';
  mediaRecensioni = 0;
  numeroRecensioni = 0;
  prezzoOrario = 0;
  email = '';

  materieSelezionate: string[] = [];
  lingueSelezionate: string[] = [];

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

  materieDisponibili = [
    'Matematica',
    'Fisica',
    'Chimica',
    'Biologia',
    'Scienze',
    'Italiano',
    'Letteratura',
    'Storia',
    'Geografia',
    'Filosofia',
    'Latino',
    'Greco',
    'Inglese',
    'Informatica',
    'Analisi Matematica 1',
    'Analisi Matematica 2',
    'Geometria',
    'Algebra Lineare',
    'Statistica',
    'Programmazione',
    'Basi di Dati',
    'Ingegneria del Software',
    'Economia',
    'Diritto',
    'Anatomia',
    'Psicologia',
  ];
  materieFiltrate: string[] = [];
  mostraListaMaterie = false;

  lingueDisponibili = [
    'Italiano',
    'Inglese',
    'Spagnolo',
    'Francese',
    'Tedesco',
    'Portoghese',
    'Cinese',
    'Giapponese',
    'Arabo',
    'Russo',
    'Coreano',
    'Hindi',
    'Olandese',
    'Polacco',
    'Turco',
  ];
  lingueFiltrate: string[] = [];
  mostraListaLingue = false;

  avatarUrl = '';

  isAvatarActionSheetOpen = false;
  @ViewChild('avatarInputHidden')
  avatarInputHidden!: ElementRef<HTMLInputElement>;

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

  nuovaDispensa: Dispensa = {
    titolo: '',
    descrizione: '',
    prezzo: null,
    urlCopertina: '',
    urlAnteprima: '',
    fileCompleto: null,
    haAnteprima: false,
    haFileCompleto: false,
    anteprimaPdf: false,
  };
  listaDispense: Dispensa[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private tutorService: TutorService,
    private router: Router,
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
      logOutOutline,
      trashOutline,
      keyOutline,
    });
  }

  async ngOnInit() {
    await this.caricaProfiloTutor();
    this.biografiaTmp = this.biografia;
    this.prezzoOrarioTmp = this.prezzoOrario;
    this.materieFiltrate = [...this.materieDisponibili];
    this.lingueFiltrate = [...this.lingueDisponibili];

    this.costruisciCalendarioMensile();
  }

  async caricaProfiloTutor() {
    const tutor = await this.tutorService.getTutorMe();
    this.nome = tutor.nome;
    this.cognome = tutor.cognome;
    this.email = tutor.email || '';
    this.biografia = tutor.bio || '';
    this.avatarUrl = tutor.image || '';
    this.mediaRecensioni = Number(tutor.rating || 0);
    this.numeroRecensioni = tutor.reviews;
    this.prezzoOrario = tutor.price || this.prezzoOrario;
    this.materieSelezionate = tutor.subjects || [];
    this.lingueSelezionate = tutor.languages || [];
    this.databaseDisponibilita = {};

    for (const item of tutor.availability || []) {
      if (!item.data) continue;
      this.databaseDisponibilita[item.data] = {
        attivo: true,
        dalle: item.ora_inizio || item.oraInizio || '',
        alle: item.ora_fine || item.oraFine || '',
      };
    }

    this.listaDispense = (tutor.materials || []).map((materiale: any) => ({
      id: materiale.id,
      titolo: materiale.titolo,
      descrizione: materiale.descrizione,
      prezzo: materiale.importo,
      urlCopertina: materiale.copertina_url,
      urlAnteprimaRaw: materiale.anteprima_url,
      urlAnteprima: this.preparaAnteprima(materiale.anteprima_url),
      anteprimaPdf: this.isPdfDataUrl(materiale.anteprima_url),
      urlFile: materiale.file_url,
      haAnteprima: !!materiale.anteprima_url,
      haFileCompleto: !!materiale.file_url,
      fileCompleto: null,
    }));
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
        returnUrl: '/tabs/tutor-profile',
      },
    });
  }

  get nomeMeseCorrente(): string {
    return this.mesiNomi[this.dataCorrenteCalendario.getMonth()];
  }

  get annoCorrente(): number {
    return this.dataCorrenteCalendario.getFullYear();
  }

  get dataFormattataPannello(): string {
    if (!this.giornoSelezionato) return '';
    const parti = this.giornoSelezionato.dataIso.split('-');
    return `${parti[2]} ${this.mesiNomi[parseInt(parti[1]) - 1]} ${parti[0]}`;
  }

  apriMenuAvatar() {
    this.isAvatarActionSheetOpen = true;
  }

  triggerFileInput() {
    if (this.avatarInputHidden?.nativeElement) {
      this.avatarInputHidden.nativeElement.click();
      return;
    }

    const fileInput = document.getElementById(
      'avatarTutorFileInput',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  async rimuoviAvatar() {
    this.avatarUrl = '';
    if (this.avatarInputHidden && this.avatarInputHidden.nativeElement) {
      this.avatarInputHidden.nativeElement.value = '';
    }
    await this.tutorService.updateTutorMe({ immagine_profilo: '' });
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
    const dbAttivo = this.isEditingDisponibilita
      ? this.databaseDisponibilitaTmp
      : this.databaseDisponibilita;

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
        dataIso: dataStr,
        info: dbAttivo[dataStr],
      });
    }

    if (this.giornoSelezionato) {
      const trovato = this.giorniDelMese.find(
        (d) => d.dataIso === this.giornoSelezionato!.dataIso,
      );
      if (trovato) {
        this.giornoSelezionato = trovato;
      } else {
        const dataStr = this.giornoSelezionato.dataIso;
        if (!dbAttivo[dataStr])
          dbAttivo[dataStr] = { attivo: false, dalle: '09:00', alle: '18:00' };
        this.giornoSelezionato = {
          giorno: parseInt(dataStr.split('-')[2]),
          dataIso: dataStr,
          info: dbAttivo[dataStr],
        };
      }
    }
  }

  cambiaMese(direzione: number) {
    const nuovoMese = this.dataCorrenteCalendario.getMonth() + direzione;
    this.dataCorrenteCalendario = new Date(
      this.dataCorrenteCalendario.getFullYear(),
      nuovoMese,
      1,
    );
    this.costruisciCalendarioMensile();
  }

  selezionaGiorno(giorno: GiornoCalendario) {
    this.giornoSelezionato = giorno;
  }

  isGiornoPassato(giorno: GiornoCalendario | null): boolean {
    if (!giorno) return false;
    return giorno.dataIso < this.dataLocale(new Date());
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
      this.databaseDisponibilitaTmp[key] = {
        ...this.databaseDisponibilita[key],
      };
    }

    this.isEditingDisponibilita = true;
    this.costruisciCalendarioMensile();
  }

  filtraMaterie(ev: any) {
    const val = ev.target.value.toLowerCase();
    this.materieFiltrate = this.materieDisponibili.filter((m) =>
      m.toLowerCase().includes(val),
    );
  }

  filtraLingue(ev: any) {
    const val = ev.target.value.toLowerCase();
    this.lingueFiltrate = this.lingueDisponibili.filter((l) =>
      l.toLowerCase().includes(val),
    );
  }

  aggiungiMateria(m: string) {
    if (!this.materieSelezionateTmp.includes(m))
      this.materieSelezionateTmp.push(m);
    this.mostraListaMaterie = false;
  }
  rimuoviMateria(m: string) {
    this.materieSelezionateTmp = this.materieSelezionateTmp.filter(
      (item) => item !== m,
    );
  }
  aggiungiLingua(l: string) {
    if (!this.lingueSelezionateTmp.includes(l))
      this.lingueSelezionateTmp.push(l);
    this.mostraListaLingue = false;
  }
  rimuoviLingua(l: string) {
    this.lingueSelezionateTmp = this.lingueSelezionateTmp.filter(
      (item) => item !== l,
    );
  }

  async mostraPopupErroreOrario() {
    const alert = await this.alertController.create({
      header: 'Orario non valido',
      subHeader: 'Controlla le fasce orarie',
      message:
        "L'orario di inizio non può essere successivo o uguale all'orario di fine. Correggi le giornate configurate errate prima di procedere.",
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async mostraPopupErroreDispensa() {
    const alert = await this.alertController.create({
      header: 'Campi incompleti',
      subHeader: 'Impossibile pubblicare',
      message:
        'Per caricare una nuova dispensa devi compilare obbligatoriamente il Titolo, impostare un Prezzo e inserire il File Completo (PDF o ZIP).',
      buttons: [
        { text: 'Ho capito', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async mostraPopupErroreDataPassata() {
    const alert = await this.alertController.create({
      header: 'Data non valida',
      message: 'Non puoi aggiungere disponibilita per giorni gia passati.',
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async mostraPopupErroreMaterieMancanti() {
    await this.mostraPopupErrorePersonalizzato(
      'Seleziona almeno una materia prima di inserire disponibilita.',
    );
  }

  async mostraPopupErrorePersonalizzato(message: string) {
    const alert = await this.alertController.create({
      header: 'Disponibilita non salvata',
      message,
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async mostraPopupSalvataggioDisponibilita() {
    const alert = await this.alertController.create({
      header: 'Disponibilita salvata',
      message: 'Le tue fasce orarie sono state aggiornate correttamente.',
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async salvaSezione(sezione: string) {
    if (sezione === 'biografia') {
      this.biografia = this.biografiaTmp
        ? this.biografiaTmp.substring(0, 200)
        : '';
      await this.tutorService.updateTutorMe({ bio: this.biografia });
      this.isEditingBiografia = false;
    } else if (sezione === 'lingue') {
      this.lingueSelezionate = [...this.lingueSelezionateTmp];
      await this.tutorService.updateTutorMe({ lingue: this.lingueSelezionate });
      this.isEditingLingue = false;
    } else if (sezione === 'materie') {
      this.materieSelezionate = [...this.materieSelezionateTmp];
      await this.tutorService.updateTutorMe({
        materie: this.materieSelezionate,
      });
      if (this.materieSelezionate.length === 0) {
        this.databaseDisponibilita = {};
        this.databaseDisponibilitaTmp = {};
      }
      this.isEditingMaterie = false;
    } else if (sezione === 'disponibilita') {
      if (this.materieSelezionate.length === 0) {
        await this.mostraPopupErroreMaterieMancanti();
        return;
      }

      for (const dataKey in this.databaseDisponibilitaTmp) {
        const blocco = this.databaseDisponibilitaTmp[dataKey];
        if (blocco.attivo) {
          if (dataKey < this.dataLocale(new Date())) {
            await this.mostraPopupErroreDataPassata();
            return;
          }
          if (blocco.dalle >= blocco.alle) {
            await this.mostraPopupErroreOrario();
            return;
          }
        }
      }

      this.prezzoOrario = this.prezzoOrarioTmp;
      this.databaseDisponibilita = {};

      for (const key in this.databaseDisponibilitaTmp) {
        this.databaseDisponibilita[key] = {
          ...this.databaseDisponibilitaTmp[key],
        };
      }

      const disponibilita = Object.entries(this.databaseDisponibilita).map(
        ([data, info]) => ({
          data,
          attivo: info.attivo,
          dalle: info.dalle,
          alle: info.alle,
        }),
      );
      try {
        await this.tutorService.updateDisponibilitaMe(
          disponibilita,
          this.prezzoOrario,
        );
      } catch (error: any) {
        const message = error?.error?.message || 'Disponibilita non salvata.';
        await this.mostraPopupErrorePersonalizzato(message);
        return;
      }

      this.isEditingDisponibilita = false;
      this.costruisciCalendarioMensile();
      await this.mostraPopupSalvataggioDisponibilita();
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
      reader.onload = async () => {
        this.avatarUrl = reader.result as string;
        await this.tutorService.updateTutorMe({
          immagine_profilo: this.avatarUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onCopertinaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        (this.nuovaDispensa.urlCopertina = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onAnteprimaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          this.nuovaDispensa.urlAnteprimaRaw = dataUrl;
          this.nuovaDispensa.urlAnteprima =
            this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
          this.nuovaDispensa.anteprimaPdf = true;
          this.nuovaDispensa.haAnteprima = true;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.nuovaDispensa.urlAnteprimaRaw = reader.result as string;
          this.nuovaDispensa.urlAnteprima = this.nuovaDispensa.urlAnteprimaRaw;
          this.nuovaDispensa.anteprimaPdf = false;
          this.nuovaDispensa.haAnteprima = true;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onFileCompletoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.nuovaDispensa.fileCompleto = file;
        this.nuovaDispensa.urlFile = reader.result as string;
        this.nuovaDispensa.haFileCompleto = true;
      };
      reader.readAsDataURL(file);
    }
  }

  async aggiungiDispensa(
    copertinaEl: HTMLInputElement,
    anteprimaEl: HTMLInputElement,
    fileCompletoEl: HTMLInputElement,
  ) {
    if (
      !this.nuovaDispensa.titolo ||
      this.nuovaDispensa.prezzo === null ||
      !this.nuovaDispensa.haFileCompleto
    ) {
      await this.mostraPopupErroreDispensa();
      return;
    }

    const dispensaDaSalvare: Dispensa = {
      titolo: this.nuovaDispensa.titolo,
      descrizione: this.nuovaDispensa.descrizione,
      prezzo: this.nuovaDispensa.prezzo,
      urlCopertina: this.nuovaDispensa.urlCopertina,
      urlAnteprima: this.nuovaDispensa.urlAnteprima,
      urlAnteprimaRaw: this.nuovaDispensa.urlAnteprimaRaw,
      anteprimaPdf: this.nuovaDispensa.anteprimaPdf,
      fileCompleto: this.nuovaDispensa.fileCompleto,
      urlFile: this.nuovaDispensa.urlFile,
      haAnteprima: this.nuovaDispensa.haAnteprima,
      haFileCompleto: this.nuovaDispensa.haFileCompleto,
    };

    try {
      const materialeCreato = await this.tutorService.createMaterial({
        titolo: dispensaDaSalvare.titolo,
        descrizione: dispensaDaSalvare.descrizione,
        materia: this.materieSelezionate[0],
        urlFile: dispensaDaSalvare.urlFile || '',
        urlAnteprima: dispensaDaSalvare.urlAnteprimaRaw || '',
        urlCopertina: dispensaDaSalvare.urlCopertina || '',
        importo: dispensaDaSalvare.prezzo || 0,
      });

      dispensaDaSalvare.urlFile =
        materialeCreato.file_url || dispensaDaSalvare.urlFile;
      dispensaDaSalvare.id = materialeCreato.id;
    } catch (error: any) {
      const message =
        error?.status === 413
          ? 'Il file e troppo grande per essere caricato.'
          : error?.error?.message ||
            'Non e stato possibile salvare la dispensa.';
      await this.mostraPopupErrorePersonalizzato(message);
      return;
    }

    this.listaDispense.push(dispensaDaSalvare);

    if (copertinaEl) copertinaEl.value = '';
    if (anteprimaEl) anteprimaEl.value = '';
    if (fileCompletoEl) fileCompletoEl.value = '';

    this.nuovaDispensa = {
      titolo: '',
      descrizione: '',
      prezzo: null,
      urlCopertina: '',
      urlAnteprima: '',
      urlAnteprimaRaw: '',
      fileCompleto: null,
      urlFile: '',
      haAnteprima: false,
      haFileCompleto: false,
      anteprimaPdf: false,
    };
  }

  async eliminaDispensa(dispensa: Dispensa) {
    const alert = await this.alertController.create({
      header: 'Elimina dispensa',
      message:
        'La dispensa non sara piu visibile nella ricerca. Gli studenti che l hanno gia acquistata continueranno ad averla nel profilo.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: async () => {
            try {
              if (dispensa.id) {
                await this.tutorService.deleteMaterial(dispensa.id);
              }
              this.listaDispense = this.listaDispense.filter(
                (item) => item !== dispensa,
              );
            } catch (error: any) {
              const message =
                error?.error?.message ||
                'Non e stato possibile eliminare la dispensa.';
              await this.mostraPopupErrorePersonalizzato(message);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  scaricaFileCompleto(dispensa: Dispensa) {
    if (!dispensa.urlFile && !dispensa.fileCompleto) {
      alert('Nessun file scaricabile trovato.');
      return;
    }

    const url = dispensa.urlFile?.startsWith('data:')
      ? dispensa.urlFile
      : URL.createObjectURL(dispensa.fileCompleto as File);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      dispensa.fileCompleto?.name ||
      `${dispensa.titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (!dispensa.urlFile?.startsWith('data:')) {
      URL.revokeObjectURL(url);
    }
  }

  apriAnteprimaStudente(dispensa: Dispensa) {
    this.dispensaInEvidenza = dispensa;
    this.isViewingAnteprima = true;
  }
  chiudiAnteprimaStudente() {
    this.isViewingAnteprima = false;
    this.dispensaInEvidenza = null;
  }

  private isPdfDataUrl(url?: string): boolean {
    return !!url && url.startsWith('data:application/pdf');
  }

  private preparaAnteprima(url?: string) {
    if (!url) return '';
    if (this.isPdfDataUrl(url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return url;
  }

  private dataLocale(data: Date): string {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  }
}
