import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { AvatarComponent } from '../avatar/avatar.component';
import type { PrenotazioneProfilo } from 'src/app/interfaces/profile.interfaces';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AvatarComponent],
})
export class ReviewModalComponent implements OnChanges {
  @Input() aperta = false;
  @Input() prenotazione: PrenotazioneProfilo | null = null;

  @Output() chiudi = new EventEmitter<void>();
  @Output() invia = new EventEmitter<number>();

  currentRating = 0;
  stelle = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['aperta']?.currentValue || changes['prenotazione']) {
      this.currentRating = 0;
    }
  }

  setRating(rating: number) {
    this.currentRating = rating;
  }

  inviaRecensione() {
    if (this.currentRating === 0) return;
    this.invia.emit(this.currentRating);
  }
}
