import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, send, chatbubblesOutline, chevronBackOutline } from 'ionicons/icons';
import { PlatformService } from 'src/app/services/platformService';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';
import { Subscription } from 'rxjs';

interface Message {
  id: string | number;
  text: string;
  time: string;
  sender: 'student' | 'tutor';
}

interface Chat {
  id: string | number;
  userId: number;
  name: string;
  avatar: string;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageAt: string;
  unread: boolean;
  messages: Message[];
}

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
  activeChat: Chat | null = null;
  filteredChats: Chat[] = [];
  
  // Variabile di controllo di navigazione per Smartphone
  isChatOpen: boolean = false;

  // Nomi puliti senza la dicitura (Tutor)
  chats: Chat[] = [];
  currentUserId = 0;
  private socket?: Socket;
  private queryParamsSub?: Subscription;

  constructor(
    private platformService: PlatformService,
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
    const utente = await this.platformService.getMe();
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
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (userId && this.currentUserId) {
      await this.apriChatDaUserId(userId);
    }
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
    this.socket?.disconnect();
  }

  async caricaConversazioni() {
    const conversations = await this.platformService.getConversations();
    this.chats = conversations.map((chat) => ({
      id: chat.id,
      userId: chat.id,
      name: `${chat.nome} ${chat.cognome}`,
      avatar: chat.immagine_profilo || '',
      lastMessageText: chat.lastMessageText || '',
      lastMessageTime: chat.lastMessageTime
        ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      lastMessageAt: chat.lastMessageTime || '',
      unread: Number(chat.unreadCount || 0) > 0,
      messages: [],
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
        chat.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        chat.lastMessageText.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  async selezionaChat(chat: Chat) {
    const messages = await this.platformService.getMessages(chat.userId);
    chat.messages = messages.map((msg) => this.mappaMessaggio(msg));
    chat.unread = false;
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
    const messages = await this.platformService.sendMessage(
      this.activeChat.userId,
      testo,
    );
    this.activeChat.messages = messages.map((msg) => this.mappaMessaggio(msg));
    this.activeChat.lastMessageText = testo;
    const ultimoMessaggio = messages[messages.length - 1];
    this.activeChat.lastMessageAt =
      ultimoMessaggio?.data_invio || new Date().toISOString();
    this.activeChat.lastMessageTime = new Date(
      this.activeChat.lastMessageAt,
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.activeChat.unread = false;
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

  private mappaMessaggio(msg: any): Message {
    return {
      id: msg.id,
      text: msg.contenuto,
      time: new Date(msg.data_invio).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sender:
        Number(msg.mittente_id) === Number(this.currentUserId)
          ? 'student'
          : 'tutor',
    };
  }

  private apriSocket() {
    this.socket = io(environment.apiUrl, {
      transports: ['websocket', 'polling'],
    });
    this.socket.emit('join-user', this.currentUserId);
    this.socket.on('message-received', (msg: any) => {
      this.gestisciMessaggioSocket(msg);
    });
  }

  private async gestisciMessaggioSocket(msg: any) {
    const otherUserId =
      Number(msg.mittente_id) === Number(this.currentUserId)
        ? Number(msg.destinatario_id)
        : Number(msg.mittente_id);

    let chat: Chat | null | undefined = this.chats.find(
      (item) => Number(item.userId) === otherUserId,
    );
    if (!chat) {
      chat = await this.creaChatDaUtente(otherUserId);
    }
    if (!chat) return;

    chat.lastMessageText = msg.contenuto;
    chat.lastMessageAt = msg.data_invio || new Date().toISOString();
    chat.lastMessageTime = new Date(msg.data_invio).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isActive = Number(this.activeChat?.userId) === otherUserId;
    if (isActive) {
      const exists = this.activeChat!.messages.some(
        (message) => Number(message.id) === Number(msg.id),
      );
      if (!exists) {
        this.activeChat!.messages.push(this.mappaMessaggio(msg));
      }
      chat.unread = false;
      await this.platformService.markMessagesRead(otherUserId);
      setTimeout(() => this.scrollToBottom(), 50);
    } else if (Number(msg.mittente_id) !== Number(this.currentUserId)) {
      chat.unread = true;
    }

    this.notificaMessaggiNonLetti();
    this.ordinaConversazioni();
    this.filtraChat();
  }

  private async apriChatDaUserId(userId: number | string) {
    if (Number(userId) === Number(this.currentUserId)) return;

    let chatDaAprire: Chat | null | undefined = this.chats.find(
      (chat) => Number(chat.userId) === Number(userId),
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
  ): Promise<Chat | null> {
    try {
      const user = await this.platformService.getUser(userId);
      const chat: Chat = {
        id: user.id,
        userId: user.id,
        name: `${user.nome} ${user.cognome}`,
        avatar: user.immagine_profilo || '',
        lastMessageText: '',
        lastMessageTime: '',
        lastMessageAt: '',
        unread: false,
        messages: [],
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
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      return this.timestampChat(b) - this.timestampChat(a);
    });
  }

  private aggiungiChatSeMancante(chat: Chat) {
    const exists = this.chats.some(
      (item) => Number(item.userId) === Number(chat.userId),
    );
    if (!exists) {
      this.chats = [chat, ...this.chats];
    }
  }

  private timestampChat(chat: Chat): number {
    if (!chat.lastMessageAt) return 0;
    const timestamp = new Date(chat.lastMessageAt).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private notificaMessaggiNonLetti() {
    const hasUnread = this.chats.some((chat) => chat.unread);
    localStorage.setItem('skillup_messaggi_non_letti', hasUnread ? '1' : '0');
    window.dispatchEvent(
      new CustomEvent('skillup-messaggi-non-letti', {
        detail: { hasUnread },
      }),
    );
  }
}
