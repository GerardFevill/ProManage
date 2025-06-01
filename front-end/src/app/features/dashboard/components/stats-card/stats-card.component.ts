import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmountColorDirective } from '../../../../shared/directives/amount-color.directive';
import { AmountPipe } from '../../../../shared/pipes/amount.pipe';

export interface StatItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, AmountColorDirective,AmountPipe],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() cardClass: string = '';
  @Input() stats: StatItem[] = [];
  @Input() value: string = '';
  @Input() items: any[] = [];
  isExpanded: boolean = false;

  get iconClass(): string {
    return `bi-${this.icon}`;
  }

  get total(): number {
    if (!this.stats?.length) return 0;
    return this.stats.reduce((sum, item) => {
      const value = Number(item?.value) || 0;
      return sum + value;
    }, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: value % 1 === 0 ? 0 : 2
    }).format(value);
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
