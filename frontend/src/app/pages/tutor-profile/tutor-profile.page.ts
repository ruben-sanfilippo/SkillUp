import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  cameraOutline,
  briefcaseOutline,
  documentTextOutline,
  globeOutline,
  locationOutline,
  calendarOutline,
  cashOutline,
  imageOutline,
  cloudUploadOutline,
  addCircleOutline,
  documentOutline,
  saveOutline,
  star,
} from 'ionicons/icons';

// Interfaccia interna per tipizzare la struttura della dispensa
interface Dispensa {
  titolo: string;
  descrizione: string;
  prezzo: number | null;
  fileCopertina: any;
  fileDispensa: any;
}

@Component({
  selector: 'app-tutor-profile',
  templateUrl: './tutor-profile.page.html',
  styleUrls: ['./tutor-profile.page.scss'],
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonIcon, IonInput],
})
export class TutorProfilePage implements OnInit {
  // Dati del Tutor (In un caso reale verrebbero popolati da una chiamata GET al backend Express)
  nome = 'Elena';
  cognome = 'Rossi';
  specializzazione = 'Senior Mathematics & Physics Tutor';
  biografia =
    'Appassionata nel rendere accessibili a chiunque i concetti fisici e matematici complessi...';
  lingue = 'Italiano (Madrelingua), Inglese (Fluente)';
  posizione = 'Milano, Italia (Disponibile Online)';
  prezzoOrario = 45;

  // Dati statistici calcolati dal backend in base alle recensioni reali lasciate dagli studenti
  mediaRecensioni = 4.9;
  totaleRecensioni = 28;

  // Array contenente le dispense caricate dal tutor
  listaDispense: Dispensa[] = [
    {
      titolo: 'Meccanica Quantistica I - Appunti Completi',
      descrizione:
        "Raccolta di dispense ed esercizi svolti passo passo per superare l'esame scritto.",
      prezzo: 15,
      fileCopertina: null,
      fileDispensa: null,
    },
  ];

  // Oggetto di appoggio per il form di caricamento della nuova dispensa
  nuovaDispensa: Dispensa = {
    titolo: '',
    descrizione: '',
    prezzo: null,
    fileCopertina: null,
    fileDispensa: null,
  };

  constructor() {
    // Registrazione icone standalone per l'interfaccia di gestione del profilo
    addIcons({
      personOutline,
      cameraOutline,
      briefcaseOutline,
      documentTextOutline,
      globeOutline,
      locationOutline,
      calendarOutline,
      cashOutline,
      imageOutline,
      cloudUploadOutline,
      addCircleOutline,
      documentOutline,
      saveOutline,
      star,
    });
  }

  ngOnInit() {}

  selezionaCopertina() {
    console.log(
      "Logica per triggerare l'input file per l'immagine di copertina",
    );
  }

  selezionaFile() {
    console.log("Logica per triggerare l'input file per il PDF della dispensa");
  }

  aggiungiDispensa() {
    if (
      !this.nuovaDispensa.titolo ||
      !this.nuovaDispensa.descrizione ||
      !this.nuovaDispensa.prezzo
    ) {
      console.log(
        'Validazione fallita: compilare tutti i dati della dispensa.',
      );
      return;
    }

    // Inserimento della dispensa nell'elenco visivo locale (usando lo spread operator)
    this.listaDispense.push({ ...this.nuovaDispensa });

    // Reset del form di inserimento
    this.nuovaDispensa = {
      titolo: '',
      descrizione: '',
      prezzo: null,
      fileCopertina: null,
      fileDispensa: null,
    };
  }

  salvaProfilo() {
    const payloadTutor = {
      specializzazione: this.specializzazione,
      biografia: this.biografia,
      lingue: this.lingue,
      posizione: this.posizione,
      prezzoOrario: this.prezzoOrario,
      dispense: this.listaDispense,
    };

    console.log(
      'Payload completo pronto per essere inviato tramite chiamata PUT/PATCH a Express:',
      payloadTutor,
    );
  }
}
