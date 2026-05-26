import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
  biografia =
    "Ingegnere informatico con passione per l'insegnamento delle materie scientifiche.";
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

  materieDisponibili = [
    'Matematica',
    'Fisica',
    'Analisi Matematica 1',
    'Informatica',
    'Chimica',
    'Geometria',
  ];
  materieFiltrate: string[] = [];
  mostraListaMaterie = false;

  lingueDisponibili = [
    'Italiano',
    'Inglese',
    'Spagnolo',
    'Francese',
    'Tedesco',
  ];
  lingueFiltrate: string[] = [];
  mostraListaLingue = false;

  avatarUrl = '';

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

  constructor(private sanitizer: DomSanitizer) {
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
    });
  }

  ngOnInit() {
    this.biografiaTmp = this.biografia;
    this.prezzoOrarioTmp = this.prezzoOrario;
    this.materieFiltrate = [...this.materieDisponibili];
    this.lingueFiltrate = [...this.lingueDisponibili];
  }

  attivaModificaLingue() {
    this.lingueSelezionateTmp = [...this.lingueSelezionate];
    this.isEditingLingue = true;
  }
  attivaModificaMaterie() {
    this.materieSelezionateTmp = [...this.materieSelezionate];
    this.isEditingMaterie = true;
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

  salvaSezione(sezione: string) {
    if (sezione === 'biografia') {
      this.biografia = this.biografiaTmp
        ? this.biografiaTmp.substring(0, 200)
        : '';
      this.isEditingBiografia = false;
    } else if (sezione === 'lingue') {
      this.lingueSelezionate = [...this.lingueSelezionateTmp];
      this.isEditingLingue = false;
    } else if (sezione === 'materie') {
      this.materieSelezionate = [...this.materieSelezionateTmp];
      this.isEditingMaterie = false;
    } else if (sezione === 'disponibilita') {
      this.prezzoOrario = this.prezzoOrarioTmp;
      this.isEditingDisponibilita = false;
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
      reader.onload = () =>
        (this.nuovaDispensa.copertinaUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onAnteprimaSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        const blobUrl = URL.createObjectURL(file);
        this.nuovaDispensa.anteprimaUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
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

  aggiungiDispensa(
    copertinaEl: HTMLInputElement,
    anteprimaEl: HTMLInputElement,
    fileCompletoEl: HTMLInputElement,
  ) {
    if (
      !this.nuovaDispensa.titolo ||
      this.nuovaDispensa.prezzo === null ||
      !this.nuovaDispensa.haFileCompleto
    ) {
      alert(
        'Compila i campi obbligatori (Titolo, Prezzo e Carica il File Completo).',
      );
      return;
    }

    // Creazione istanza pulita da salvare slegata dallo stato del form
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

    // RESET MECCANICO DEL BROWSER (Sblocca l'evento onchange al caricamento successivo)
    if (copertinaEl) copertinaEl.value = '';
    if (anteprimaEl) anteprimaEl.value = '';
    if (fileCompletoEl) fileCompletoEl.value = '';

    // RESET COMPLETO DELLO STATO DATI DELLA NUOVA DISPENSA
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
