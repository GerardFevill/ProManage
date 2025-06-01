import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, of } from 'rxjs';
import { map, map as rxMap, filter } from 'rxjs/operators';
import { DashboardActions } from '../../store/dashboard.actions';
import * as DashboardSelectors from '../../store/dashboard.selectors';
import { DashboardState } from '../../store/dashboard.state';
import { StatItem, StatsCardComponent } from '../stats-card/stats-card.component';
import { BankAccount } from '../../models/dashboard.interface';
import { selectSelectedCompany } from '../../../company/store/company.selectors';
import { selectSelectedFiscalYear } from '../../../fiscal-year/store/fiscal-year.selectors';
import { FinancialTrendsComponent } from '../financial-trends/financial-trends.component';
// NgClass est déjà inclus via CommonModule
import { TreasuryViewComponent } from '../treasury-view/treasury-view.component';
import { FinancialSummaryComponent } from '../financial-summary/financial-summary.component';
import { FinancialGoalsComponent } from '../financial-goals/financial-goals.component';
import { DashboardAlertsComponent } from '../dashboard-alerts/dashboard-alerts.component';
import { PaymentScheduleComponent } from '../payment-schedule/payment-schedule.component';
import { BudgetTrackingComponent } from '../budget-tracking/budget-tracking.component';
import { AccountingReportsComponent } from '../accounting-reports/accounting-reports.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardComponent, 
    FinancialTrendsComponent,
    TreasuryViewComponent,
    FinancialSummaryComponent,
    FinancialGoalsComponent,
    DashboardAlertsComponent,
    PaymentScheduleComponent,
    BudgetTrackingComponent,
    AccountingReportsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  bankAccounts$: Observable<StatItem[]>;
  bankAccountStats$: Observable<any[]>;

  constructor(private store: Store<DashboardState>) {
    this.bankAccounts$ = of([]);
    this.bankAccountStats$ = of([]);
  }

  ngOnInit(): void {
    // Charger les données du tableau de bord
    this.loadBankAccountData();
    
    // Transformer les données des comptes bancaires pour les cartes de statistiques
    this.bankAccounts$ = this.store.select(DashboardSelectors.selectBankAccounts).pipe(
      rxMap(accounts => accounts.map(account => ({
        label: account.name,
        value: account.balance
      })))
    );

    // Préparation des données pour les cartes de statistiques (données locales ProManage)
    this.bankAccountStats$ = this.store.select(DashboardSelectors.selectBankAccounts).pipe(
      rxMap(accounts => {
        // Calculer le total des comptes bancaires
        const totalBalance = accounts.reduce((sum, account) => sum + this.formatBalance(account.balance), 0);
        
        // Créer les cartes de statistiques
        return [
          {
            title: 'Comptes Bancaires',
            value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalBalance),
            icon: 'bank',
            items: accounts.map(account => ({
              label: account.name,
              value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(this.formatBalance(account.balance))
            }))
          },
          {
            title: 'Factures en attente',
            value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(12500 - 8200),
            icon: 'receipt',
            items: [
              { label: 'Clients', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(12500) },
              { label: 'Fournisseurs', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(-8200) }
            ]
          },
          {
            title: 'Transactions récentes',
            value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(5600 - 3200),
            icon: 'arrow-left-right',
            items: [
              { label: 'Entrées', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(5600) },
              { label: 'Sorties', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(-3200) }
            ]
          },
          {
            title: 'Prévisions',
            value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalBalance * 1.2),
            icon: 'graph-up',
            items: [
              { label: 'Fin du mois', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalBalance * 1.2) },
              { label: 'Fin du trimestre', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalBalance * 1.4) }
            ]
          }
        ];
      })
    );
  }

  /**
   * Exporte les données du tableau de bord au format PDF
   */
  exportDashboard(): void {
    console.log('Exportation du tableau de bord au format PDF');
    // Implémentation à venir
  }
  
  /**
   * Crée une nouvelle transaction
   */
  createNewTransaction(): void {
    console.log('Création d\'une nouvelle transaction');
    // Implémentation à venir
  }
  
  /**
   * Charge les données des comptes bancaires en fonction de l'entreprise et de l'année fiscale sélectionnées
   */
  loadBankAccountData(): void {
    combineLatest([
      this.store.select(selectSelectedCompany),
      this.store.select(selectSelectedFiscalYear)
    ]).pipe(
      filter(([company, fiscalYear]) => !!company && !!fiscalYear && !!company.id && !!fiscalYear.id)
    ).subscribe(([company, fiscalYear]) => {
      if (company && company.id && fiscalYear && fiscalYear.id) {
        this.store.dispatch(
          DashboardActions.loadBankAccounts({
            companyId: company.id!,
            fiscalYearId: fiscalYear.id!
          })
        );
      }
    });
  }

  formatBalance(balance: string | number): number {
    if (typeof balance === 'string') {
      return parseFloat(balance || '0');
    }
    return balance || 0;
  }
}