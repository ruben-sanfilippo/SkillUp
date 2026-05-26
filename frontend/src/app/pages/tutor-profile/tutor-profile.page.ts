import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
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
} from 'ionicons/icons';

interface Dispensa {
  titolo: string;
  descrizione: string;
  prezzo: number | null;
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

  // Variabili di stato "Editing" separate
  isEditingBiografia = false;
  isEditingLingue = false;
  isEditingMaterie = false;
  isEditingDisponibilita = false;

  // Buffer Temporanei
  biografiaTmp = '';
  prezzoOrarioTmp = 0;
  materieSelezionateTmp: string[] = [];
  lingueSelezionateTmp: string[] = [];

  // Pool per autocompletamento
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

  nuovaDispensa: Dispensa = { titolo: '', descrizione: '', prezzo: null };
  listaDispense: Dispensa[] = [];

  constructor() {
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
      this.biografia = this.biografiaTmp;
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
    } else if (sezione === 'lingue') {
      this.isEditingLingue = false;
    } else if (sezione === 'materie') {
      this.isEditingMaterie = false;
    } else if (sezione === 'disponibilita') {
      this.prezzoOrarioTmp = this.prezzoOrario;
      this.isEditingDisponibilita = false;
    }
  }

  aggiungiDispensa() {
    if (!this.nuovaDispensa.titolo || this.nuovaDispensa.prezzo === null)
      return;
    this.listaDispense.push({ ...this.nuovaDispensa });
    this.nuovaDispensa = { titolo: '', descrizione: '', prezzo: null };
  }

  selezionaCopertina() {}
  selezionaFile() {}
  selezionaAvatar() {}
}
