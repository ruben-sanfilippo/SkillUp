import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline,
  star,
  briefcaseOutline,
  globeOutline,
  locationOutline,
  calendarOutline,
  saveOutline,
  libraryOutline,
  closeCircle,
  checkmarkDoneOutline,
  searchOutline,
  createOutline,
  cashOutline,
  closeOutline,
  timeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  informationCircleOutline,
  logOutOutline,
  keyOutline,
} from 'ionicons/icons';
import { TutorService } from 'src/app/services/tutorService';
import { UserService } from 'src/app/services/userService';
import { TransferOptionModalComponent } from 'src/app/components/transfer-option-modal/transfer-option-modal.component';
import { ProfileAvatarEditorComponent } from 'src/app/components/profile-avatar-editor/profile-avatar-editor.component';
import { TutorMaterialComponent } from 'src/app/components/tutor-material/tutor-material.component';
import type { MaterialeDidatticoApi } from 'src/app/interfaces/material.interfaces';
import type { SelezioneAvatar } from 'src/app/interfaces/profile.interfaces';
import type {
  GiornoCalendario,
  InfoDisponibilita,
  OpzioneTrasferimentoPayload,
  OpzioneTrasferimentoTutor,
} from 'src/app/interfaces/tutor.interfaces';

@Component({
  selector: 'app-tutor-profile',
  templateUrl: './tutor-profile.page.html',
  styleUrls: ['./tutor-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransferOptionModalComponent,
    ProfileAvatarEditorComponent,
    TutorMaterialComponent,
  ],
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
  isTransferModalOpen = false;

  biografiaTmp = '';
  prezzoOrarioTmp = 0;
  materieSelezionateTmp: string[] = [];
  lingueSelezionateTmp: string[] = [];
  opzioneTrasferimento: OpzioneTrasferimentoTutor = { presente: false };
  materialiTutor: MaterialeDidatticoApi[] = [];

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

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private tutorService: TutorService,
    private userService: UserService,
    private router: Router,
  ) {
    addIcons({
      personOutline,
      star,
      briefcaseOutline,
      globeOutline,
      locationOutline,
      calendarOutline,
      saveOutline,
      libraryOutline,
      closeCircle,
      checkmarkDoneOutline,
      searchOutline,
      createOutline,
      cashOutline,
      closeOutline,
      timeOutline,
      chevronBackOutline,
      chevronForwardOutline,
      informationCircleOutline,
      logOutOutline,
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
    this.opzioneTrasferimento = tutor.opzione_trasferimento || {
      presente: false,
    };
    this.materialiTutor = tutor.materials || [];
    this.databaseDisponibilita = {};

    for (const item of tutor.availability || []) {
      if (!item.data) continue;
      this.databaseDisponibilita[item.data] = {
        attivo: true,
        dalle: item.ora_inizio || item.oraInizio || '',
        alle: item.ora_fine || item.oraFine || '',
      };
    }

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

  apriModalOpzioniTrasferimento() {
    this.isTransferModalOpen = true;
  }

  chiudiModalOpzioniTrasferimento() {
    this.isTransferModalOpen = false;
  }

  async salvaOpzioniTrasferimento(opzioneTrasferimentoForm: OpzioneTrasferimentoPayload) {
    try {
      const tutorAggiornato = await this.tutorService.updateTutorMe({
        opzione_trasferimento: {
          titolare_conto: opzioneTrasferimentoForm.titolare_conto,
          iban: opzioneTrasferimentoForm.iban,
        },
      });
      this.opzioneTrasferimento =
        tutorAggiornato.opzione_trasferimento || {
          presente: true,
          titolare_conto: opzioneTrasferimentoForm.titolare_conto
            .trim()
            .toUpperCase(),
          iban: opzioneTrasferimentoForm.iban
            .replace(/\s+/g, '')
            .toUpperCase(),
        };
      this.chiudiModalOpzioniTrasferimento();
      await this.mostraToast('Opzioni di trasferimento salvate.', 'success');
    } catch (error: any) {
      await this.mostraPopupErrorePersonalizzato(
        error?.error?.message ||
          'Non è stato possibile salvare le opzioni di trasferimento.',
      );
    }
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

  async rimuoviAvatar() {
    this.avatarUrl = '';
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

  async mostraPopupErroreMaterieMancanti() {
    await this.mostraPopupErrorePersonalizzato(
      'Seleziona almeno una materia prima di inserire disponibilità.',
    );
  }

  async mostraPopupErrorePersonalizzato(message: string) {
    const alert = await this.alertController.create({
      header: 'Disponibilità non salvata',
      message,
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async mostraPopupSalvataggioDisponibilita() {
    const alert = await this.alertController.create({
      header: 'Disponibilità salvata',
      message: 'Le tue fasce orarie sono state aggiornate correttamente.',
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  async mostraPopupOpzioniTrasferimentoRichieste(message: string) {
    const alert = await this.alertController.create({
      header: 'Opzioni di trasferimento richieste',
      message,
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Inserisci ora',
          cssClass: 'alert-button-primary',
          handler: () => this.apriModalOpzioniTrasferimento(),
        },
      ],
    });
    await alert.present();
  }

  private async mostraToast(message: string, color: 'success' | 'danger' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color,
      position: 'bottom',
    });
    await toast.present();
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

      if (
        Number(this.prezzoOrarioTmp || 0) > 0 &&
        !this.opzioneTrasferimento.presente
      ) {
        await this.mostraPopupOpzioniTrasferimentoRichieste(
          'Per salvare lezioni a pagamento devi prima inserire titolare del conto e IBAN.',
        );
        return;
      }

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
        const message = error?.error?.message || 'Disponibilità non salvata.';
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

  async onAvatarSelected(selezione: SelezioneAvatar) {
    const immaginePrecedente = this.avatarUrl;
    this.avatarUrl = selezione.anteprima;

    try {
      const utente = await this.userService.uploadAvatar(selezione.file);
      this.avatarUrl = utente.immagine_profilo || this.avatarUrl;
    } catch (error: any) {
      this.avatarUrl = immaginePrecedente;
      await this.mostraToast(
        error?.error?.message || 'Non è stato possibile caricare l’immagine.',
        'danger',
      );
    }
  }

  private dataLocale(data: Date): string {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  }
}
