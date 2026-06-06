import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  cashOutline,
  checkmarkCircleOutline,
  cloudUploadOutline,
  documentOutline,
  documentTextOutline,
  downloadOutline,
  eyeOutline,
  folderOpenOutline,
  imageOutline,
  trashOutline,
} from 'ionicons/icons';
import { MaterialPreviewModalComponent } from '../material-preview-modal/material-preview-modal.component';
import { MaterialService } from 'src/app/services/materialService';
import type {
  MaterialeDidatticoApi,
} from 'src/app/interfaces/material.interfaces';
import type { Dispensa } from 'src/app/interfaces/profile.interfaces';
import type {
  OpzioneTrasferimentoTutor,
} from 'src/app/interfaces/tutor.interfaces';

@Component({
  selector: 'app-tutor-material',
  templateUrl: './tutor-material.component.html',
  styleUrls: ['./tutor-material.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialPreviewModalComponent,
  ],
})
export class TutorMaterialComponent implements OnChanges {
  @Input() materiali: MaterialeDidatticoApi[] = [];
  @Input() materie: string[] = [];
  @Input() opzioneTrasferimento: OpzioneTrasferimentoTutor = {
    presente: false,
  };

  @Output() inserisciOpzioniTrasferimento = new EventEmitter<void>();

  nuovaDispensa: Dispensa = this.creaDispensaVuota();
  listaDispense: Dispensa[] = [];
  dispensaInEvidenza: Dispensa | null = null;
  isViewingAnteprima = false;

