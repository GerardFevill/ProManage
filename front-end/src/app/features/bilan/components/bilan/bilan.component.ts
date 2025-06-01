import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectSelectedCompany } from '../../../../features/company/store/company.selectors';
import { selectSelectedFiscalYear } from '../../../../features/fiscal-year/store/fiscal-year.selectors';
import { AppState } from '../../../../store/index';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { DataTableComponent, DataTableColumn } from '../../../../shared/components/data-table/data-table.component';
import { FiscalYear } from '../../../fiscal-year/models/fiscal-year.interface';
import { Company } from '../../../company/models/company.interface';
import { BilanComparison, BilanRow } from '../../models/bilan.model';
import { BilanService } from '../../services/bilan.service';

@Component({
  selector: 'app-bilan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DataTableComponent],
  templateUrl: './bilan.component.html',
  styleUrls: ['./bilan.component.scss']
})
export class BilanComponent implements OnInit, OnDestroy {
  private bilanService = inject(BilanService);
  private store = inject(Store<AppState>);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  loading = false;
  error: string | null = null;
  bilanComparison: BilanComparison | null = null;
  companies: Company[] = [];
  fiscalYears: FiscalYear[] = [];
  selectedCompanyId: string | null = null;
  selectedFiscalYearId: string | null = null;
  actifRows: BilanRow[] = [];
  passifRows: BilanRow[] = [];

  filterForm: FormGroup = this.fb.group({
    date: [''],
    previousDate: ['']
  });

  columns: DataTableColumn[] = [
    { key: 'category', label: 'Catégorie' },
    { key: 'currentAmount', label: 'Montant actuel', pipe: 'amount' },
    { key: 'previousAmount', label: 'Montant précédent', pipe: 'amount' },
    { key: 'variation', label: 'Variation', pipe: 'amount' }
  ];

  getRowClass(row: BilanRow): string {
    if (row.isHeader) return 'fw-bold bg-light';
    if (row.isGrandTotal) return 'fw-bold fs-5 bg-primary bg-opacity-10';
    if (row.isTotal) return 'fw-bold bg-secondary bg-opacity-10';
    return '';
  }

