import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DarkTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  pipe?: string;
  pipeArgs?: any[];
  align?: 'left' | 'center' | 'right';
  width?: string;
  cellTemplate?: TemplateRef<any>;
}

export interface DarkTableAction {
  label: string;
  icon: string;
  action: (item: any) => void;
  visible?: (item: any) => boolean;
  tooltip?: string;
  btnClass?: string;
}

@Component({
  selector: 'app-dark-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dark-data-table.component.html',
  styleUrls: ['./dark-data-table.component.scss']
})
export class DarkDataTableComponent {
  @Input() columns: DarkTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() actions: DarkTableAction[] = [];
  @Input() showActions = true;
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() rowClass?: (item: any) => string;
  @Input() emptyMessage = 'Aucune donnée disponible';
  @Input() striped = true;
  @Input() hoverable = true;
  @Input() sortable = true;
  @Input() sortField: string | null = null;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() showSearch = false;
  @Input() searchPlaceholder = 'Rechercher...';
  @Input() darkRows = false; // Option pour avoir des lignes en mode sombre
  
  @Output() sort = new EventEmitter<{field: string, direction: 'asc' | 'desc'}>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  
  searchTerm = '';

  constructor() {}

  isActionVisible(action: DarkTableAction, item: any): boolean {
    return action.visible ? action.visible(item) : true;
  }

  getColumnAlignment(column: DarkTableColumn): string {
    if (column.align === 'right') return 'text-end';
    if (column.align === 'center') return 'text-center';
    return '';
  }

  getRowClasses(item: any): string {
    let classes = '';
    
    if (this.rowClass) {
      classes += this.rowClass(item);
    }
    
    return classes;
  }

  onSortClick(column: DarkTableColumn): void {
    if (!column.sortable || !this.sortable) return;
    
    const field = column.key;
    let direction: 'asc' | 'desc' = 'asc';
    
    if (this.sortField === field) {
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    this.sortField = field;
    this.sortDirection = direction;
    this.sort.emit({ field, direction });
  }

  getSortIcon(column: DarkTableColumn): string {
    if (!column.sortable || !this.sortable) return '';
    
    if (this.sortField !== column.key) {
      return 'bi-arrow-down-up';
    }
    
    return this.sortDirection === 'asc' ? 'bi-sort-down-alt' : 'bi-sort-up-alt';
  }

  onSearchChange(): void {
    this.search.emit(this.searchTerm);
  }

  applyPipe(value: any, pipe?: string, pipeArgs?: any[]): any {
    if (!pipe) return value;
    
    switch (pipe) {
      case 'date':
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      case 'datetime':
        const dateTime = new Date(value);
        const d = dateTime.getDate().toString().padStart(2, '0');
        const m = (dateTime.getMonth() + 1).toString().padStart(2, '0');
        const y = dateTime.getFullYear();
        const h = dateTime.getHours().toString().padStart(2, '0');
        const min = dateTime.getMinutes().toString().padStart(2, '0');
        return `${d}/${m}/${y} ${h}:${min}`;
      case 'currency':
        return new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: pipeArgs?.[0] || 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
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
