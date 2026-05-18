import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tutor-detail',
  templateUrl: './tutor-detail.page.html',
  styleUrls: ['./tutor-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TutorDetailPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
