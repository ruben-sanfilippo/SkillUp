import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tutor-dashboard',
  templateUrl: './tutor-dashboard.page.html',
  styleUrls: ['./tutor-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TutorDashboardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
