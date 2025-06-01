import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Company } from '../../models/company.interface';
import { FiscalYearCardCompactComponent } from '../fiscal-year-card-compact/fiscal-year-card-compact.component';
import { FiscalYear } from '../../../fiscal-year/models/fiscal-year.interface';

@Component({
  selector: 'app-fiscal-year-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FiscalYearCardCompactComponent],
  templateUrl: './fiscal-year-list.component.html',
  styleUrls: ['./fiscal-year-list.component.scss']
})
export class FiscalYearListComponent {
  @Input() company!: Company;

  getFilteredFiscalYears(): FiscalYear[] {
    if (!this.company) return [];
    if (!Array.isArray(this.company.fiscalYears)) return [];
    
    return this.company.fiscalYears
      .filter(fy => fy && typeof fy === 'object')
      .filter(fy => 
        fy.status?.toLowerCase() === 'active' || 
        fy.status?.toLowerCase() === 'pending'
      );
  }

  trackByFiscalYear(index: number, fiscalYear: FiscalYear): number {
    return fiscalYear.id || index;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
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
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
}
