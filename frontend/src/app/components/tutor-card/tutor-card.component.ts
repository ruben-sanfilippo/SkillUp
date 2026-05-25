import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor() {
    addIcons({ star });
  }
}
