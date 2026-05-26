import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline, send, chatbubblesOutline, chevronBackOutline } from 'ionicons/icons';

interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'student' | 'tutor';
}

interface Chat {
  id: string;
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
  chats: Chat[] = [
    {
      id: 'c1',
      name: 'Sarah Jenkins',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      lastMessageText: 'That sounds like a great plan for the...',
      lastMessageTime: '10:42 AM',
      messages: [
        { id: 'm1_1', text: 'Ciao Alessandro, ho analizzato la tua richiesta per l\'esercitazione.', time: '10:30 AM', sender: 'tutor' },
        { id: 'm1_2', text: 'Ottimo! Pensa che riusciremo a chiudere l\'argomento entro questa settimana?', time: '10:35 AM', sender: 'student' },
        { id: 'm1_3', text: 'That sounds like a great plan for the framework.', time: '10:42 AM', sender: 'tutor' }
      ]
    },
    {
      id: 'c2',
      name: 'David Miller',
      avatar: 'https://i.pravatar.cc/150?u=david',
      lastMessageText: 'Ci vediamo direttamente giovedì alle 15:00.',
      lastMessageTime: 'Yesterday',
      messages: [
        { id: 'm2_1', text: 'Purtroppo martedì ho un esame straordinario in facoltà.', time: '04:15 PM', sender: 'tutor' },
        { id: 'm2_2', text: 'Ci vediamo direttamente giovedì alle 15:00.', time: '04:16 PM', sender: 'tutor' }
      ]
    },
    {
      id: 'c3',
      name: 'Michael Chang',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      lastMessageText: 'Grazie per il feedback sul progetto.',
      lastMessageTime: 'Tuesday',
      messages: [
        { id: 'm3_1', text: 'Ho caricato le correzioni del codice sul portale di studio.', time: '02:00 PM', sender: 'tutor' },
        { id: 'm3_2', text: 'Grazie per il feedback sul progetto.', time: '02:15 PM', sender: 'student' }
      ]
    }
  ];

  constructor() {
    addIcons({
      searchOutline,
      send,
      chatbubblesOutline,
      chevronBackOutline
    });
  }

  ngOnInit() {
    this.filteredChats = [...this.chats];
    this.activeChat = null;
    this.isChatOpen = false;
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

  selezionaChat(chat: Chat) {
    this.activeChat = chat;
    this.isChatOpen = true; 
    setTimeout(() => this.scrollToBottom(), 50);
  }

  chiudiChatMobile() {
    this.isChatOpen = false; 
    this.activeChat = null;
  }

  inviaMessaggio() {
    if (!this.newMessageText || !this.newMessageText.trim() || !this.activeChat) return;

    const oraCorrente = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nuovoMessaggio: Message = {
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      text: this.newMessageText.trim(),
      time: oraCorrente,
      sender: 'student'
    };

    this.activeChat.messages.push(nuovoMessaggio);
    this.activeChat.lastMessageText = nuovoMessaggio.text;
    this.activeChat.lastMessageTime = oraCorrente;
    this.newMessageText = '';

    this.scrollToBottom();
  }

  private scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}