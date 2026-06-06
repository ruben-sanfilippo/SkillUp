import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import type {
  MetodoPagamentoPayload,
  MetodoPagamentoStudente,
} from 'src/app/interfaces/user.interfaces';

@Component({
  selector: 'app-payment-method-modal',
  templateUrl: './payment-method-modal.component.html',
  styleUrls: ['./payment-method-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule],
})
export class PaymentMethodModalComponent implements OnChanges {
  @Input() aperta = false;
  @Input() metodoPagamento: MetodoPagamentoStudente = { presente: false };

  @Output() chiudi = new EventEmitter<void>();
  @Output() salva = new EventEmitter<MetodoPagamentoPayload>();

  form: MetodoPagamentoPayload = {
    numero_carta: '',
    scadenza: '',
    titolare: '',
    cvv: '',
  };
  private chiusuraRichiesta = false;

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['aperta']?.currentValue) {
      this.chiusuraRichiesta = false;
      this.form = {
        numero_carta: '',
        scadenza: this.metodoPagamento.scadenza || '',
        titolare: this.metodoPagamento.titolare || '',
        cvv: '',
      };
    }
  }

  get titolo(): string {
    return this.metodoPagamento.presente
      ? 'Modifica metodo di pagamento'
      : 'Aggiungi metodo di pagamento';
  }

  get valido(): boolean {
    const numeroCarta = this.form.numero_carta.replace(/\D/g, '');
    const cvv = this.form.cvv.replace(/\D/g, '');
    return (
      this.form.titolare.trim().length >= 3 &&
      numeroCarta.length >= 13 &&
      numeroCarta.length <= 19 &&
      this.scadenzaValida &&
      cvv.length >= 3 &&
      cvv.length <= 4
    );
  }

  get scadenzaValida(): boolean {
    const corrispondenza = this.form.scadenza.match(/^(\d{2})\/(\d{2})$/);
    if (!corrispondenza) return false;

    const mese = Number(corrispondenza[1]);
    const anno = Number(`20${corrispondenza[2]}`);
    if (mese < 1 || mese > 12) return false;

    return new Date(anno, mese, 0, 23, 59, 59) >= new Date();
  }

  formattaNumeroCarta() {
    const cifre = this.form.numero_carta.replace(/\D/g, '').slice(0, 19);
    this.form.numero_carta = cifre.replace(/(.{4})/g, '$1 ').trim();
  }

  formattaScadenza() {
    const cifre = this.form.scadenza.replace(/\D/g, '').slice(0, 4);
    this.form.scadenza =
      cifre.length > 2 ? `${cifre.slice(0, 2)}/${cifre.slice(2)}` : cifre;
  }

  formattaCvv() {
    this.form.cvv = this.form.cvv.replace(/\D/g, '').slice(0, 4);
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
    if (!this.valido) return;
    this.salva.emit({
      numero_carta: this.form.numero_carta.replace(/\D/g, ''),
      scadenza: this.form.scadenza,
      titolare: this.form.titolare.trim().toUpperCase(),
      cvv: this.form.cvv.replace(/\D/g, ''),
    });
  }
}
