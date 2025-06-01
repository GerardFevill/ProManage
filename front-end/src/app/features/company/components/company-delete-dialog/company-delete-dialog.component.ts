import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-delete-dialog.component.html',
  styleUrls: ['./company-delete-dialog.component.scss']
})
export class CompanyDeleteDialogComponent {
  @Input() companyName: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
