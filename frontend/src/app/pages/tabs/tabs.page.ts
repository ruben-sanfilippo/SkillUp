import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  IonContent,
  IonLabel,
  IonIcon,
  IonTabButton,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { homeOutline, searchOutline, personOutline } from 'ionicons/icons';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonTabButton,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class TabsPage implements OnInit {
  constructor() {
    addIcons({
      homeOutline,
      searchOutline,
      personOutline,
    });
  }

  ngOnInit() {}
}
