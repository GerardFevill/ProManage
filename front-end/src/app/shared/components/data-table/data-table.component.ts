import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmountPipe } from '../../pipes/amount.pipe';

export interface DataTableColumn {
  key: string;
  label: string;
  pipe?: string;
  pipeArgs?: any[];
}

export interface DataTableAction {
  label: string;
  icon?: string;
  action: (item: any) => void;
  visible?: (item: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, AmountPipe],
  providers: [AmountPipe],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() actions: DataTableAction[] = [];
  @Input() showActions = true;
  @Input() actionsTemplate?: TemplateRef<any>;

  constructor(private amountPipe: AmountPipe) {}

  isActionVisible(action: DataTableAction, item: any): boolean {
    return action.visible ? action.visible(item) : true;
  }

  isPositive(value: any): boolean {
    if (typeof value !== 'number') return false;
    return value > 0;
  }

  isNegative(value: any): boolean {
    if (typeof value !== 'number') return false;
    return value < 0;
  }

  applyPipe(value: any, pipe?: string, pipeArgs?: any[]): any {
    if (!pipe) return value;
    
    switch (pipe) {
      case 'date':
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case 'amount':
        return this.amountPipe.transform(value);
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(value);
      case 'uppercase':
        return value?.toUpperCase();
      case 'lowercase':
        return value?.toLowerCase();
      default:
        return value;
    }
  }
}
