import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, send, chatbubblesOutline, chevronBackOutline } from 'ionicons/icons';
import { PlatformService } from 'src/app/services/platformService';

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
    await this.caricaConversazioni();
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const chatDaAprire = this.chats.find(
      (chat) => Number(chat.userId) === Number(userId),
    );

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
      avatar: chat.immagine_profilo || `https://i.pravatar.cc/150?u=${chat.email}`,
      lastMessageText: chat.lastMessageText || '',
      lastMessageTime: chat.lastMessageTime
        ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
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
}
