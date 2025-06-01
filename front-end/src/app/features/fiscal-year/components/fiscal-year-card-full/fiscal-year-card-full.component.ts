import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FiscalYear } from '../../models/fiscal-year.interface';
import { FiscalYearDeleteDialogComponent } from '../fiscal-year-delete-dialog/fiscal-year-delete-dialog.component';
import { Store } from '@ngrx/store';
import { FiscalYearActions } from '../../store/fiscal-year.actions';

@Component({
  selector: 'app-fiscal-year-card-full',
  standalone: true,
  imports: [CommonModule, RouterLink, FiscalYearDeleteDialogComponent],
  templateUrl: './fiscal-year-card-full.component.html',
  styleUrls: ['./fiscal-year-card-full.component.scss']
})
export class FiscalYearCardFullComponent {
  @Input() fiscalYear!: FiscalYear;
  @Input() companyId!: number;
  @Output() delete = new EventEmitter<void>();

  showingDeleteDialog = false;

  statusLabels: { [key: string]: string } = {
    'active': 'Actif',
    'closed': 'Clôturé',
    'pending': 'En attente'
  };

  constructor(private store: Store) {}

  selectFiscalYear() {
    if (this.fiscalYear.id !== undefined) {
      this.store.dispatch(FiscalYearActions.loadFiscalYear({ id: this.fiscalYear.id }));
    }
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  showDeleteDialog(): void {
    this.showingDeleteDialog = true;
  }

  confirmDelete(): void {
    this.showingDeleteDialog = false;
    this.delete.emit();
  }

  cancelDelete(): void {
    this.showingDeleteDialog = false;
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
}
