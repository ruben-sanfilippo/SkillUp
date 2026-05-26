import { Component, OnInit, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  searchOutline, peopleOutline, banOutline, funnelOutline, 
  ellipsisVertical, trashOutline, mailOutline, eyeOutline, checkmarkOutline 
} from 'ionicons/icons';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: 'Studente' | 'Tutor';
  registrationDate: Date;
  formattedRegistrationDate: string;
  status: 'Attivo' | 'Bloccato';
}

@Component({
  selector: 'app-filter-popover',
  template: `
    <ion-list lines="none" style="background: var(--card-background); padding: 8px;">
      <ion-item button (click)="toggleFiltro('studenti')" style="--background: transparent; --color: var(--text-main);">
        <ion-checkbox [checked]="studenti" slot="start"></ion-checkbox>
        <ion-label>Studenti</ion-label>
      </ion-item>
      <ion-item button (click)="toggleFiltro('tutor')" style="--background: transparent; --color: var(--text-main);">
        <ion-checkbox [checked]="tutor" slot="start"></ion-checkbox>
        <ion-label>Tutor</ion-label>
      </ion-item>
    </ion-list>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FilterPopoverComponent {
  @Input() studenti: boolean = true;
  @Input() tutor: boolean = true;
  constructor(private popoverCtrl: PopoverController) {}
  toggleFiltro(tipo: 'studenti' | 'tutor') {
    if (tipo === 'studenti') this.studenti = !this.studenti;
    else this.tutor = !this.tutor;
    if (!this.studenti && !this.tutor) { if (tipo === 'studenti') this.tutor = true; else this.studenti = true; }
    this.popoverCtrl.dismiss({ studenti: this.studenti, tutor: this.tutor });
  }
}

@Component({
  selector: 'app-options-popover',
  template: `
    <ion-list lines="none" style="background: var(--card-background); padding: 4px;">
      <ion-item button (click)="seleziona('view')" style="--background: transparent; --color: var(--text-main);">
        <ion-icon name="eye-outline" slot="start" style="font-size: 18px; margin-right: 12px;"></ion-icon>
        <ion-label>Visualizza profilo</ion-label>
      </ion-item>
      <ion-item button (click)="seleziona('email')" style="--background: transparent; --color: var(--text-main);">
        <ion-icon name="mail-outline" slot="start" style="font-size: 18px; margin-right: 12px;"></ion-icon>
        <ion-label>Email</ion-label>
      </ion-item>
      <div style="height: 1px; background: var(--input-background); margin: 4px 8px;"></div>
      <ion-item button (click)="seleziona('delete')" style="--background: transparent; --color: #EF4444;">
        <ion-icon name="trash-outline" slot="start" style="font-size: 18px; margin-right: 12px;"></ion-icon>
        <ion-label>Elimina</ion-label>
      </ion-item>
    </ion-list>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class OptionsPopoverComponent {
  constructor(private popoverCtrl: PopoverController) {}
  seleziona(action: string) { this.popoverCtrl.dismiss({ action }); }
}

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.page.html',
  styleUrls: ['./admin-view.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FilterPopoverComponent, OptionsPopoverComponent]
})
export class AdminViewPage implements OnInit {

  searchQuery = signal('');
  mostraStudenti = signal(true);
  mostraTutor = signal(true);
  
  masterUsersList = signal<AdminUser[]>([
    { id: 'u1', firstName: 'Giulia', lastName: 'Bianchi', email: 'giulia.b@example.com', avatar: 'https://i.pravatar.cc/150?u=giulia', role: 'Studente', registrationDate: new Date('2023-10-12'), formattedRegistrationDate: '12 Ott 2023', status: 'Attivo' },
    { id: 'u2', firstName: 'Marco', lastName: 'Rossi', email: 'm.rossi.tutor@example.com', avatar: 'https://i.pravatar.cc/150?u=marco', role: 'Tutor', registrationDate: new Date('2023-09-05'), formattedRegistrationDate: '05 Set 2023', status: 'Attivo' },
    { id: 'u3', firstName: 'Alessandro', lastName: 'Neri', email: 'alex.n99@example.com', avatar: 'https://i.pravatar.cc/150?u=alessandro', role: 'Studente', registrationDate: new Date('2023-08-22'), formattedRegistrationDate: '22 Ago 2023', status: 'Bloccato' },
    { id: 'u4', firstName: 'Sara', lastName: 'Ferrari', email: 'sara.ferrari@example.com', avatar: '', role: 'Tutor', registrationDate: new Date('2023-11-01'), formattedRegistrationDate: '01 Nov 2023', status: 'Attivo' },
    { id: 'u5', firstName: 'Luca', lastName: 'Verdi', email: 'l.verdi@example.com', avatar: 'https://i.pravatar.cc/150?u=luca', role: 'Studente', registrationDate: new Date('2024-01-14'), formattedRegistrationDate: '14 Gen 2024', status: 'Attivo' },
    { id: 'u6', firstName: 'Elena', lastName: 'Rizzo', email: 'elena.rizzo@example.com', avatar: 'https://i.pravatar.cc/150?u=elena', role: 'Tutor', registrationDate: new Date('2024-02-29'), formattedRegistrationDate: '29 Feb 2024', status: 'Attivo' },
    { id: 'u7', firstName: 'Davide', lastName: 'Gallo', email: 'd.gallo@example.com', avatar: 'https://i.pravatar.cc/150?u=davide', role: 'Studente', registrationDate: new Date('2026-03-10'), formattedRegistrationDate: '10 Mar 2026', status: 'Attivo' },
    { id: 'u8', firstName: 'Sofia', lastName: 'Conti', email: 's.conti@example.com', avatar: 'https://i.pravatar.cc/150?u=sofia', role: 'Tutor', registrationDate: new Date('2026-03-11'), formattedRegistrationDate: '11 Mar 2026', status: 'Attivo' },
    { id: 'u9', firstName: 'Federico', lastName: 'Marini', email: 'f.marini@example.com', avatar: '', role: 'Studente', registrationDate: new Date('2026-03-12'), formattedRegistrationDate: '12 Mar 2026', status: 'Bloccato' },
    { id: 'u10', firstName: 'Chiara', lastName: 'Bruno', email: 'c.bruno@example.com', avatar: 'https://i.pravatar.cc/150?u=chiara', role: 'Tutor', registrationDate: new Date('2026-03-14'), formattedRegistrationDate: '14 Mar 2026', status: 'Attivo' },
    { id: 'u11', firstName: 'Giacomo', lastName: 'Ricci', email: 'g.ricci@example.com', avatar: 'https://i.pravatar.cc/150?u=giacomo', role: 'Studente', registrationDate: new Date('2026-03-15'), formattedRegistrationDate: '15 Mar 2026', status: 'Attivo' },
    { id: 'u12', firstName: 'Aurora', lastName: 'Barone', email: 'a.barone@example.com', avatar: 'https://i.pravatar.cc/150?u=aurora', role: 'Tutor', registrationDate: new Date('2026-03-17'), formattedRegistrationDate: '17 Mar 2026', status: 'Attivo' },
    { id: 'u13', firstName: 'Mattia', lastName: 'Moretti', email: 'm.moretti@example.com', avatar: '', role: 'Studente', registrationDate: new Date('2026-03-18'), formattedRegistrationDate: '18 Mar 2026', status: 'Attivo' },
    { id: 'u14', firstName: 'Beatrice', lastName: 'Della', email: 'b.della@example.com', avatar: 'https://i.pravatar.cc/150?u=beatrice', role: 'Tutor', registrationDate: new Date('2026-03-20'), formattedRegistrationDate: '20 Mar 2026', status: 'Bloccato' },
    { id: 'u15', firstName: 'Leonardo', lastName: 'Longo', email: 'l.longo@example.com', avatar: 'https://i.pravatar.cc/150?u=leonardo', role: 'Studente', registrationDate: new Date('2026-03-22'), formattedRegistrationDate: '22 Mar 2026', status: 'Attivo' },
    { id: 'u16', firstName: 'Alice', lastName: 'Gatti', email: 'a.gatti@example.com', avatar: 'https://i.pravatar.cc/150?u=alice', role: 'Tutor', registrationDate: new Date('2026-03-23'), formattedRegistrationDate: '23 Mar 2026', status: 'Attivo' },
    { id: 'u17', firstName: 'Filippo', lastName: 'De Luca', email: 'f.deluca@example.com', avatar: '', role: 'Studente', registrationDate: new Date('2026-03-25'), formattedRegistrationDate: '25 Mar 2026', status: 'Attivo' },
    { id: 'u18', firstName: 'Ludovica', lastName: 'Costa', email: 'l.costa@example.com', avatar: 'https://i.pravatar.cc/150?u=ludovica', role: 'Tutor', registrationDate: new Date('2026-03-26'), formattedRegistrationDate: '26 Mar 2026', status: 'Attivo' },
    { id: 'u19', firstName: 'Lorenzo', lastName: 'Amato', email: 'l.amato@example.com', avatar: 'https://i.pravatar.cc/150?u=lorenzo', role: 'Studente', registrationDate: new Date('2026-03-28'), formattedRegistrationDate: '28 Mar 2026', status: 'Bloccato' },
    { id: 'u20', firstName: 'Emma', lastName: 'Silvestri', email: 'e.silvestri@example.com', avatar: 'https://i.pravatar.cc/150?u=emma', role: 'Tutor', registrationDate: new Date('2026-03-29'), formattedRegistrationDate: '29 Mar 2026', status: 'Attivo' },
    { id: 'u21', firstName: 'Tommaso', lastName: 'Russo', email: 't.russo@example.com', avatar: '', role: 'Studente', registrationDate: new Date('2026-04-01'), formattedRegistrationDate: '01 Apr 2026', status: 'Attivo' },
    { id: 'u22', firstName: 'Camilla', lastName: 'Testa', email: 'c.testa@example.com', avatar: 'https://i.pravatar.cc/150?u=camilla', role: 'Tutor', registrationDate: new Date('2026-04-03'), formattedRegistrationDate: '03 Apr 2026', status: 'Attivo' },
    { id: 'u23', firstName: 'Gabriele', lastName: 'Parisi', email: 'g.parisi@example.com', avatar: 'https://i.pravatar.cc/150?u=gabriele', role: 'Studente', registrationDate: new Date('2026-04-05'), formattedRegistrationDate: '05 Apr 2026', status: 'Attivo' },
    { id: 'u24', firstName: 'Martina', lastName: 'Serra', email: 'm.serra@example.com', avatar: 'https://i.pravatar.cc/150?u=martina', role: 'Tutor', registrationDate: new Date('2026-04-06'), formattedRegistrationDate: '06 Apr 2026', status: 'Attivo' },
    { id: 'u25', firstName: 'Christian', lastName: 'Fontana', email: 'c.fontana@example.com', avatar: '', role: 'Studente', registrationDate: new Date('2026-04-08'), formattedRegistrationDate: '08 Apr 2026', status: 'Bloccato' },
    { id: 'u26', firstName: 'Giorgia', lastName: 'Caruso', email: 'g.caruso@example.com', avatar: 'https://i.pravatar.cc/150?u=giorgia', role: 'Tutor', registrationDate: new Date('2026-04-10'), formattedRegistrationDate: '10 Apr 2026', status: 'Attivo' }
  ]);

  constructor(private popoverCtrl: PopoverController) {
    addIcons({ searchOutline, peopleOutline, banOutline, funnelOutline, ellipsisVertical, trashOutline, mailOutline, eyeOutline, checkmarkOutline });
  }

  ngOnInit() {}

  totalUsersCount = computed(() => this.masterUsersList().length);
  blockedUsersCount = computed(() => this.masterUsersList().filter(u => u.status === 'Bloccato').length);

  filteredUsersList = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.mostraStudenti();
    const t = this.mostraTutor();
    return this.masterUsersList().filter(u => {
      if (u.role === 'Studente' && !s) return false;
      if (u.role === 'Tutor' && !t) return false;
      if (!q) return true;
      return u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    });
  });

  cambiaStatoUtente(user: AdminUser, nuovoStato: 'Attivo' | 'Bloccato') {
    this.masterUsersList.update(users => users.map(u => u.id === user.id ? { ...u, status: nuovoStato } : u));
  }

  eliminaUtente(userId: string) {
    this.masterUsersList.update(users => users.filter(u => u.id !== userId));
  }

  async apriFiltri(event: Event) {
    const pop = await this.popoverCtrl.create({ component: FilterPopoverComponent, event, componentProps: { studenti: this.mostraStudenti(), tutor: this.mostraTutor() } });
    await pop.present();
    const { data } = await pop.onWillDismiss();
    if (data) { this.mostraStudenti.set(data.studenti); this.mostraTutor.set(data.tutor); }
  }

  async apriMenuOpzioni(user: AdminUser, event: Event) {
    event.stopPropagation();
    const pop = await this.popoverCtrl.create({ component: OptionsPopoverComponent, event, componentProps: { user } });
    await pop.present();
    const { data } = await pop.onWillDismiss();
    if (data?.action === 'delete') this.eliminaUtente(user.id);
    else if (data?.action === 'email') window.location.href = `mailto:${user.email}`;
  }
}