  constructor(
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private materialService: MaterialService,
  ) {
    addIcons({
      addCircleOutline,
      cashOutline,
      checkmarkCircleOutline,
      cloudUploadOutline,
      documentOutline,
      documentTextOutline,
      downloadOutline,
      eyeOutline,
      folderOpenOutline,
      imageOutline,
      trashOutline,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['materiali']) {
      this.listaDispense = (this.materiali || []).map((materiale) =>
        this.mappaMateriale(materiale),
      );
    }
  }

  onCopertinaSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.nuovaDispensa.fileCopertina = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.nuovaDispensa.urlCopertina = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onAnteprimaSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.nuovaDispensa.fileAnteprima = file;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.nuovaDispensa.urlAnteprimaRaw = dataUrl;
      this.nuovaDispensa.anteprimaPdf = file.type === 'application/pdf';
      this.nuovaDispensa.urlAnteprima = this.nuovaDispensa.anteprimaPdf
        ? this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl)
        : dataUrl;
      this.nuovaDispensa.haAnteprima = true;
    };
    reader.readAsDataURL(file);
  }

  onFileCompletoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.nuovaDispensa.fileCompleto = file;
    this.nuovaDispensa.urlFile = file.name;
    this.nuovaDispensa.haFileCompleto = true;
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

    if (
      Number(this.nuovaDispensa.prezzo || 0) > 0 &&
      !this.opzioneTrasferimento.presente
    ) {
      await this.mostraPopupOpzioniTrasferimentoRichieste();
      return;
    }

    const dispensaDaSalvare: Dispensa = { ...this.nuovaDispensa };

    try {
      const materialeCreato = await this.materialService.createMaterial({
        titolo: dispensaDaSalvare.titolo,
        descrizione: dispensaDaSalvare.descrizione,
        materia: this.materie[0],
        file: dispensaDaSalvare.fileCompleto as File,
        anteprima: dispensaDaSalvare.fileAnteprima || null,
        copertina: dispensaDaSalvare.fileCopertina || null,
        importo: dispensaDaSalvare.prezzo || 0,
      });

      dispensaDaSalvare.id = materialeCreato.id;
      dispensaDaSalvare.urlFile =
        materialeCreato.file_url || dispensaDaSalvare.urlFile;
      this.listaDispense.push(dispensaDaSalvare);
    } catch (error: any) {
      const message =
        error?.status === 413
          ? 'Il file è troppo grande per essere caricato.'
          : error?.error?.message ||
            'Non è stato possibile salvare la dispensa.';
      await this.mostraPopupErrore(message);
      return;
    }

    copertinaEl.value = '';
    anteprimaEl.value = '';
    fileCompletoEl.value = '';
    this.nuovaDispensa = this.creaDispensaVuota();
  }

  async eliminaDispensa(dispensa: Dispensa) {
    const alert = await this.alertController.create({
      header: 'Elimina dispensa',
      message:
        'La dispensa non sarà più visibile nella ricerca. Gli studenti che l’hanno già acquistata continueranno ad averla nel profilo.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: async () => {
            try {
              if (dispensa.id) {
                await this.materialService.deleteMaterial(dispensa.id);
              }
              this.listaDispense = this.listaDispense.filter(
                (item) => item !== dispensa,
              );
            } catch (error: any) {
              await this.mostraPopupErrore(
                error?.error?.message ||
                  'Non è stato possibile eliminare la dispensa.',
              );
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async scaricaFileCompleto(dispensa: Dispensa) {
    if (!dispensa.urlFile && !dispensa.fileCompleto) {
      await this.mostraPopupErrore('Nessun file scaricabile trovato.');
      return;
    }

    const blob =
      dispensa.id && !dispensa.fileCompleto
        ? await this.materialService.downloadMaterial(dispensa.id)
        : dispensa.fileCompleto ||
          (await (await fetch(dispensa.urlFile || '')).blob());
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      dispensa.fileCompleto?.name ||
      `${dispensa.titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  apriAnteprima(dispensa: Dispensa) {
    this.dispensaInEvidenza = dispensa;
    this.isViewingAnteprima = true;
  }

  chiudiAnteprima() {
    this.isViewingAnteprima = false;
    this.dispensaInEvidenza = null;
  }

  private mappaMateriale(materiale: MaterialeDidatticoApi): Dispensa {
    return {
      id: materiale.id,
      titolo: materiale.titolo,
      descrizione: materiale.descrizione || '',
      prezzo: materiale.importo,
      urlCopertina: materiale.copertina_url,
      urlAnteprimaRaw: materiale.anteprima_url,
      urlAnteprima: this.preparaAnteprima(materiale.anteprima_url),
      anteprimaPdf: this.isPdf(materiale.anteprima_url),
      urlFile: materiale.file_url,
      haAnteprima: !!materiale.anteprima_url,
      haFileCompleto: !!materiale.file_url,
      fileCompleto: null,
    };
  }

  private creaDispensaVuota(): Dispensa {
    return {
      titolo: '',
      descrizione: '',
      prezzo: null,
      urlCopertina: '',
      urlAnteprima: '',
      urlAnteprimaRaw: '',
      fileCopertina: null,
      fileAnteprima: null,
      fileCompleto: null,
      urlFile: '',
      haAnteprima: false,
      haFileCompleto: false,
      anteprimaPdf: false,
    };
  }

  private async mostraPopupErroreDispensa() {
    const alert = await this.alertController.create({
      header: 'Campi incompleti',
      subHeader: 'Impossibile pubblicare',
      message:
        'Per caricare una nuova dispensa devi compilare il titolo, impostare un prezzo e inserire il file completo.',
      buttons: [
        { text: 'Ho capito', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  private async mostraPopupOpzioniTrasferimentoRichieste() {
    const alert = await this.alertController.create({
      header: 'Opzioni di trasferimento richieste',
      message:
        'Per pubblicare materiali didattici a pagamento devi prima inserire titolare del conto e IBAN.',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Inserisci ora',
          cssClass: 'alert-button-primary',
          handler: () => this.inserisciOpzioniTrasferimento.emit(),
        },
      ],
    });
    await alert.present();
  }

  private async mostraPopupErrore(message: string) {
    const alert = await this.alertController.create({
      header: 'Operazione non riuscita',
      message,
      buttons: [
        { text: 'OK', role: 'cancel', cssClass: 'alert-button-primary' },
      ],
    });
    await alert.present();
  }

  private isPdf(url?: string): boolean {
    return (
      !!url &&
      (url.startsWith('data:application/pdf') ||
        url.toLowerCase().includes('.pdf'))
    );
  }

  private preparaAnteprima(url?: string) {
    if (!url) return '';
    return this.isPdf(url)
      ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
      : url;
  }
}
