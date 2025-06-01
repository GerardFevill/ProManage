import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardState } from '../../store/dashboard.state';
import * as DashboardSelectors from '../../store/dashboard.selectors';

interface BudgetCategory {
  id: number;
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
  percentUsed: number;
  trend: 'up' | 'down' | 'stable';
}

interface BudgetPeriod {
  id: string;
  name: string;
}

@Component({
  selector: 'app-budget-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-tracking.component.html',
  styleUrls: ['./budget-tracking.component.scss']
})
export class BudgetTrackingComponent implements OnInit {
  // Données des catégories budgétaires
  expenseCategories: BudgetCategory[] = [
    {
      id: 1,
      name: 'Achats de marchandises',
      budgeted: 25000,
      actual: 22800,
      variance: 2200,
      percentUsed: 91.2,
      trend: 'down'
    },
    {
      id: 2,
      name: 'Frais de personnel',
      budgeted: 45000,
      actual: 46200,
      variance: -1200,
      percentUsed: 102.7,
      trend: 'up'
    },
    {
      id: 3,
      name: 'Loyers et charges',
      budgeted: 8500,
      actual: 8500,
      variance: 0,
      percentUsed: 100,
      trend: 'stable'
    },
    {
      id: 4,
      name: 'Marketing et publicité',
      budgeted: 12000,
      actual: 9800,
      variance: 2200,
      percentUsed: 81.7,
      trend: 'down'
    },
    {
      id: 5,
      name: 'Frais généraux',
      budgeted: 7500,
      actual: 8100,
      variance: -600,
      percentUsed: 108,
      trend: 'up'
    }
  ];

  revenueCategories: BudgetCategory[] = [
    {
      id: 1,
      name: 'Ventes de produits',
      budgeted: 85000,
      actual: 92300,
      variance: 7300,
      percentUsed: 108.6,
      trend: 'up'
    },
    {
      id: 2,
      name: 'Prestations de services',
      budgeted: 35000,
      actual: 32800,
      variance: -2200,
      percentUsed: 93.7,
      trend: 'down'
    },
    {
      id: 3,
      name: 'Abonnements',
      budgeted: 15000,
      actual: 16200,
      variance: 1200,
      percentUsed: 108,
      trend: 'up'
    }
  ];

  // Périodes disponibles
  periods: BudgetPeriod[] = [
    { id: 'month', name: 'Mois en cours' },
    { id: 'quarter', name: 'Trimestre en cours' },
    { id: 'ytd', name: 'Cumul annuel' },
    { id: 'year', name: 'Année complète' }
  ];

  // Période sélectionnée
  selectedPeriod: string = 'month';

  // Type de vue sélectionnée
  selectedView: 'expenses' | 'revenues' | 'both' = 'both';

  // Totaux calculés
  totals = {
    budgetedExpenses: 0,
    actualExpenses: 0,
    expensesVariance: 0,
    budgetedRevenues: 0,
    actualRevenues: 0,
    revenuesVariance: 0
  };

  constructor(private store: Store<DashboardState>) { }

  ngOnInit(): void {
    // Récupérer les données des comptes bancaires pour générer des données budgétaires
    this.store.select(DashboardSelectors.selectBankAccounts).pipe(
      map(accounts => {
        if (accounts && accounts.length > 0) {
          // Générer des données budgétaires basées sur les comptes bancaires
          this.generateBudgetDataFromAccounts(accounts);
          this.calculateTotals();
        }
      })
    ).subscribe();
  }
  
