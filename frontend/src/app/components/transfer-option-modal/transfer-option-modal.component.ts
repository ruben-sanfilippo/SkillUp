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
  imports: [FormsModule, IonicModule],
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
  private chiusuraRichiesta = false;

  constructor() {
    addIcons({ cashOutline, closeOutline });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['aperta']?.currentValue) {
      this.chiusuraRichiesta = false;
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
      this.ibanValido(iban)
    );
  }

  formattaIban() {
    const iban = this.form.iban.replace(/\s+/g, '').toUpperCase().slice(0, 34);
    this.form.iban = iban.replace(/(.{4})/g, '$1 ').trim();
  }

  richiediChiusura() {
    this.chiusuraRichiesta = true;
    this.chiudi.emit();
  }

  gestisciChiusura() {
    if (!this.chiusuraRichiesta) {
      this.chiudi.emit();
    }
    this.chiusuraRichiesta = false;
  }

  inviaSalvataggio() {
    if (!this.valida) return;
    this.salva.emit({
      titolare_conto: this.form.titolare_conto.trim().toUpperCase(),
      iban: this.form.iban.replace(/\s+/g, '').toUpperCase(),
    });
  }

  private ibanValido(iban: string): boolean {
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

    const riordinato = `${iban.slice(4)}${iban.slice(0, 4)}`;
    let resto = 0;

    for (const carattere of riordinato) {
      const valore = /\d/.test(carattere)
        ? carattere
        : String(carattere.charCodeAt(0) - 55);

      for (const cifra of valore) {
        resto = (resto * 10 + Number(cifra)) % 97;
      }
    }

    return resto === 1;
  }
}
