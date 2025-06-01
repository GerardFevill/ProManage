import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Company } from '../../models/company.interface';
import { FiscalYearListComponent } from '../../../fiscal-year/components/fiscal-year-list/fiscal-year-list.component';
import { CurrencyPipe } from '@angular/common';
import { PhoneFormatPipe } from '../../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FiscalYearListComponent, PhoneFormatPipe],
  templateUrl: './company-card.component.html',
  styleUrl: './company-card.component.scss',
  schemas: [NO_ERRORS_SCHEMA]
})
export class CompanyCardComponent {
  @Input() company!: Company;
  @Input() isSelected = false;
  
  @Output() select = new EventEmitter<Company>();
  @Output() edit = new EventEmitter<Company>();
  @Output() delete = new EventEmitter<Company>();

  onSelect(): void {
    this.select.emit(this.company);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.company);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.company);
  }
}
