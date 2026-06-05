import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cashOutline, closeOutline } from 'ionicons/icons';
import type {
  OpzioneTrasferimentoPayload,
  OpzioneTrasferimentoTutor,
} from 'src/app/interfaces/tutor.interfaces';

@Component({
  selector: 'app-transfer-option-modal',
  templateUrl: './transfer-option-modal.component.html',
  styleUrls: ['./transfer-option-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class TransferOptionModalComponent implements OnChanges {
  @Input() aperta = false;
  @Input() opzioneTrasferimento: OpzioneTrasferimentoTutor = { presente: false };

  @Output() chiudi = new EventEmitter<void>();
  @Output() salva = new EventEmitter<OpzioneTrasferimentoPayload>();

  form: OpzioneTrasferimentoPayload = {
    titolare_conto: '',
    iban: '',
  };

  constructor() {
    addIcons({ cashOutline, closeOutline });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['aperta']?.currentValue) {
      this.form = {
        titolare_conto: this.opzioneTrasferimento.titolare_conto || '',
        iban: this.opzioneTrasferimento.iban || '',
      };
    }
  }

  get titolo(): string {
    return this.opzioneTrasferimento.presente
      ? 'Modifica opzioni di trasferimento'
      : 'Opzioni di trasferimento';
  }

  get valida(): boolean {
    const iban = this.form.iban.replace(/\s+/g, '');
    return (
      this.form.titolare_conto.trim().length >= 3 &&
      /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)
    );
  }

  formattaIban() {
    const iban = this.form.iban.replace(/\s+/g, '').toUpperCase().slice(0, 34);
    this.form.iban = iban.replace(/(.{4})/g, '$1 ').trim();
  }

  inviaSalvataggio() {
    if (!this.valida) return;
    this.salva.emit({ ...this.form });
  }
}
