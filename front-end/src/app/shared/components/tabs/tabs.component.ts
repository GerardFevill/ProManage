import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs">
      <button
        *ngFor="let tab of tabs"
        class="tab"
        [class.active]="tab === activeTab"
        (click)="onTabClick(tab)"
      >
        {{ tab }}
      </button>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 2px;
    }
    
    .tab {
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
      }
    }
    
    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
  `]
})
export class TabsComponent {
  @Input() tabs: string[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  onTabClick(tab: string) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  ngOnInit() {
    if (this.tabs.length > 0 && !this.activeTab) {
      this.activeTab = this.tabs[0];
    }
  }
}
