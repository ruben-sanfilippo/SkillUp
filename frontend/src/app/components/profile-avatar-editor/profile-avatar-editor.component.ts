import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline, trashOutline } from 'ionicons/icons';
import { AvatarComponent } from '../avatar/avatar.component';
import type { SelezioneAvatar } from 'src/app/interfaces/profile.interfaces';

@Component({
  selector: 'app-profile-avatar-editor',
  templateUrl: './profile-avatar-editor.component.html',
  styleUrls: ['./profile-avatar-editor.component.scss'],
  standalone: true,
  imports: [IonicModule, AvatarComponent],
})
export class ProfileAvatarEditorComponent {
  @Input() immagine = '';
  @Input() nome = '';
  @Input() cognome = '';
  @Input() alt = 'Immagine profilo';
  @Input() sovrapposto = false;

  @Output() fileSelezionato = new EventEmitter<SelezioneAvatar>();
  @Output() rimuovi = new EventEmitter<void>();

  @ViewChild('avatarInput')
  avatarInput!: ElementRef<HTMLInputElement>;

  isActionSheetOpen = false;
  messaggioErrore = '';

  private readonly dimensioneMassima = 10 * 1024 * 1024;
  private readonly tipiConsentiti = ['image/jpeg', 'image/png', 'image/webp'];

  constructor() {
    addIcons({ cameraOutline, imageOutline, trashOutline });
  }

  get actionSheetButtons() {
    return [
      {
        text: 'Carica / Modifica foto',
        icon: 'image-outline',
        handler: () => this.apriSelettoreFile(),
      },
      {
        text: 'Rimuovi foto',
        role: 'destructive',
        icon: 'trash-outline',
        handler: () => {
          this.messaggioErrore = '';
          this.rimuovi.emit();
        },
      },
      {
        text: 'Annulla',
        role: 'cancel',
        data: {
          action: 'cancel',
        },
      },
    ];
  }

  apriMenuAvatar() {
    this.isActionSheetOpen = true;
  }

  apriSelettoreFile() {
    this.avatarInput?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!this.tipiConsentiti.includes(file.type)) {
      this.messaggioErrore = 'Seleziona un’immagine JPEG, PNG o WebP.';
      return;
    }

    if (file.size > this.dimensioneMassima) {
      this.messaggioErrore = 'L’immagine non può superare 10 MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.messaggioErrore = '';
      this.fileSelezionato.emit({
        file,
        anteprima: reader.result as string,
      });
    };
    reader.onerror = () => {
      this.messaggioErrore = 'Non è stato possibile leggere l’immagine.';
    };
    reader.readAsDataURL(file);
  }
}
