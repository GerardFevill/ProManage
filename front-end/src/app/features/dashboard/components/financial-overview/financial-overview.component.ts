import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration } from 'chart.js';

interface Category {
  name: string;
  amount: number;
  transactions: number;
  percentage: number;
  icon: string;
}

@Component({
  selector: 'app-financial-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-overview.component.html',
  styleUrls: ['./financial-overview.component.scss']
})
export class FinancialOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('depensesChart') depensesChart!: ElementRef;
  @ViewChild('revenusChart') revenusChart!: ElementRef;

  activeTab: string = 'depenses';
  selectedPeriod: string = '1a';
  
  totalDepenses: number = 3032;
  totalRevenus: number = 2850;

  depensesCategories: Category[] = [
    { name: 'Espèces', amount: 1065, transactions: 5, percentage: 35, icon: 'bi-cash' },
    { name: 'Courses', amount: 460, transactions: 20, percentage: 15, icon: 'bi-cart' },
    { name: 'Services', amount: 458, transactions: 8, percentage: 15, icon: 'bi-gear' }
  ];

  revenusCategories: Category[] = [
    { name: 'Recharges', amount: 2850, transactions: 8, percentage: 100, icon: 'bi-plus-circle' }
  ];

  private depensesChartInstance?: Chart;
  private revenusChartInstance?: Chart;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  setPeriod(period: string): void {
    this.selectedPeriod = period;
    // Ici, vous pourriez ajouter la logique pour mettre à jour les données en fonction de la période
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  private initializeCharts(): void {
    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        datasets: [{
          data: [1800, 1200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: this.activeTab === 'depenses' ? '#ff69b4' : '#4169e1',
          borderRadius: 4,
          barThickness: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#333',
              display: true
            },
            border: {
              display: false
            },
            ticks: {
              color: '#888',
              callback: (value) => value + 'K'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#888'
            }
          }
        }
      }
    };

    if (this.depensesChart) {
      this.depensesChartInstance = new Chart(this.depensesChart.nativeElement, chartConfig);
    }

    if (this.revenusChart) {
      this.revenusChartInstance = new Chart(this.revenusChart.nativeElement, {
        ...chartConfig,
        data: {
          ...chartConfig.data,
          datasets: [{
            ...chartConfig.data.datasets[0],
            data: [2500, 350, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#4169e1'
          }]
        }
      });
    }
  }
}
