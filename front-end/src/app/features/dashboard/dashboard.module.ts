import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StatsCardComponent } from './components/stats-card/stats-card.component';
import { TreasuryViewComponent } from './components/treasury-view/treasury-view.component';
import { PaymentScheduleComponent } from './components/payment-schedule/payment-schedule.component';
import { BudgetTrackingComponent } from './components/budget-tracking/budget-tracking.component';
import { FinancialTrendsComponent } from './components/financial-trends/financial-trends.component';
import { AccountingReportsComponent } from './components/accounting-reports/accounting-reports.component';
import { FinancialGoalsComponent } from './components/financial-goals/financial-goals.component';
import { DashboardAlertsComponent } from './components/dashboard-alerts/dashboard-alerts.component';
import { FinancialSummaryComponent } from './components/financial-summary/financial-summary.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StatsCardComponent,
    TreasuryViewComponent,
    PaymentScheduleComponent,
    BudgetTrackingComponent,
    FinancialTrendsComponent,
    AccountingReportsComponent,
    FinancialGoalsComponent,
    DashboardAlertsComponent,
    FinancialSummaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
