import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

interface ForecastDetail {
  period: string;
  revenue: number;
  expense: number;
  result: number;
  margin: number;
  evolution: number;
  cashFlow: number;
  workingCapital: number;
}

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HighchartsChartModule
  ]
})
export class ForecastComponent implements OnInit {
  selectedPeriod: 'mois' | 'trimestre' | 'semestre' | 'annee' = 'mois';
  forecastForm: FormGroup;
  Highcharts: typeof Highcharts = Highcharts;
  forecastDetails: ForecastDetail[] = [];

  // Données financières
  totalRevenue: number = 0;
  totalExpense: number = 0;
  netResult: number = 0;
  marginPercentage: number = 0;
  revenueGrowth: number = 0;
  expenseGrowth: number = 0;
  cashFlow: number = 0;
  workingCapital: number = 0;

  // Ratios financiers
  profitability: number = 0;
  solvencyRatio: number = 0;
  liquidityRatio: number = 0;
  financialAutonomy: number = 0;
  
  private chartDefaults: Partial<Highcharts.Options> = {
    chart: {
      backgroundColor: 'var(--bg-secondary)',
      style: {
        fontFamily: 'Arial, sans-serif'
      }
    },
    title: {
      style: {
        color: 'var(--text-primary)'
      }
    },
    xAxis: {
      categories: [],
      labels: {
        style: {
          color: 'var(--text-primary)'
        }
      },
      gridLineColor: 'var(--sidebar-bg)',
      lineColor: 'var(--sidebar-bg)'
    },
    yAxis: {
      title: {
        style: {
          color: 'var(--text-primary)'
        }
      },
      labels: {
        style: {
          color: 'var(--text-primary)'
        }
      },
      gridLineColor: 'var(--sidebar-bg)'
    },
    legend: {
      itemStyle: {
        color: 'var(--text-primary)'
      }
    },
    tooltip: {
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--sidebar-bg)',
      style: {
        color: 'var(--text-primary)'
      }
    },
    credits: {
      enabled: false
    }
  };

  combinedChartOptions: Highcharts.Options = {
    ...this.chartDefaults,
    title: {
      text: 'Évolution Financière',
      style: {
        color: 'var(--text-primary)'
      }
    },
    yAxis: [{
      ...this.chartDefaults.yAxis,
      title: {
        text: 'Montant (€)',
        style: {
          color: 'var(--text-primary)'
        }
      }
    }, {
      opposite: true,
      title: {
        text: 'Trésorerie (€)',
        style: {
          color: 'var(--text-primary)'
        }
      }
    }],
    series: [{
      type: 'line',
      name: 'CA',
      data: [],
      color: 'var(--accent-primary)'
    }, {
      type: 'line',
      name: 'Charges',
      data: [],
      color: '#f44336'
    }, {
      type: 'area',
      name: 'Marge',
      data: [],
      color: 'rgba(76, 175, 80, 0.3)',
      fillOpacity: 0.3
    }, {
      type: 'line',
      name: 'Trésorerie',
      data: [],
      yAxis: 1,
      color: '#ffd700'
    }]
  };

  constructor(private fb: FormBuilder) {
    this.forecastForm = this.fb.group({
      montantRevenu: [10000],
      croissanceRevenu: [5],
      montantCharge: [7000],
      croissanceCharge: [3]
    });
  }

  ngOnInit() {
    this.updatePrevision();
    this.forecastForm.valueChanges.subscribe(() => {
      this.updatePrevision();
    });
  }

  changePeriod(period: 'mois' | 'trimestre' | 'semestre' | 'annee') {
    this.selectedPeriod = period;
    this.updatePrevision();
  }

  private updatePrevision() {
    const montantRevenu = this.forecastForm.get('montantRevenu')?.value || 0;
    const croissanceRevenu = this.forecastForm.get('croissanceRevenu')?.value || 0;
    const montantCharge = this.forecastForm.get('montantCharge')?.value || 0;
    const croissanceCharge = this.forecastForm.get('croissanceCharge')?.value || 0;
    
    let periods: number;
    let labels: string[];
    
    switch (this.selectedPeriod) {
      case 'mois':
        periods = 12;
        labels = Array.from({length: periods}, (_, i) => `M${i + 1}`);
        break;
      case 'trimestre':
        periods = 4;
        labels = ['T1', 'T2', 'T3', 'T4'];
        break;
      case 'semestre':
        periods = 2;
        labels = ['S1', 'S2'];
        break;
      case 'annee':
        periods = 1;
        labels = ['Année'];
        break;
      default:
        periods = 12;
        labels = Array.from({length: periods}, (_, i) => `M${i + 1}`);
    }

    const revenueData = this.calculateForecast(montantRevenu, croissanceRevenu, periods);
    const expenseData = this.calculateForecast(montantCharge, croissanceCharge, periods);
    const marginData = revenueData.map((rev, i) => rev - expenseData[i]);
    
    // Calcul des données financières
    this.totalRevenue = revenueData[revenueData.length - 1];
    this.totalExpense = expenseData[expenseData.length - 1];
    this.netResult = this.totalRevenue - this.totalExpense;
    this.marginPercentage = (this.netResult / this.totalRevenue) * 100;
    
    // Calcul de la croissance
    this.revenueGrowth = ((revenueData[revenueData.length - 1] - revenueData[0]) / revenueData[0]) * 100;
    this.expenseGrowth = ((expenseData[expenseData.length - 1] - expenseData[0]) / expenseData[0]) * 100;
    
    // Calcul de la trésorerie et du BFR
    const cashFlowData = this.calculateCashFlow(revenueData, expenseData);
    this.cashFlow = cashFlowData[cashFlowData.length - 1];
    this.workingCapital = this.calculateWorkingCapital(this.totalRevenue, this.totalExpense);

    // Calcul des ratios financiers
    this.profitability = (this.netResult / this.totalRevenue) * 100;
    this.solvencyRatio = this.totalRevenue / this.totalExpense;
    this.liquidityRatio = this.cashFlow / this.totalExpense;
    this.financialAutonomy = this.netResult / this.totalRevenue;
    
    this.forecastDetails = labels.map((period, index) => {
      const revenue = revenueData[index];
      const expense = expenseData[index];
      const result = revenue - expense;
      const margin = (result / revenue) * 100;
      const cashFlow = cashFlowData[index];
      const workingCapital = this.calculateWorkingCapital(revenue, expense);
      const prevResult = index > 0 ? revenueData[index - 1] - expenseData[index - 1] : result;
      const evolution = index > 0 ? ((result - prevResult) / Math.abs(prevResult)) * 100 : 0;
      
      return {
        period,
        revenue,
        expense,
        result,
        margin,
        evolution,
        cashFlow,
        workingCapital
      };
    });

    this.combinedChartOptions = {
      ...this.combinedChartOptions,
      xAxis: {
        ...this.combinedChartOptions.xAxis,
        categories: labels
      },
      series: [{
        type: 'line',
        name: 'CA',
        data: revenueData,
        color: 'var(--accent-primary)'
      }, {
        type: 'line',
        name: 'Charges',
        data: expenseData,
        color: '#f44336'
      }, {
        type: 'area',
        name: 'Marge',
        data: marginData,
        color: 'rgba(76, 175, 80, 0.3)',
        fillOpacity: 0.3
      }, {
        type: 'line',
        name: 'Trésorerie',
        data: cashFlowData,
        yAxis: 1,
        color: '#ffd700'
      }]
    };
  }

  private calculateForecast(montantInitial: number, tauxCroissance: number, periods: number): number[] {
    const forecast: number[] = [];
    let currentAmount = montantInitial;
    
    for (let i = 0; i < periods; i++) {
      forecast.push(Math.round(currentAmount));
      currentAmount *= (1 + tauxCroissance / 100);
    }
    
    return forecast;
  }

  private calculateCashFlow(revenues: number[], expenses: number[]): number[] {
    let cumulativeCashFlow = 0;
    return revenues.map((revenue, index) => {
      const expense = expenses[index];
      cumulativeCashFlow += revenue - expense;
      return Math.round(cumulativeCashFlow);
    });
  }

  private calculateWorkingCapital(revenue: number, expense: number): number {
    // Estimation simplifiée du BFR
    const clientsDelay = 30; // 30 jours de délai client moyen
    const suppliersDelay = 45; // 45 jours de délai fournisseur moyen
    const stockDays = 15; // 15 jours de stock moyen

    const clientsCredit = (revenue / 365) * clientsDelay;
    const suppliersCredit = (expense / 365) * suppliersDelay;
    const stockValue = (expense / 365) * stockDays;

    return Math.round(clientsCredit + stockValue - suppliersCredit);
  }
}