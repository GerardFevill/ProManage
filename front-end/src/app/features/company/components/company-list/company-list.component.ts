import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, map, distinctUntilChanged } from 'rxjs/operators';
import { Company } from '../../models/company.interface';
import { CompanyActions } from '../../store/company.actions';
import { selectCompanies, selectCompanyLoading, selectCompanyError, selectSelectedCompany } from '../../store/company.selectors';
import { AppState } from '../../../../store';
import { CompanyDeleteDialogComponent } from '../company-delete-dialog/company-delete-dialog.component';
import { FiscalYearActions } from '../../../fiscal-year/store/fiscal-year.actions';
import { selectFiscalYears } from '../../../fiscal-year/store/fiscal-year.selectors';
import { CompanyCardComponent } from '../company-card/company-card.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CompanyDeleteDialogComponent,
    CompanyCardComponent
  ],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit, OnDestroy {
  companies$: Observable<Company[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedCompany$: Observable<Company | null>;
  showDeleteDialog = false;
  companyToDelete: Company | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.companies$ = this.store.select(selectCompanies);
    this.loading$ = this.store.select(selectCompanyLoading);
    this.error$ = this.store.select(selectCompanyError);
    this.selectedCompany$ = this.store.select(selectSelectedCompany);
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.setupFiscalYearSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFiscalYearSync(): void {
    // Observer les changements de la société sélectionnée
    this.selectedCompany$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
    ).subscribe(company => {
      if (company?.id) {
        this.store.dispatch(FiscalYearActions.loadFiscalYears({ companyId: company.id }));
      } else {
        this.store.dispatch(FiscalYearActions.clearSelectedFiscalYear());
      }
    });

    // Observer les années fiscales après leur chargement
    combineLatest([
      this.selectedCompany$,
      this.store.select(selectFiscalYears)
    ]).pipe(
      takeUntil(this.destroy$),
      filter(([company, fiscalYears]) => !!company && !!fiscalYears && fiscalYears.length > 0),
      map(([_, fiscalYears]) => fiscalYears.find(fy => fy.status === 'active'))
    ).subscribe(activeFiscalYear => {
      if (activeFiscalYear?.id) {
        this.store.dispatch(FiscalYearActions.loadFiscalYear({ id: activeFiscalYear.id }));
      }
    });
  }

  loadCompanies(): void {
    this.store.dispatch(CompanyActions.loadCompanies());
  }

  onSelect(company: Company): void {
    const companyId = company.id;
    if (companyId !== undefined) {
      this.store.dispatch(CompanyActions.loadCompany({ id: companyId }));
    }
  }

  clearSelection(): void {
    this.store.dispatch(CompanyActions.clearSelectedCompany());
    // Nettoyer aussi la sélection de l'année fiscale
    this.store.dispatch(FiscalYearActions.clearSelectedFiscalYear());
  }

  openCreateForm(): void {
    this.router.navigate(['/companies/new']);
  }

  editCompany(company: Company): void {
    if (company.id) {
      this.router.navigate(['/companies/', company.id, 'edit']);
    }
  }

  onDeleteClick(company: Company): void {
    this.companyToDelete = company;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.companyToDelete?.id) {
      this.store.dispatch(CompanyActions.deleteCompany({ id: this.companyToDelete.id }));
    }
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.companyToDelete = null;
  }
}
