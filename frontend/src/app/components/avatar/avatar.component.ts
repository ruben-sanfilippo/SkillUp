import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
  @Input() immagine = '';
  @Input() nome = '';
  @Input() cognome = '';
  @Input() nomeCompleto = '';
  @Input() alt = 'Avatar';

  get iniziali(): string {
    const testo =
      this.nomeCompleto.trim() ||
      `${this.nome || ''} ${this.cognome || ''}`.trim() ||
      'Utente';

    return testo
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join('')
      .toUpperCase();
  }
}
