import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-summary.component.html',
  styleUrls: ['./financial-summary.component.scss']
})
export class FinancialSummaryComponent implements OnInit {
  // Données financières pour le résumé
  financialData = {
    revenue: 125000,
    expenses: 85000,
    profit: 40000,
    profitMargin: 32,
    previousPeriodProfit: 35000,
    profitChange: 14.3,
    topExpenses: [
      { category: 'Salaires', amount: 45000, percentage: 53 },
      { category: 'Loyer', amount: 12000, percentage: 14 },
      { category: 'Marketing', amount: 8000, percentage: 9 },
      { category: 'Fournisseurs', amount: 7500, percentage: 9 },
      { category: 'Autres', amount: 12500, percentage: 15 }
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'percent', 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  getChangeClass(value: number): string {
    return value >= 0 ? 'positive-change' : 'negative-change';
  }

  getChangeIcon(value: number): string {
    return value >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right';
  }
}
