import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-delete-dialog.component.html',
  styleUrls: ['./account-delete-dialog.component.scss']
})
export class AccountDeleteDialogComponent {
  @Input() accountCode?: string;
  @Input() accountName?: string;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
