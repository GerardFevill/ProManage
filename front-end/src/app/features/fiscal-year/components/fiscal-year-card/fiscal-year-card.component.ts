import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiscalYear } from '../../models/fiscal-year.interface';

@Component({
  selector: 'app-fiscal-year-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiscal-year-card.component.html',
  styleUrls: ['./fiscal-year-card.component.scss']
})
export class FiscalYearCardComponent {
  @Input() fiscalYear!: FiscalYear;
  @Input() companyId!: number;

  private statusTranslations: { [key: string]: string } = {
    'active': 'Actif',
    'closed': 'Clôturé',
    'pending': 'En attente'
  };

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

  getStatusLabel(status: string): string {
    return this.statusTranslations[status.toLowerCase()] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { 
      year: 'numeric',
      month: 'short'
    });
  }
}
