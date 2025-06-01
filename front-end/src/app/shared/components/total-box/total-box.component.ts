import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-total-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './total-box.component.html',
  styleUrls: ['./total-box.component.scss']
})
export class TotalBoxComponent {
  @Input() label: string = '';
  @Input() amount: number = 0;
  @Input() icon: string = 'bi-info-circle';
  @Input() iconColor: string = '#2196F3';
  @Input() type: 'default' | 'warning' | 'danger' | 'success' = 'default';
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
