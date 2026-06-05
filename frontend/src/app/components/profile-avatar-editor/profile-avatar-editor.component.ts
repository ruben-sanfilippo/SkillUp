import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline, trashOutline } from 'ionicons/icons';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-profile-avatar-editor',
  templateUrl: './profile-avatar-editor.component.html',
  styleUrls: ['./profile-avatar-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AvatarComponent],
})
export class ProfileAvatarEditorComponent {
  @Input() immagine = '';
  @Input() nome = '';
  @Input() cognome = '';
  @Input() alt = 'Immagine profilo';
  @Input() sovrapposto = false;

  @Output() fileSelezionato = new EventEmitter<File>();
  @Output() rimuovi = new EventEmitter<void>();

  @ViewChild('avatarInput')
  avatarInput!: ElementRef<HTMLInputElement>;

  isActionSheetOpen = false;

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
        handler: () => this.rimuovi.emit(),
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
    if (!file) return;

    this.fileSelezionato.emit(file);
    input.value = '';
  }
}
