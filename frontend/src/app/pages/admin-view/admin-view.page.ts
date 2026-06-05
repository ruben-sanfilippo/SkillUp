import { Component, OnInit, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  peopleOutline,
  banOutline,
  funnelOutline,
  ellipsisVertical,
  trashOutline,
  mailOutline,
  eyeOutline,
  checkmarkOutline,
  logOutOutline,
} from 'ionicons/icons';
import { AdminService } from 'src/app/services/adminService';
import type { UtenteAdmin } from 'src/app/interfaces/admin.interfaces';

@Component({
  selector: 'app-filter-popover',
  template: `
    <ion-list
      lines="none"
      style="background: var(--card-background); padding: 8px;"
    >
      <ion-item
        button
        (click)="toggleFiltro('studenti')"
        style="--background: transparent; --color: var(--text-main);"
      >
        <ion-checkbox [checked]="studenti" slot="start"></ion-checkbox>
        <ion-label>Studenti</ion-label>
      </ion-item>
      <ion-item
        button
        (click)="toggleFiltro('tutor')"
        style="--background: transparent; --color: var(--text-main);"
      >
        <ion-checkbox [checked]="tutor" slot="start"></ion-checkbox>
        <ion-label>Tutor</ion-label>
      </ion-item>
    </ion-list>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class FilterPopoverComponent {
  @Input() studenti: boolean = true;
  @Input() tutor: boolean = true;
  constructor(private popoverCtrl: PopoverController) {}
  toggleFiltro(tipo: 'studenti' | 'tutor') {
    if (tipo === 'studenti') this.studenti = !this.studenti;
    else this.tutor = !this.tutor;
    if (!this.studenti && !this.tutor) {
      if (tipo === 'studenti') this.tutor = true;
      else this.studenti = true;
    }
    this.popoverCtrl.dismiss({ studenti: this.studenti, tutor: this.tutor });
  }
}

@Component({
  selector: 'app-options-popover',
  template: `
    <ion-list
      lines="none"
      style="background: var(--card-background); padding: 4px;"
    >
      <ion-item
        button
        (click)="seleziona('email')"
        style="--background: transparent; --color: var(--text-main);"
      >
        <ion-icon
          name="mail-outline"
          slot="start"
          style="font-size: 18px; margin-right: 12px;"
        ></ion-icon>
        <ion-label>Email</ion-label>
      </ion-item>
      <div
        style="height: 1px; background: var(--input-background); margin: 4px 8px;"
      ></div>
    </ion-list>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class OptionsPopoverComponent {
  constructor(private popoverCtrl: PopoverController) {}
  seleziona(action: string) {
    this.popoverCtrl.dismiss({ action });
  }
}

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.page.html',
  styleUrls: ['./admin-view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class AdminViewPage implements OnInit {
  searchQuery = signal('');
  mostraStudenti = signal(true);
  mostraTutor = signal(true);

  masterUsersList = signal<UtenteAdmin[]>([]);

  constructor(
    private popoverCtrl: PopoverController,
    private adminService: AdminService,
    private router: Router,
  ) {
    addIcons({
      searchOutline,
      peopleOutline,
      banOutline,
      funnelOutline,
      ellipsisVertical,
      trashOutline,
      mailOutline,
      eyeOutline,
      checkmarkOutline,
      logOutOutline,
    });
  }

  async ngOnInit() {
    await this.caricaUtenti();
  }

  async caricaUtenti() {
    const users = await this.adminService.getAdminUsers();
    this.masterUsersList.set(users.map((user) => this.mappaUtente(user)));
  }

  totalUsersCount = computed(() => this.masterUsersList().length);
  blockedUsersCount = computed(
    () => this.masterUsersList().filter((u) => u.stato === 'Bloccato').length,
  );

  filteredUsersList = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.mostraStudenti();
    const t = this.mostraTutor();
    return this.masterUsersList().filter((u) => {
      if (u.ruolo === 'Studente' && !s) return false;
      if (u.ruolo === 'Tutor' && !t) return false;
      if (!q) return true;
      return (
        u.nome.toLowerCase().includes(q) ||
        u.cognome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.ruolo.toLowerCase().includes(q)
      );
    });
  });

  async cambiaStatoUtente(user: UtenteAdmin, nuovoStato: 'Attivo' | 'Bloccato') {
    const stato = nuovoStato === 'Attivo' ? 'attivo' : 'bloccato';
    const users = await this.adminService.updateUserStatus(user.id, stato);
    this.masterUsersList.set(users.map((u) => this.mappaUtente(u)));
  }

  async apriFiltri(event: Event) {
    const pop = await this.popoverCtrl.create({
      component: FilterPopoverComponent,
      event,
      componentProps: {
        studenti: this.mostraStudenti(),
        tutor: this.mostraTutor(),
      },
    });
    await pop.present();
    const { data } = await pop.onWillDismiss();
    if (data) {
      this.mostraStudenti.set(data.studenti);
      this.mostraTutor.set(data.tutor);
    }
  }

  async apriMenuOpzioni(user: UtenteAdmin, event: Event) {
    event.stopPropagation();
    const pop = await this.popoverCtrl.create({
      component: OptionsPopoverComponent,
      event,
      componentProps: { user },
    });
    await pop.present();
    const { data } = await pop.onWillDismiss();
    if (data?.action === 'email')
      window.location.href = `mailto:${user.email}`;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tipologia_utente');
    localStorage.removeItem('skillup_recensioni_aggiornate');
    this.router.navigate(['/login']);
  }

  private mappaUtente(user: any): UtenteAdmin {
    const data = user.data_iscrizione
      ? new Date(user.data_iscrizione)
      : new Date();
    return {
      id: user.id,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      immagineProfilo: user.immagine_profilo || '',
      ruolo: user.tipologia_utente === 'tutor' ? 'Tutor' : 'Studente',
      dataIscrizione: data,
      dataIscrizioneFormattata: data.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      stato: user.stato === 'bloccato' ? 'Bloccato' : 'Attivo',
    };
  }
}
