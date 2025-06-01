import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-treasury-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treasury-view.component.html',
  styleUrls: ['./treasury-view.component.scss']
})
export class TreasuryViewComponent implements OnInit {
  @ViewChild('treasuryChart') treasuryChartRef!: ElementRef;
  treasuryChart: Chart | null = null;
  
  treasuryBalance = 45000;
  
  // Données de trésorerie pour le graphique
  treasuryData = [
    { month: 'Jan', balance: 32000 },
    { month: 'Fév', balance: 35000 },
    { month: 'Mar', balance: 38000 },
    { month: 'Avr', balance: 36000 },
    { month: 'Mai', balance: 40000 },
    { month: 'Jun', balance: 42000 },
    { month: 'Jul', balance: 45000 }
  ];
  
  // Prévisions de trésorerie
  treasuryForecast = [
    { month: 'Aoû', balance: 47000 },
    { month: 'Sep', balance: 49000 },
    { month: 'Oct', balance: 51000 },
    { month: 'Nov', balance: 53000 },
    { month: 'Déc', balance: 55000 }
  ];
  
  // Comptes bancaires
  bankAccounts = [
    { name: 'Compte courant', balance: 25000, icon: 'bi-bank' },
    { name: 'Compte épargne', balance: 20000, icon: 'bi-piggy-bank' }
  ];
  
  // Transactions récentes
  recentTransactions = [
    { date: '2025-05-20', description: 'Paiement fournisseur', amount: -1200, category: 'Fournisseurs' },
    { date: '2025-05-18', description: 'Vente de services', amount: 3500, category: 'Ventes' },
    { date: '2025-05-15', description: 'Loyer bureau', amount: -800, category: 'Loyer' },
    { date: '2025-05-10', description: 'Facture client', amount: 2800, category: 'Ventes' }
  ];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initTreasuryChart();
  }

  initTreasuryChart(): void {
    if (this.treasuryChartRef) {
      const ctx = this.treasuryChartRef.nativeElement.getContext('2d');
      
      // Combiner les données historiques et les prévisions
      const labels = [...this.treasuryData.map(d => d.month), ...this.treasuryForecast.map(d => d.month)];
      const historicalData = this.treasuryData.map(d => d.balance);
      const forecastData = this.treasuryForecast.map(d => d.balance);
      
      // Créer un tableau complet avec les valeurs historiques et null pour les prévisions
      const historicalDataSet = [...historicalData, ...Array(forecastData.length).fill(null)];
      
      // Créer un tableau complet avec null pour les valeurs historiques et les prévisions
      const forecastDataSet = [...Array(historicalData.length - 1).fill(null), 
                              historicalData[historicalData.length - 1], 
                              ...forecastData];
      
      this.treasuryChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Trésorerie',
              data: historicalDataSet,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Prévisions',
              data: forecastDataSet,
              borderColor: '#4CAF50',
              borderDash: [5, 5],
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  if (typeof value === 'number') {
                    return new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value);
                  }
                  return '';
                }
              }
            }
          }
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  }
}
