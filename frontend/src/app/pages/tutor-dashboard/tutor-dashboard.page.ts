import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  calendarOutline,
  cashOutline,
  chatbubbleEllipsesOutline,
  libraryOutline,
  personOutline,
  statsChartOutline,
  timeOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import {
  DashboardService,
  MateriaPiuPrenotata,
  ProssimaLezione,
  RicavoMensile,
  StatisticaMateriale,
} from 'src/app/services/dashboardService';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';

@Component({
  selector: 'app-tutor-dashboard',
  templateUrl: './tutor-dashboard.page.html',
  styleUrls: ['./tutor-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, AvatarComponent],
})
export class TutorDashboardPage implements OnInit {
  isCaricamento = false;
  messaggioErrore = '';
  anno = new Date().getFullYear();
  ricaviMensili: RicavoMensile[] = this.creaRicaviVuoti();
  materiaPiuPrenotata: MateriaPiuPrenotata | null = null;
  materialePiuAcquistato: StatisticaMateriale | null = null;
  materiali: StatisticaMateriale[] = [];
  prossimeLezioni: ProssimaLezione[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
  ) {
    addIcons({
      bookOutline,
      calendarOutline,
      cashOutline,
      chatbubbleEllipsesOutline,
      libraryOutline,
      personOutline,
      statsChartOutline,
      timeOutline,
      trendingUpOutline,
    });
  }

  ngOnInit() {
    this.caricaStatistiche();
  }

  ionViewWillEnter() {
    this.caricaStatistiche();
  }

  get totaleRicavi(): number {
    return this.ricaviMensili.reduce((totale, mese) => totale + mese.ricavi, 0);
  }

  get ricavoMassimoMensile(): number {
    return Math.max(...this.ricaviMensili.map((mese) => mese.ricavi));
  }

  get totaleAcquistiMateriali(): number {
    return this.materiali.reduce(
      (totale, materiale) => totale + materiale.acquisti,
      0,
    );
  }

  get totaleRicaviMateriali(): number {
    return this.materiali.reduce(
      (totale, materiale) => totale + materiale.ricavi,
      0,
    );
  }

  get progressoMateriaPiuPrenotata(): number {
    return this.materiaPiuPrenotata ? 100 : 0;
  }

  async caricaStatistiche() {
    this.isCaricamento = true;
    this.messaggioErrore = '';

    try {
      const statistiche = await this.dashboardService.getTutorDashboard();
      this.anno = statistiche.anno;
      this.ricaviMensili = statistiche.ricaviMensili;
      this.materiaPiuPrenotata = statistiche.materiaPiuPrenotata;
      this.materialePiuAcquistato = statistiche.materialePiuAcquistato;
      this.materiali = statistiche.materiali;
      this.prossimeLezioni = statistiche.prossimeLezioni || [];
    } catch (error) {
      console.error('Errore caricamento dashboard tutor:', error);
      this.messaggioErrore =
        'Non è stato possibile caricare le statistiche dal backend.';
    } finally {
      this.isCaricamento = false;
    }
  }

  getBarHeight(ricavi: number): number {
    if (this.ricavoMassimoMensile === 0) {
      return 0;
    }

    return Math.max(12, Math.round((ricavi / this.ricavoMassimoMensile) * 100));
  }

  formatEuro(valore: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valore);
  }

  formatData(data: string): string {
    return new Date(`${data}T00:00:00`).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  contattaStudente(lezione: ProssimaLezione) {
    this.router.navigate(['/tabs/messages'], {
      queryParams: { userId: lezione.studenteId },
    });
  }

  private creaRicaviVuoti(): RicavoMensile[] {
    return [
      'Gen',
      'Feb',
      'Mar',
      'Apr',
      'Mag',
      'Giu',
      'Lug',
      'Ago',
      'Set',
      'Ott',
      'Nov',
      'Dic',
    ].map((mese) => ({ mese, ricavi: 0 }));
  }
}
