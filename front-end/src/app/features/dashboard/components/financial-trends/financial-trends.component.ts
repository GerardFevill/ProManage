import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-financial-trends',
  templateUrl: './financial-trends.component.html',
  styleUrls: ['./financial-trends.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FinancialTrendsComponent implements OnInit {
  activeTab: string = 'revenue';
  selectedPeriod: string = '1a';
  
  revenueData = {
    total: 235000,
    growth: 8.5,
    forecast: 255000
  };
  
  expensesData = {
    total: 175000,
    growth: 5.2,
    forecast: 185000
  };
  
  profitData = {
    total: 60000,
    growth: 12.8,
    forecast: 70000
  };
  
  constructor(private store: Store<any>) { }

  ngOnInit(): void {
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  setPeriod(period: string): void {
    this.selectedPeriod = period;
    // Dans une implémentation réelle, nous actualiserions les données ici
  }
  
  getCurrentData(): any {
    switch (this.activeTab) {
      case 'revenue':
        return this.revenueData;
      case 'expenses':
        return this.expensesData;
      case 'profit':
        return this.profitData;
      default:
        return this.revenueData;
    }
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  }
  
  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'text-success' : 'text-danger';
  }
  
  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'bi bi-arrow-up-right' : 'bi bi-arrow-down-right';
  }
}
