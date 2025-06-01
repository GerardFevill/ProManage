import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FiscalYear } from '../../../fiscal-year/models/fiscal-year.interface';

@Component({
  selector: 'app-fiscal-year-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fiscal-year-card.component.html',
  styleUrls: ['./fiscal-year-card.component.scss']
})
export class FiscalYearCardComponent {
  @Input() fiscalYear!: FiscalYear;
  @Input() companyId!: number;

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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
