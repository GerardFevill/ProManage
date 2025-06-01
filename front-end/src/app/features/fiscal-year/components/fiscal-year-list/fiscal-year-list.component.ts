import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, finalize } from 'rxjs';
import { FiscalYear } from '../../models/fiscal-year.interface';
import { FiscalYearService } from '../../services/fiscal-year.service';
import { FiscalYearCardFullComponent } from '../fiscal-year-card-full/fiscal-year-card-full.component';
import { Company } from '../../../company/models/company.interface';

@Component({
  selector: 'app-fiscal-year-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FiscalYearCardFullComponent],
  templateUrl: './fiscal-year-list.component.html',
  styleUrls: ['./fiscal-year-list.component.scss']
})
export class FiscalYearListComponent implements OnInit {
  @Input() fiscalYears?: FiscalYear[];
  @Input() company?: Company;
  @Input() compactMode = false;
  
  companyId!: number;
  fiscalYears$ = new BehaviorSubject<FiscalYear[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  deleting$ = new BehaviorSubject<{ [key: number]: boolean }>({});

  constructor(
    private fiscalYearService: FiscalYearService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Cas 1: Années fiscales passées directement
    if (this.fiscalYears) {
      this.fiscalYears$.next(this.fiscalYears);
      return;
    }
    
    // Cas 2: Objet company passé
    if (this.company && this.company.id) {
      this.companyId = this.company.id;
      
      // Si la company a déjà des années fiscales, les utiliser
      if (this.company.fiscalYears && this.company.fiscalYears.length > 0) {
        this.fiscalYears$.next(this.company.fiscalYears);
        return;
      }
      
      // Sinon, charger les années fiscales
      this.loadFiscalYears();
      return;
    }
    
    // Cas 3: Utiliser l'ID de la route (comportement original)
    const id = this.route.snapshot.parent?.paramMap.get('id');
    if (id) {
      this.companyId = +id;
      this.loadFiscalYears();
    } else {
      console.error('No company ID or fiscal years provided');
      this.error$.next('Aucune information sur les années fiscales disponible');
    }
  }

  private loadFiscalYears(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.fiscalYearService.getFiscalYears(this.companyId).subscribe({
      next: (fiscalYears) => {
        console.log('Received fiscal years:', fiscalYears);
        this.fiscalYears$.next(fiscalYears);
        this.loading$.next(false);
      },
      error: (error) => {
        console.error('Error loading fiscal years:', error);
        this.error$.next(error.message || 'Erreur lors du chargement des années fiscales');
        this.loading$.next(false);
      }
    });
  }

  onDelete(fiscalYear: FiscalYear): void {
    if (!fiscalYear.id) return;

    // Mettre à jour l'état de suppression
    const currentDeleting = this.deleting$.value;
    this.deleting$.next({ ...currentDeleting, [fiscalYear.id]: true });

    this.fiscalYearService.deleteFiscalYear(fiscalYear.id)
      .pipe(
        finalize(() => {
          const updatedDeleting = this.deleting$.value;
          delete updatedDeleting[fiscalYear.id!];
          this.deleting$.next(updatedDeleting);
        })
      )
      .subscribe({
        next: () => {
          // Mettre à jour la liste des années fiscales
          const currentFiscalYears = this.fiscalYears$.value;
          this.fiscalYears$.next(
            currentFiscalYears.filter(fy => fy.id !== fiscalYear.id)
          );
        },
        error: (error) => {
          this.error$.next(error.message || 'Erreur lors de la suppression de l\'année fiscale');
        }
      });
  }

  trackById(index: number, fiscalYear: FiscalYear): number {
    return fiscalYear.id || index;
  }
}
