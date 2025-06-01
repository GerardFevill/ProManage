import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fiscal-year-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiscal-year-delete-dialog.component.html',
  styleUrls: ['./fiscal-year-delete-dialog.component.scss']
})
export class FiscalYearDeleteDialogComponent {
  @Input() fiscalYearName: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
