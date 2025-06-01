import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { selectSelectedCompany } from '../../features/company/store/company.selectors';
import { Observable, map } from 'rxjs';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
  active: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isExpanded = true;
  menuItems$: Observable<MenuItem[]>;

  constructor(private store: Store<AppState>) {
    this.menuItems$ = this.store.select(selectSelectedCompany).pipe(
      map(selectedCompany => [
        { title: 'Société', icon: 'bi bi-building', link: '/companies', active: false },
        ...(selectedCompany ? [
          { 
            title: 'Comptabilité', 
            icon: 'bi bi-journal-text', 
            link: '', 
            active: false,
            children: [
              { title: 'Tableau de bord', icon: 'bi bi-speedometer2', link: '/dashboard', active: false },
              { title: 'Transactions', icon: 'bi bi-arrow-left-right', link: '/transactions', active: false },
              { title: 'Compte', icon: 'bi bi-calculator', link: '/accounting', active: false },   
              { title: 'Grand Livre', icon: 'bi bi-book', link: '/ledger', active: false },
              { title: 'Balance', icon: 'bi bi-bar-chart', link: '/balance', active: false },
              { title: 'Compte de Résultat', icon: 'bi bi-graph-up', link: '/resultat', active: false },
              { title: 'Bilan', icon: 'bi bi-file-earmark-text', link: '/bilan', active: false },
              { title: 'Prévisions', icon: 'bi bi-graph-up-arrow', link: '/forecast', active: false }
            ]
          }
        ] : [])
      ])
    );
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleMenuItem(item: MenuItem) {
    item.active = !item.active;
  }
}
