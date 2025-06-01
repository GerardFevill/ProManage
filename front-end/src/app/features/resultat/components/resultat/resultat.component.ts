import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResultatService, ResultatResponse } from '../../services/resultat.service';
import { Store } from '@ngrx/store';
import { selectSelectedCompany } from '../../../../features/company/store/company.selectors';
import { selectSelectedFiscalYear } from '../../../../features/fiscal-year/store/fiscal-year.selectors';
import { AppState } from '../../../../store/index';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { FiscalYear } from '../../../../features/fiscal-year/models/fiscal-year.interface';

interface ResultatItem {
  accountId: number;
  accountName: string;
  montantN: number;
  montantN1: number;
  level: number;
}

interface ResultatSection {
  title: string;
  items: ResultatItem[];
  total: {
    montantN: number;
    montantN1: number;
  };
}

@Component({
  selector: 'app-resultat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  templateUrl: './resultat.component.html',
  styleUrls: ['./resultat.component.scss']
})
export class ResultatComponent implements OnInit, OnDestroy {
  private resultatService = inject(ResultatService);
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();

  filterForm!: FormGroup;
  produits: ResultatSection[] = [];
  charges: ResultatSection[] = [];
  loading = false;
  error: string | null = null;

  // Propriétés pour les résultats
  resultatExploitation = { montantN: 0, montantN1: 0 };
  resultatFinancier = { montantN: 0, montantN1: 0 };
  resultatExceptionnel = { montantN: 0, montantN1: 0 };
  resultatNet = { montantN: 0, montantN1: 0 };

  // Colonnes pour les tableaux
  columns: any[] = [
    { key: 'accountName', label: 'Libellé' },
    { key: 'montantN', label: 'Exercice N', pipe: 'amount' },
    { key: 'montantN1', label: 'Exercice N-1', pipe: 'amount' }
  ];

  // Données formatées pour les tableaux
  produitsTableData: any[] = [];
  chargesTableData: any[] = [];
  resultatsTableData: any[] = [];

  ngOnInit() {
    this.initForm();
    this.loadInitialData();

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadResultats();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    // On va utiliser le fiscal year sélectionné pour initialiser les dates
    this.store.select(selectSelectedFiscalYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe((fiscalYear: FiscalYear | null) => {
        if (fiscalYear) {
          // Récupérer l'exercice fiscal précédent
          this.store.select(state => state.fiscalYear.fiscalYears)
            .pipe(takeUntil(this.destroy$))
            .subscribe(fiscalYears => {
              // Trouver l'exercice fiscal précédent
              const previousFiscalYear = fiscalYears.find((fy: FiscalYear) => 
                new Date(fy.endDate) < new Date(fiscalYear.startDate) &&
                fy.status === 'closed'
              );

              this.filterForm = this.fb.group({
                dateDebut: [this.formatDate(new Date(fiscalYear.startDate))],
                dateFin: [this.formatDate(new Date(fiscalYear.endDate))],
                dateDebutN1: [this.formatDate(new Date(previousFiscalYear?.startDate || fiscalYear.startDate))],
                dateFinN1: [this.formatDate(new Date(previousFiscalYear?.endDate || fiscalYear.endDate))]
              });
            });
        } else {
          // Si pas d'exercice fiscal sélectionné, utiliser l'année en cours
          const currentDate = new Date();
          const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
          const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);

          this.filterForm = this.fb.group({
            dateDebut: [this.formatDate(firstDayOfYear)],
            dateFin: [this.formatDate(lastDayOfYear)],
            dateDebutN1: [this.formatDate(new Date(firstDayOfYear.getFullYear() - 1, 0, 1))],
            dateFinN1: [this.formatDate(new Date(lastDayOfYear.getFullYear() - 1, 11, 31))]
          });
        }
      });
  }

  private loadInitialData() {
    this.loadResultats();
  }