  /**
   * Génère des données budgétaires basées sur les comptes bancaires
   */
  generateBudgetDataFromAccounts(accounts: any[]): void {
    // Calculer le total des soldes des comptes
    const totalBalance = accounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance || '0');
    }, 0);
    
    // Générer des données budgétaires réalistes
    const baseExpenseBudget = totalBalance * 0.8;
    const baseRevenueBudget = totalBalance * 1.2;
    
    // Catégories de dépenses
    this.expenseCategories = [
      {
        id: 1,
        name: 'Achats de marchandises',
        budgeted: Math.round(baseExpenseBudget * 0.4),
        actual: Math.round(baseExpenseBudget * 0.4 * (0.9 + Math.random() * 0.2)),
        variance: 0, // Sera calculé
        percentUsed: 0, // Sera calculé
        trend: 'down'
      },
      {
        id: 2,
        name: 'Frais de personnel',
        budgeted: Math.round(baseExpenseBudget * 0.3),
        actual: Math.round(baseExpenseBudget * 0.3 * (0.95 + Math.random() * 0.15)),
        variance: 0,
        percentUsed: 0,
        trend: 'up'
      },
      {
        id: 3,
        name: 'Loyers et charges',
        budgeted: Math.round(baseExpenseBudget * 0.1),
        actual: Math.round(baseExpenseBudget * 0.1),
        variance: 0,
        percentUsed: 0,
        trend: 'stable'
      },
      {
        id: 4,
        name: 'Marketing et publicité',
        budgeted: Math.round(baseExpenseBudget * 0.1),
        actual: Math.round(baseExpenseBudget * 0.1 * (0.7 + Math.random() * 0.3)),
        variance: 0,
        percentUsed: 0,
        trend: 'down'
      },
      {
        id: 5,
        name: 'Frais généraux',
        budgeted: Math.round(baseExpenseBudget * 0.1),
        actual: Math.round(baseExpenseBudget * 0.1 * (1 + Math.random() * 0.2)),
        variance: 0,
        percentUsed: 0,
        trend: 'up'
      }
    ];
    
    // Catégories de revenus
    this.revenueCategories = [
      {
        id: 1,
        name: 'Ventes de produits',
        budgeted: Math.round(baseRevenueBudget * 0.6),
        actual: Math.round(baseRevenueBudget * 0.6 * (1 + Math.random() * 0.2)),
        variance: 0,
        percentUsed: 0,
        trend: 'up'
      },
      {
        id: 2,
        name: 'Prestations de services',
        budgeted: Math.round(baseRevenueBudget * 0.3),
        actual: Math.round(baseRevenueBudget * 0.3 * (0.9 + Math.random() * 0.1)),
        variance: 0,
        percentUsed: 0,
        trend: 'down'
      },
      {
        id: 3,
        name: 'Abonnements',
        budgeted: Math.round(baseRevenueBudget * 0.1),
        actual: Math.round(baseRevenueBudget * 0.1 * (1.05 + Math.random() * 0.1)),
        variance: 0,
        percentUsed: 0,
        trend: 'up'
      }
    ];
    
    // Calculer les variances et pourcentages
    this.expenseCategories.forEach(category => {
      category.variance = category.budgeted - category.actual;
      category.percentUsed = Math.round((category.actual / category.budgeted) * 1000) / 10;
      category.trend = category.variance > 0 ? 'down' : (category.variance < 0 ? 'up' : 'stable');
    });
    
    this.revenueCategories.forEach(category => {
      category.variance = category.actual - category.budgeted;
      category.percentUsed = Math.round((category.actual / category.budgeted) * 1000) / 10;
      category.trend = category.variance > 0 ? 'up' : (category.variance < 0 ? 'down' : 'stable');
    });
  }

  // Calculer les totaux
  calculateTotals(): void {
    // Réinitialiser les totaux
    this.totals = {
      budgetedExpenses: 0,
      actualExpenses: 0,
      expensesVariance: 0,
      budgetedRevenues: 0,
      actualRevenues: 0,
      revenuesVariance: 0
    };

    // Calculer les totaux pour les dépenses
    this.expenseCategories.forEach(category => {
      this.totals.budgetedExpenses += category.budgeted;
      this.totals.actualExpenses += category.actual;
    });
    this.totals.expensesVariance = this.totals.budgetedExpenses - this.totals.actualExpenses;

    // Calculer les totaux pour les revenus
    this.revenueCategories.forEach(category => {
      this.totals.budgetedRevenues += category.budgeted;
      this.totals.actualRevenues += category.actual;
    });
    this.totals.revenuesVariance = this.totals.actualRevenues - this.totals.budgetedRevenues;
  }

  // Changer la période
  changePeriod(periodId: string): void {
    this.selectedPeriod = periodId;
    // Ici, on pourrait recharger les données en fonction de la période
  }

  // Changer la vue
  changeView(view: 'expenses' | 'revenues' | 'both'): void {
    this.selectedView = view;
  }

  // Formater les montants
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Obtenir la classe CSS pour la variance
  getVarianceClass(variance: number): string {
    if (variance > 0) {
      return 'text-success';
    } else if (variance < 0) {
      return 'text-danger';
    } else {
      return '';
    }
  }

  // Obtenir la classe CSS pour le pourcentage utilisé
  getPercentClass(category: BudgetCategory): string {
    // Pour les dépenses, dépasser le budget est mauvais
    if (this.expenseCategories.some(c => c.id === category.id)) {
      if (category.percentUsed > 100) {
        return 'text-danger';
      } else if (category.percentUsed >= 90) {
        return 'text-warning';
      } else {
        return 'text-success';
      }
    } 
    // Pour les revenus, dépasser le budget est bon
    else {
      if (category.percentUsed >= 100) {
        return 'text-success';
      } else if (category.percentUsed >= 90) {
        return 'text-warning';
      } else {
        return 'text-danger';
      }
    }
  }

  // Obtenir l'icône pour la tendance
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'bi-arrow-up-circle-fill';
      case 'down':
        return 'bi-arrow-down-circle-fill';
      case 'stable':
        return 'bi-dash-circle-fill';
      default:
        return '';
    }
  }

  // Obtenir la classe CSS pour la tendance
  getTrendClass(trend: string, isExpense: boolean): string {
    // Pour les dépenses, "up" est mauvais et "down" est bon
    if (isExpense) {
      switch (trend) {
        case 'up':
          return 'text-danger';
        case 'down':
          return 'text-success';
        default:
          return 'text-muted';
      }
    } 
    // Pour les revenus, "up" est bon et "down" est mauvais
    else {
      switch (trend) {
        case 'up':
          return 'text-success';
        case 'down':
          return 'text-danger';
        default:
          return 'text-muted';
      }
    }
  }
}
