import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-delete-dialog.component.html',
  styleUrls: ['./transaction-delete-dialog.component.scss']
})
export class TransactionDeleteDialogComponent {
  @Input() transactionReference: string = '';
  @Input() transactionDate: Date = new Date();
  @Input() transactionAmount: number = 0;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
