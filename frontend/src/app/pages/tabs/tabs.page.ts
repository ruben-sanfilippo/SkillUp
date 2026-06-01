import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  IonLabel,
  IonIcon,
  IonTabButton,
  IonTabs,
  IonTabBar,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  searchOutline,
  personOutline,
  chatbubblesOutline,
  statsChartOutline,
  schoolOutline,
} from 'ionicons/icons'; // Aggiunta l'icona per i messaggi
import { MessageService } from '../../services/messageService';
import { UserService } from '../../services/userService';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonLabel,
    IonTabButton,
    IonTabs,
    IonTabBar,
    CommonModule,
    FormsModule,
  ],
})
export class TabsPage implements OnInit, OnDestroy {
  // 1. Definiamo la variabile con un valore di default
  tipologiaUtente = 'studente';
  hasUnreadMessages = localStorage.getItem('skillup_messaggi_non_letti') === '1';
  private currentUserId = 0;
  private socket?: Socket;
  private readonly onUnreadMessagesChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ hasUnread: boolean }>;
    this.hasUnreadMessages = !!customEvent.detail?.hasUnread;
  };

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({
      searchOutline,
      chatbubblesOutline,
      personOutline,
      statsChartOutline,
      schoolOutline,
    });
  }

  ngOnInit() {
    window.addEventListener(
      'skillup-messaggi-non-letti',
      this.onUnreadMessagesChange,
    );
    this.aggiornaTipologiaUtente();
  }

  ionViewWillEnter() {
    this.aggiornaTipologiaUtente();
  }

  ngOnDestroy() {
    window.removeEventListener(
      'skillup-messaggi-non-letti',
      this.onUnreadMessagesChange,
    );
    this.socket?.disconnect();
  }

  private async aggiornaTipologiaUtente() {
    const ruoloSalvato = localStorage.getItem('tipologia_utente') || 'studente';
    this.tipologiaUtente = ruoloSalvato.toLowerCase();

    try {
      const utente = await this.userService.getMe();
      const ruoloBackend = utente?.tipologia_utente?.toLowerCase();

      if (ruoloBackend) {
        this.tipologiaUtente = ruoloBackend;
        localStorage.setItem('tipologia_utente', ruoloBackend);
      }
      this.currentUserId = utente.id;
      await this.aggiornaMessaggiNonLetti();
      this.apriSocketMessaggi();
    } catch {
      this.tipologiaUtente = 'studente';
    }
  }

  private async aggiornaMessaggiNonLetti() {
    const conversazioni = await this.messageService.getConversations();
    this.hasUnreadMessages = conversazioni.some(
      (chat) => Number(chat.unreadCount || 0) > 0,
    );
    localStorage.setItem(
      'skillup_messaggi_non_letti',
      this.hasUnreadMessages ? '1' : '0',
    );
  }

  private apriSocketMessaggi() {
    if (this.socket || !this.currentUserId) return;

    this.socket = io(environment.apiUrl, {
      transports: ['websocket', 'polling'],
    });
    this.socket.emit('join-user', this.currentUserId);
    this.socket.on('message-received', (msg: any) => {
      if (Number(msg.destinatario_id) === Number(this.currentUserId)) {
        this.hasUnreadMessages = true;
        localStorage.setItem('skillup_messaggi_non_letti', '1');
      }
    });
    this.socket.on('user-status-updated', async (payload: any) => {
      if (payload?.stato === 'bloccato') {
        await this.esciPerAccountBloccato();
      }
    });
  }

  private async esciPerAccountBloccato() {
    localStorage.removeItem('token');
    localStorage.removeItem('tipologia_utente');
    localStorage.removeItem('skillup_messaggi_non_letti');
    this.socket?.disconnect();
    this.socket = undefined;

    const alert = await this.alertController.create({
      header: 'Account bloccato',
      message: 'Il tuo profilo è stato bloccato. Verrai disconnesso.',
      buttons: ['OK'],
    });
    await alert.present();
    await this.router.navigate(['/login']);
  }
}
