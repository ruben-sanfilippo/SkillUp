import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { star } from 'ionicons/icons';

import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tutor-card',
  templateUrl: './tutor-card.component.html',
  styleUrls: ['./tutor-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class TutorCardComponent {
  @Input() tutor: any;

  constructor(private router: Router) {
    addIcons({ star });
  }

  vediProfilo() {
    this.router.navigate(['/tutor-detail', this.tutor.id]);
  }

  inizialiTutor(): string {
    const nomeCompleto =
      `${this.tutor?.nome || ''} ${this.tutor?.cognome || ''}`.trim() ||
      this.tutor?.name ||
      'Tutor';

    return nomeCompleto
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parola: string) => parola[0])
      .join('')
      .toUpperCase();
  }
}
