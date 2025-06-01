import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FinancialGoal {
  name: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-financial-goals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-goals.component.html',
  styleUrls: ['./financial-goals.component.scss']
})
export class FinancialGoalsComponent implements OnInit {
  // Objectifs financiers
  financialGoals: FinancialGoal[] = [
    {
      name: 'Chiffre d\'affaires',
      target: 250000,
      current: 125000,
      unit: 'EUR',
      icon: 'bi-graph-up-arrow',
      color: '#2196F3'
    },
    {
      name: 'Marge bénéficiaire',
      target: 35,
      current: 32,
      unit: '%',
      icon: 'bi-percent',
      color: '#4CAF50'
    },
    {
      name: 'Trésorerie',
      target: 60000,
      current: 45000,
      unit: 'EUR',
      icon: 'bi-cash-stack',
      color: '#FF9800'
    },
    {
      name: 'Réduction des coûts',
      target: 15,
      current: 8,
      unit: '%',
      icon: 'bi-scissors',
      color: '#9C27B0'
    }
  ];

  // KPIs supplémentaires
  kpis = [
    { name: 'Délai moyen de paiement', value: '28 jours', target: '21 jours', trend: 'down', status: 'warning' },
    { name: 'Taux de conversion', value: '18%', target: '15%', trend: 'up', status: 'success' },
    { name: 'Coût d\'acquisition client', value: '250 €', target: '300 €', trend: 'down', status: 'success' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // Calculer le pourcentage de progression vers l'objectif
  calculateProgress(current: number, target: number): number {
    return Math.min(Math.round((current / target) * 100), 100);
  }

  // Formater les valeurs monétaires
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Formater les pourcentages
  formatPercentage(value: number): string {
    return `${value}%`;
  }

  // Formater la valeur selon l'unité
  formatValue(value: number, unit: string): string {
    if (unit === 'EUR') {
      return this.formatCurrency(value);
    } else if (unit === '%') {
      return this.formatPercentage(value);
    }
    return `${value} ${unit}`;
  }

  // Déterminer la classe CSS pour la tendance
  getTrendClass(trend: string): string {
    return trend === 'up' ? 'trend-up' : 'trend-down';
  }

  // Obtenir l'icône pour la tendance
  getTrendIcon(trend: string): string {
    return trend === 'up' ? 'bi-arrow-up-right' : 'bi-arrow-down-right';
  }
}
