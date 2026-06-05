import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cartOutline, closeOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-material-preview-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './material-preview-modal.component.html',
  styleUrls: ['./material-preview-modal.component.scss'],
})
export class MaterialPreviewModalComponent {
  @Input() aperta = false;
  @Input() titolo = '';
  @Input() descrizione = '';
  @Input() urlAnteprima: string | SafeResourceUrl | null | undefined = '';
  @Input() anteprimaPdf = false;
  @Input() mostraAcquisto = false;
  @Input() acquistato = false;
  @Input() prezzo: number | string | null | undefined = 0;

  @Output() chiudi = new EventEmitter<void>();
  @Output() acquista = new EventEmitter<void>();

  constructor() {
    addIcons({ cartOutline, closeOutline, eyeOutline });
  }

  get prezzoFormattato(): string {
    const valore = Number(this.prezzo || 0);
    return valore.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
