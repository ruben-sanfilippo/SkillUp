import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';

import { IonIcon } from '@ionic/angular/standalone';
import { AvatarComponent } from '../avatar/avatar.component';
import type { TutorApi } from 'src/app/interfaces/tutor.interfaces';

@Component({
  selector: 'app-tutor-card',
  templateUrl: './tutor-card.component.html',
  styleUrls: ['./tutor-card.component.scss'],
  standalone: true,
  imports: [IonIcon, AvatarComponent],
})
export class TutorCardComponent {
  @Input({ required: true }) tutor!: TutorApi;
  private router = inject(Router);

  constructor() {
    addIcons({ star });
  }

  vediProfilo() {
    this.router.navigate(['/tutor-detail', this.tutor.id]);
  }

  formatEuro(valore: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valore);
  }
}