  private loadResultats() {
    if (this.filterForm.valid) {
      const values = this.filterForm.value;
      this.loading = true;
      this.error = null;

      this.store.select(selectSelectedCompany)
        .pipe(takeUntil(this.destroy$))
        .subscribe(company => {
          if (!company?.id) {
            this.error = 'Aucune entreprise sélectionnée';
            this.loading = false;
            return;
          }

          this.resultatService
            .getResultatsByPeriod(
              values.dateDebut,
              values.dateFin,
              company.id,
              values.dateDebutN1,
              values.dateFinN1
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data: ResultatResponse) => {
                const formattedData = this.resultatService.formatResultatsForDisplay(data);
                this.produits = formattedData.produits;
                this.charges = formattedData.charges;
                this.calculateResultats();
                this.formatTableData();
                this.loading = false;
              },
              error: (err) => {
                console.error('Erreur lors du chargement des résultats:', err);
                this.error = 'Erreur lors du chargement des résultats. Veuillez réessayer.';
                this.loading = false;
              }
            });
        });
    }
  }

  private formatTableData() {
    // Formater les données des produits
    this.produitsTableData = this.produits.flatMap(section => [
      { accountName: section.title, montantN: null, montantN1: null, isHeader: true },
      ...section.items,
      { accountName: `Total ${section.title}`, montantN: section.total.montantN, montantN1: section.total.montantN1, isTotal: true }
    ]);
    this.produitsTableData.push({
      accountName: 'TOTAL PRODUITS',
      montantN: this.getTotalProduits('N'),
      montantN1: this.getTotalProduits('N1'),
      isFinalTotal: true
    });

    // Formater les données des charges
    this.chargesTableData = this.charges.flatMap(section => [
      { accountName: section.title, montantN: null, montantN1: null, isHeader: true },
      ...section.items,
      { accountName: `Total ${section.title}`, montantN: section.total.montantN, montantN1: section.total.montantN1, isTotal: true }
    ]);
    this.chargesTableData.push({
      accountName: 'TOTAL CHARGES',
      montantN: this.getTotalCharges('N'),
      montantN1: this.getTotalCharges('N1'),
      isFinalTotal: true
    });

    // Formater les données des résultats
    this.resultatsTableData = [
      {
        accountName: "RÉSULTAT D'EXPLOITATION",
        montantN: this.resultatExploitation.montantN,
        montantN1: this.resultatExploitation.montantN1
      },
      {
        accountName: 'RÉSULTAT FINANCIER',
        montantN: this.resultatFinancier.montantN,
        montantN1: this.resultatFinancier.montantN1
      },
      {
        accountName: 'RÉSULTAT COURANT AVANT IMPÔTS',
        montantN: this.resultatExploitation.montantN + this.resultatFinancier.montantN,
        montantN1: this.resultatExploitation.montantN1 + this.resultatFinancier.montantN1,
        isSubTotal: true
      },
      {
        accountName: 'RÉSULTAT EXCEPTIONNEL',
        montantN: this.resultatExceptionnel.montantN,
        montantN1: this.resultatExceptionnel.montantN1
      },
      {
        accountName: 'IMPÔTS SUR LES BÉNÉFICES',
        montantN: -(this.charges.find(c => c.title === "IMPÔTS SUR LES BÉNÉFICES")?.total.montantN || 0),
        montantN1: -(this.charges.find(c => c.title === "IMPÔTS SUR LES BÉNÉFICES")?.total.montantN1 || 0),
        isNegative: true
      },
      {
        accountName: 'RÉSULTAT NET',
        montantN: this.resultatNet.montantN,
        montantN1: this.resultatNet.montantN1,
        isNet: true
      }
    ];
  }

  private calculateResultats() {
    // Calcul du résultat d'exploitation
    const produitsExploitation = this.produits.find(p => p.title === "PRODUITS D'EXPLOITATION")?.total || { montantN: 0, montantN1: 0 };
    const chargesExploitation = this.charges.find(c => c.title === "CHARGES D'EXPLOITATION")?.total || { montantN: 0, montantN1: 0 };
    this.resultatExploitation = {
      montantN: produitsExploitation.montantN - chargesExploitation.montantN,
      montantN1: produitsExploitation.montantN1 - chargesExploitation.montantN1
    };

    // Calcul du résultat financier
    const produitsFinanciers = this.produits.find(p => p.title === "PRODUITS FINANCIERS")?.total || { montantN: 0, montantN1: 0 };
    const chargesFinancieres = this.charges.find(c => c.title === "CHARGES FINANCIÈRES")?.total || { montantN: 0, montantN1: 0 };
    this.resultatFinancier = {
      montantN: produitsFinanciers.montantN - chargesFinancieres.montantN,
      montantN1: produitsFinanciers.montantN1 - chargesFinancieres.montantN1
    };

    // Calcul du résultat exceptionnel
    const produitsExceptionnels = this.produits.find(p => p.title === "PRODUITS EXCEPTIONNELS")?.total || { montantN: 0, montantN1: 0 };
    const chargesExceptionnelles = this.charges.find(c => c.title === "CHARGES EXCEPTIONNELLES")?.total || { montantN: 0, montantN1: 0 };
    this.resultatExceptionnel = {
      montantN: produitsExceptionnels.montantN - chargesExceptionnelles.montantN,
      montantN1: produitsExceptionnels.montantN1 - chargesExceptionnelles.montantN1
    };

    // Calcul du résultat courant avant impôts
    const resultatCourantN = this.resultatExploitation.montantN + this.resultatFinancier.montantN;
    const resultatCourantN1 = this.resultatExploitation.montantN1 + this.resultatFinancier.montantN1;

    // Calcul du résultat fiscal avant impôts
    const resultatFiscalN = resultatCourantN + this.resultatExceptionnel.montantN;
    const resultatFiscalN1 = resultatCourantN1 + this.resultatExceptionnel.montantN1;

    // Calcul de l'impôt sur les sociétés selon le barème français
    const calculerIS = (resultatFiscal: number) => {
      if (resultatFiscal <= 0) return 0;

      // Barème 2024 IS
      const SEUIL_PME = 42432; // 42 432€ pour 2024
      const TAUX_REDUIT = 0.15; // 15% pour les PME jusqu'à 42 432€
      const TAUX_NORMAL = 0.25; // 25% au-delà

      if (resultatFiscal <= SEUIL_PME) {
        return resultatFiscal * TAUX_REDUIT;
      } else {
        return (SEUIL_PME * TAUX_REDUIT) + ((resultatFiscal - SEUIL_PME) * TAUX_NORMAL);
      }
    };

    const impotN = calculerIS(resultatFiscalN);
    const impotN1 = calculerIS(resultatFiscalN1);

    // Mise à jour des impôts dans les charges
    const chargesImpots = this.charges.find(c => c.title === "IMPÔTS SUR LES BÉNÉFICES");
    if (chargesImpots) {
      chargesImpots.total = {
        montantN: impotN,
        montantN1: impotN1
      };
    }

    // Calcul du résultat net final
    this.resultatNet = {
      montantN: resultatFiscalN - impotN,
      montantN1: resultatFiscalN1 - impotN1
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Méthodes publiques pour les calculs de totaux
  getTotalProduits(periode: 'N' | 'N1'): number {
    return this.produits.reduce((total, section) => {
      return total + (section.total[periode === 'N' ? 'montantN' : 'montantN1'] || 0);
    }, 0);
  }

  getTotalCharges(periode: 'N' | 'N1'): number {
    return this.charges.reduce((total, section) => {
      return total + (section.total[periode === 'N' ? 'montantN' : 'montantN1'] || 0);
    }, 0);
  }

  getResultatNet(periode: 'N' | 'N1'): number {
    return periode === 'N' ? this.resultatNet.montantN : this.resultatNet.montantN1;
  }
}
