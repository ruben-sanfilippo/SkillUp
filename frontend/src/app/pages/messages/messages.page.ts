import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, send, chatbubblesOutline, chevronBackOutline } from 'ionicons/icons';
import { MessageService } from 'src/app/services/messageService';
import { UserService } from 'src/app/services/userService';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';
import { Subscription } from 'rxjs';
import type {
  ConversazioneChat,
  MessaggioChat,
  MessaggioApi,
} from 'src/app/interfaces/messages.interfaces';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MessagesPage implements OnInit, AfterViewChecked, OnDestroy {

  searchQuery: string = '';
  newMessageText: string = '';
  activeChat: ConversazioneChat | null = null;
  filteredChats: ConversazioneChat[] = [];
  
  // Variabile di controllo di navigazione per Smartphone
  isChatOpen: boolean = false;

  // Nomi puliti senza la dicitura (Tutor)
  chats: ConversazioneChat[] = [];
  currentUserId = 0;
  private socket?: Socket;
  private queryParamsSub?: Subscription;
  private paginaAttiva = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
  ) {
    addIcons({
      searchOutline,
      send,
      chatbubblesOutline,
      chevronBackOutline
    });
  }

  async ngOnInit() {
    const utente = await this.userService.getMe();
    this.currentUserId = utente.id;
    this.apriSocket();
    await this.caricaConversazioni();
    this.queryParamsSub = this.route.queryParamMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) {
        void this.apriChatDaUserId(userId);
      }
    });

    if (!this.route.snapshot.queryParamMap.get('userId')) {
      this.activeChat = null;
      this.isChatOpen = false;
    }
  }

  async ionViewWillEnter() {
    this.paginaAttiva = true;
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (userId && this.currentUserId) {
      await this.apriChatDaUserId(userId);
    } else if (this.activeChat && this.isChatOpen) {
      await this.selezionaChat(this.activeChat);
    }
  }

  ionViewDidLeave() {
    this.paginaAttiva = false;
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
    this.socket?.disconnect();
  }

  async caricaConversazioni() {
    const conversations = await this.messageService.getConversations();
    this.chats = conversations.map((chat) => ({
      id: chat.id,
      utenteId: chat.id,
      nome: `${chat.nome} ${chat.cognome}`,
      immagineProfilo: chat.immagine_profilo || '',
      ultimoMessaggioTesto: chat.lastMessageText || '',
      ultimoMessaggioOrario: chat.lastMessageTime
        ? this.formattaOrarioMessaggio(chat.lastMessageTime)
        : '',
      ultimoMessaggioData: chat.lastMessageTime || '',
      nonLetta: Number(chat.unreadCount || 0) > 0,
      messaggi: [],
    }));
    this.ordinaConversazioni();
    this.filteredChats = [...this.chats];
    this.notificaMessaggiNonLetti();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  filtraChat() {
    if (!this.searchQuery.trim()) {
      this.filteredChats = [...this.chats];
    } else {
      this.filteredChats = this.chats.filter(chat =>
        chat.nome.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        chat.ultimoMessaggioTesto.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  async selezionaChat(chat: ConversazioneChat) {
    const messages = await this.messageService.getMessages(chat.utenteId);
    chat.messaggi = messages.map((msg) => this.mappaMessaggio(msg));
    chat.nonLetta = false;
    this.activeChat = chat;
    this.isChatOpen = true; 
    this.notificaMessaggiNonLetti();
    setTimeout(() => this.scrollToBottom(), 50);
  }

  chiudiChatMobile() {
    this.isChatOpen = false; 
    this.activeChat = null;
  }

  async inviaMessaggio() {
    if (!this.newMessageText || !this.newMessageText.trim() || !this.activeChat) return;

    const testo = this.newMessageText.trim();
    const messages = await this.messageService.sendMessage(
      this.activeChat.utenteId,
      testo,
    );
    this.activeChat.messaggi = messages.map((msg) => this.mappaMessaggio(msg));
    this.activeChat.ultimoMessaggioTesto = testo;
    const ultimoMessaggio = messages[messages.length - 1];
    this.activeChat.ultimoMessaggioData =
      ultimoMessaggio?.data_invio || new Date().toISOString();
    this.activeChat.ultimoMessaggioOrario = this.formattaOrarioMessaggio(
      this.activeChat.ultimoMessaggioData,
    );
    this.activeChat.nonLetta = false;
    this.aggiungiChatSeMancante(this.activeChat);
    this.ordinaConversazioni();
    this.filtraChat();
    this.newMessageText = '';

    this.scrollToBottom();
  }

  iniziali(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase();
  }

  private scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private mappaMessaggio(msg: MessaggioApi): MessaggioChat {
    return {
      id: msg.id,
      testo: msg.contenuto,
      orario: this.formattaOrarioMessaggio(msg.data_invio),
      mittente:
        Number(msg.mittente_id) === Number(this.currentUserId)
          ? 'studente'
          : 'tutor',
    };
  }

  private apriSocket() {
    this.socket = io(environment.apiUrl, {
      transports: ['websocket', 'polling'],
    });
    this.socket.emit('join-user', this.currentUserId);
    this.socket.on('message-received', (msg: MessaggioApi) => {
      this.gestisciMessaggioSocket(msg);
    });
  }

  private async gestisciMessaggioSocket(msg: MessaggioApi) {
    const otherUserId =
      Number(msg.mittente_id) === Number(this.currentUserId)
        ? Number(msg.destinatario_id)
        : Number(msg.mittente_id);

    let chat: ConversazioneChat | null | undefined = this.chats.find(
      (item) => Number(item.utenteId) === otherUserId,
    );
    if (!chat) {
      chat = await this.creaChatDaUtente(otherUserId);
    }
    if (!chat) return;

    chat.ultimoMessaggioTesto = msg.contenuto;
    chat.ultimoMessaggioData = msg.data_invio || new Date().toISOString();
    chat.ultimoMessaggioOrario = this.formattaOrarioMessaggio(
      chat.ultimoMessaggioData,
    );

    const messaggioRicevuto = Number(msg.mittente_id) !== Number(this.currentUserId);
    const isActive =
      this.paginaAttiva &&
      this.isChatOpen &&
      Number(this.activeChat?.utenteId) === otherUserId;

    if (isActive) {
      const exists = this.activeChat!.messaggi.some(
        (message) => Number(message.id) === Number(msg.id),
      );
      if (!exists) {
        this.activeChat!.messaggi.push(this.mappaMessaggio(msg));
      }
      chat.nonLetta = false;
      await this.messageService.markMessagesRead(otherUserId);
      setTimeout(() => this.scrollToBottom(), 50);
    } else if (messaggioRicevuto) {
      chat.nonLetta = true;
    }

    this.notificaMessaggiNonLetti();
    this.ordinaConversazioni();
    this.filtraChat();
  }

  private async apriChatDaUserId(userId: number | string) {
    if (Number(userId) === Number(this.currentUserId)) return;

    let chatDaAprire: ConversazioneChat | null | undefined = this.chats.find(
      (chat) => Number(chat.utenteId) === Number(userId),
    );

    if (!chatDaAprire) {
      chatDaAprire = await this.creaChatDaUtente(userId, false);
    }

    if (chatDaAprire) {
      await this.selezionaChat(chatDaAprire);
    }
  }

  private async creaChatDaUtente(
    userId: number | string,
    aggiungiAllaLista = true,
  ): Promise<ConversazioneChat | null> {
    try {
      const user = await this.userService.getUser(userId);
      const chat: ConversazioneChat = {
        id: user.id,
        utenteId: user.id,
        nome: `${user.nome} ${user.cognome}`,
        immagineProfilo: user.immagine_profilo || '',
        ultimoMessaggioTesto: '',
        ultimoMessaggioOrario: '',
        ultimoMessaggioData: '',
        nonLetta: false,
        messaggi: [],
      };
      if (aggiungiAllaLista) {
        this.aggiungiChatSeMancante(chat);
        this.ordinaConversazioni();
        this.filteredChats = [...this.chats];
      }
      return chat;
    } catch {
      return null;
    }
  }

  private ordinaConversazioni() {
    this.chats = [...this.chats].sort((a, b) => {
      if (a.nonLetta !== b.nonLetta) return a.nonLetta ? -1 : 1;
      return this.timestampChat(b) - this.timestampChat(a);
    });
  }

  private aggiungiChatSeMancante(chat: ConversazioneChat) {
    const exists = this.chats.some(
      (item) => Number(item.utenteId) === Number(chat.utenteId),
    );
    if (!exists) {
      this.chats = [chat, ...this.chats];
    }
  }

  private timestampChat(chat: ConversazioneChat): number {
    if (!chat.ultimoMessaggioData) return 0;
    const timestamp = this.dataMessaggioUtente(chat.ultimoMessaggioData).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private formattaOrarioMessaggio(dataInvio?: string): string {
    return this.dataMessaggioUtente(dataInvio).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private dataMessaggioUtente(dataInvio?: string): Date {
    const valore = String(dataInvio || '').trim();
    if (!valore) return new Date();

    if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(valore)) {
      return new Date(valore);
    }

    const isoSenzaFuso = valore.includes('T')
      ? valore
      : valore.replace(' ', 'T');
    return new Date(`${isoSenzaFuso}Z`);
  }

  private notificaMessaggiNonLetti() {
    const hasUnread = this.chats.some((chat) => chat.nonLetta);
    localStorage.setItem('skillup_messaggi_non_letti', hasUnread ? '1' : '0');
    window.dispatchEvent(
      new CustomEvent('skillup-messaggi-non-letti', {
        detail: { hasUnread },
      }),
    );
  }
}