  ngOnInit() {
    combineLatest([
      this.store.select(selectSelectedCompany),
      this.store.select(selectSelectedFiscalYear)
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([company, fiscalYear]) => {
      if (company && company.id && fiscalYear && fiscalYear.id)  {
        this.selectedCompanyId = company.id.toString();
        this.selectedFiscalYearId = fiscalYear.id.toString();
        this.getBilanComparison(company.id, fiscalYear.id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getBilanComparison(companyId: number, fiscalYearId: number) {
    this.loading = true;
    this.error = null;
    this.bilanService.getBilanComparison(companyId, fiscalYearId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bilan) => {
          this.bilanComparison = bilan;
          this.transformBilanToRows(bilan);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Une erreur est survenue lors du chargement du bilan.';
          this.loading = false;
        }
      });
  }

  private transformBilanToRows(bilan: BilanComparison) {
    // Transform Actif data
    this.actifRows = [
      { 
        category: 'IMMOBILISATIONS', 
        isHeader: true,
        currentAmount: null,
        previousAmount: null,
        variation: null
      },
      { 
        category: 'Incorporelles', 
        currentAmount: bilan.current.actif.immobilisations.incorporelles,
        previousAmount: bilan.previous.actif.immobilisations.incorporelles,
        variation: bilan.current.actif.immobilisations.incorporelles - bilan.previous.actif.immobilisations.incorporelles
      },
      { 
        category: 'Corporelles', 
        currentAmount: bilan.current.actif.immobilisations.corporelles,
        previousAmount: bilan.previous.actif.immobilisations.corporelles,
        variation: bilan.current.actif.immobilisations.corporelles - bilan.previous.actif.immobilisations.corporelles
      },
      { 
        category: 'Financières', 
        currentAmount: bilan.current.actif.immobilisations.financieres,
        previousAmount: bilan.previous.actif.immobilisations.financieres,
        variation: bilan.current.actif.immobilisations.financieres - bilan.previous.actif.immobilisations.financieres
      },
      { 
        category: 'Total Immobilisations', 
        currentAmount: bilan.current.actif.immobilisations.total,
        previousAmount: bilan.previous.actif.immobilisations.total,
        variation: bilan.current.actif.immobilisations.total - bilan.previous.actif.immobilisations.total,
        isTotal: true
      },
      { 
        category: 'ACTIF CIRCULANT', 
        isHeader: true,
        currentAmount: null,
        previousAmount: null,
        variation: null
      },
      { 
        category: 'Stocks', 
        currentAmount: bilan.current.actif.actifCirculant.stocks,
        previousAmount: bilan.previous.actif.actifCirculant.stocks,
        variation: bilan.current.actif.actifCirculant.stocks - bilan.previous.actif.actifCirculant.stocks
      },
      { 
        category: 'Clients', 
        currentAmount: bilan.current.actif.actifCirculant.clients,
        previousAmount: bilan.previous.actif.actifCirculant.clients,
        variation: bilan.current.actif.actifCirculant.clients - bilan.previous.actif.actifCirculant.clients
      },
      { 
        category: 'État', 
        currentAmount: bilan.current.actif.actifCirculant.etat,
        previousAmount: bilan.previous.actif.actifCirculant.etat,
        variation: bilan.current.actif.actifCirculant.etat - bilan.previous.actif.actifCirculant.etat
      },
      { 
        category: 'Total Actif Circulant', 
        currentAmount: bilan.current.actif.actifCirculant.total,
        previousAmount: bilan.previous.actif.actifCirculant.total,
        variation: bilan.current.actif.actifCirculant.total - bilan.previous.actif.actifCirculant.total,
        isTotal: true
      },
      { 
        category: 'TRÉSORERIE', 
        isHeader: true,
        currentAmount: null,
        previousAmount: null,
        variation: null
      },
      { 
        category: 'Banques', 
        currentAmount: bilan.current.actif.tresorerie.banques,
        previousAmount: bilan.previous.actif.tresorerie.banques,
        variation: bilan.current.actif.tresorerie.banques - bilan.previous.actif.tresorerie.banques
      },
      { 
        category: 'Caisse', 
        currentAmount: bilan.current.actif.tresorerie.caisse,
        previousAmount: bilan.previous.actif.tresorerie.caisse,
        variation: bilan.current.actif.tresorerie.caisse - bilan.previous.actif.tresorerie.caisse
      },
      { 
        category: 'Total Trésorerie', 
        currentAmount: bilan.current.actif.tresorerie.total,
        previousAmount: bilan.previous.actif.tresorerie.total,
        variation: bilan.current.actif.tresorerie.total - bilan.previous.actif.tresorerie.total,
        isTotal: true
      },
      { 
        category: 'TOTAL ACTIF', 
        currentAmount: bilan.current.actif.total,
        previousAmount: bilan.previous.actif.total,
        variation: bilan.current.actif.total - bilan.previous.actif.total,
        isGrandTotal: true
      }
    ];

    // Transform Passif data
    this.passifRows = [
      { 
        category: 'CAPITAUX PROPRES', 
        isHeader: true,
        currentAmount: null,
        previousAmount: null,
        variation: null
      },
      { 
        category: 'Capital', 
        currentAmount: bilan.current.passif.capitauxPropres.capital,
        previousAmount: bilan.previous.passif.capitauxPropres.capital,
        variation: bilan.current.passif.capitauxPropres.capital - bilan.previous.passif.capitauxPropres.capital
      },
      { 
        category: 'Résultat', 
        currentAmount: bilan.current.passif.capitauxPropres.resultat,
        previousAmount: bilan.previous.passif.capitauxPropres.resultat,
        variation: bilan.current.passif.capitauxPropres.resultat - bilan.previous.passif.capitauxPropres.resultat
      },
      { 
        category: 'Total Capitaux Propres', 
        currentAmount: bilan.current.passif.capitauxPropres.total,
        previousAmount: bilan.previous.passif.capitauxPropres.total,
        variation: bilan.current.passif.capitauxPropres.total - bilan.previous.passif.capitauxPropres.total,
        isTotal: true
      },
      { 
        category: 'DETTES', 
        isHeader: true,
        currentAmount: null,
        previousAmount: null,
        variation: null
      },
      { 
        category: 'Emprunts', 
        currentAmount: bilan.current.passif.dettes.emprunts,
        previousAmount: bilan.previous.passif.dettes.emprunts,
        variation: bilan.current.passif.dettes.emprunts - bilan.previous.passif.dettes.emprunts
      },
      { 
        category: 'Fournisseurs', 
        currentAmount: bilan.current.passif.dettes.fournisseurs,
        previousAmount: bilan.previous.passif.dettes.fournisseurs,
        variation: bilan.current.passif.dettes.fournisseurs - bilan.previous.passif.dettes.fournisseurs
      },
      { 
        category: 'État', 
        currentAmount: bilan.current.passif.dettes.etat,
        previousAmount: bilan.previous.passif.dettes.etat,
        variation: bilan.current.passif.dettes.etat - bilan.previous.passif.dettes.etat
      },
      { 
        category: 'Total Dettes', 
        currentAmount: bilan.current.passif.dettes.total,
        previousAmount: bilan.previous.passif.dettes.total,
        variation: bilan.current.passif.dettes.total - bilan.previous.passif.dettes.total,
        isTotal: true
      },
      { 
        category: 'TOTAL PASSIF', 
        currentAmount: bilan.current.passif.total,
        previousAmount: bilan.previous.passif.total,
        variation: bilan.current.passif.total - bilan.previous.passif.total,
        isGrandTotal: true
      }
    ];
  }

  loadBilan() {
    this.getBilanComparison(parseInt(this.selectedCompanyId!), parseInt(this.selectedFiscalYearId!));
  }
}
