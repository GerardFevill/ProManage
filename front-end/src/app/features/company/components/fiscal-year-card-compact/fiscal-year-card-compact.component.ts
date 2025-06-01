import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FiscalYear } from '../../../fiscal-year/models/fiscal-year.interface';
import { FiscalYearActions } from '../../../fiscal-year/store/fiscal-year.actions';

@Component({
  selector: 'app-fiscal-year-card-compact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiscal-year-card-compact.component.html',
  styleUrls: ['./fiscal-year-card-compact.component.scss']
})
export class FiscalYearCardCompactComponent {
  @Input() fiscalYear!: FiscalYear;
  @Input() companyId!: number;

  statusLabels: { [key: string]: string } = {
    'active': 'Actif',
    'closed': 'Clôturé',
    'pending': 'En attente'
  };

  constructor(private router: Router, private store: Store) {}

  selectFiscalYear() {
    if (this.fiscalYear.id !== undefined) {
      this.store.dispatch(FiscalYearActions.loadFiscalYear({ id: this.fiscalYear.id }));
    }
  }

  onCardClick() {
    if (this.fiscalYear.id !== undefined) {
      this.router.navigate(['/companies', this.companyId, 'fiscal-years', this.fiscalYear.id]);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'closed':
        return 'status-closed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short'
    });
  }
}
