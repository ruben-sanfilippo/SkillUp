import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, send, chatbubblesOutline, chevronBackOutline } from 'ionicons/icons';
import { PlatformService } from 'src/app/services/platformService';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

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
export class MessagesPage implements OnInit, AfterViewChecked {

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
    const userId = this.route.snapshot.queryParamMap.get('userId');
    let chatDaAprire: Chat | null | undefined = this.chats.find(
      (chat) => Number(chat.userId) === Number(userId),
    );

    if (!chatDaAprire && userId) {
      chatDaAprire = await this.creaChatDaUtente(userId);
    }

    if (chatDaAprire) {
      await this.selezionaChat(chatDaAprire);
    } else {
      this.activeChat = null;
      this.isChatOpen = false;
    }
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
      unread: false,
      messages: [],
    }));
    this.filteredChats = [...this.chats];
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
    this.activeChat.lastMessageTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      setTimeout(() => this.scrollToBottom(), 50);
    } else if (Number(msg.mittente_id) !== Number(this.currentUserId)) {
      chat.unread = true;
    }

    this.ordinaConversazioni();
    this.filtraChat();
  }

  private async creaChatDaUtente(userId: number | string): Promise<Chat | null> {
    try {
      const user = await this.platformService.getUser(userId);
      const chat: Chat = {
        id: user.id,
        userId: user.id,
        name: `${user.nome} ${user.cognome}`,
        avatar: user.immagine_profilo || '',
        lastMessageText: '',
        lastMessageTime: '',
        unread: false,
        messages: [],
      };
      this.chats.push(chat);
      this.ordinaConversazioni();
      this.filteredChats = [...this.chats];
      return chat;
    } catch {
      return null;
    }
  }

  private ordinaConversazioni() {
    this.chats = [...this.chats].sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      return (b.lastMessageTime || '').localeCompare(a.lastMessageTime || '');
    });
  }
}
