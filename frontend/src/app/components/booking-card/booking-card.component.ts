import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { AvatarComponent } from '../avatar/avatar.component';
import type { PrenotazioneProfilo } from 'src/app/interfaces/profile.interfaces';

@Component({
  selector: 'app-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AvatarComponent],
})
export class BookingCardComponent {
  @Input({ required: true }) prenotazione!: PrenotazioneProfilo;
  @Input() variant: 'card' | 'modal' = 'card';

  @Output() recensisci = new EventEmitter<PrenotazioneProfilo>();

  constructor() {
    addIcons({ calendarOutline, checkmarkCircleOutline });
  }

  get completataNonRecensita(): boolean {
    return this.prenotazione.stato === 'COMPLETATA' && !this.prenotazione.recensita;
  }

  get completataRecensita(): boolean {
    return this.prenotazione.stato === 'COMPLETATA' && this.prenotazione.recensita;
  }
}
