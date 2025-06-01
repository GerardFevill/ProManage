import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardState } from '../../store/dashboard.state';
import * as DashboardSelectors from '../../store/dashboard.selectors';
import { DarkDataTableComponent, DarkTableColumn, DarkTableAction } from '../../../../shared/components/dark-data-table/dark-data-table.component';
import { TotalBoxComponent } from '../../../../shared/components/total-box/total-box.component';

interface PaymentItem {
  id: number;
  type: 'client' | 'supplier';
  reference: string;
  entity: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'partial';
  daysToDue?: number;
}

@Component({
  selector: 'app-payment-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, DarkDataTableComponent, TotalBoxComponent],
  templateUrl: './payment-schedule.component.html',
  styleUrls: ['./payment-schedule.component.scss']
})
export class PaymentScheduleComponent implements OnInit {
  // Références aux templates personnalisés
  @ViewChild('typeColumnTemplate') typeColumnTemplate!: TemplateRef<any>;
  @ViewChild('entityColumnTemplate') entityColumnTemplate!: TemplateRef<any>;
  @ViewChild('dueDateColumnTemplate') dueDateColumnTemplate!: TemplateRef<any>;
  @ViewChild('statusColumnTemplate') statusColumnTemplate!: TemplateRef<any>;
  // Données des échéances
  payments: PaymentItem[] = [
    {
      id: 1,
      type: 'client',
      reference: 'FAC-2025-042',
      entity: 'Dupont Consulting',
      amount: 3500,
      dueDate: '2025-06-15',
      status: 'pending',
      daysToDue: 23
    },
    {
      id: 2,
      type: 'supplier',
      reference: 'F-2025-128',
      entity: 'Martin Fournitures',
      amount: 1200,
      dueDate: '2025-06-05',
      status: 'pending',
      daysToDue: 13
    },
    {
      id: 3,
      type: 'client',
      reference: 'FAC-2025-038',
      entity: 'Leroy Industries',
      amount: 4800,
      dueDate: '2025-05-20',
      status: 'overdue',
      daysToDue: -3
    },
    {
      id: 4,
      type: 'supplier',
      reference: 'F-2025-115',
      entity: 'Bureau Services',
      amount: 650,
      dueDate: '2025-05-15',
      status: 'overdue',
      daysToDue: -8
    },
    {
      id: 5,
      type: 'client',
      reference: 'FAC-2025-035',
      entity: 'Petit Commerce',
      amount: 1800,
      dueDate: '2025-05-10',
      status: 'partial',
      daysToDue: -13
    }
  ];

  // Filtres actifs
  activeFilters = {
    clients: true,
    suppliers: true,
    pending: true,
    overdue: true,
    paid: false,
    partial: true
  };

  // Tri et filtrage
  sortCriteria: string = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm = '';
  
  // Actions du tableau
  tableActions: DarkTableAction[] = [
    {
      label: 'Marquer comme payé',
      icon: 'bi-check-circle',
      btnClass: 'btn-outline-success',
      tooltip: 'Marquer comme payé',
      visible: (item: PaymentItem) => item.status !== 'paid',
      action: (item: PaymentItem) => {
        console.log('Marquer comme payé:', item);
        // Dans une application réelle, vous appelleriez un service pour mettre à jour le statut
        const index = this.payments.findIndex(p => p.id === item.id);
        if (index !== -1) {
          this.payments[index] = { ...this.payments[index], status: 'paid' };
          // Forcer la mise à jour de la référence pour déclencher la détection de changements
          this.payments = [...this.payments];
        }
      }
    },
    {
      label: 'Voir détails',
      icon: 'bi-eye',
      btnClass: 'btn-outline-primary',
      tooltip: 'Voir les détails',
      action: (item: PaymentItem) => {
        console.log('Voir détails:', item);
        // Naviguer vers la page de détails ou ouvrir une modal
      }
    },
    {
      label: 'Modifier',
      icon: 'bi-pencil',
      btnClass: 'btn-outline-secondary',
      tooltip: 'Modifier',
      action: (item: PaymentItem) => {
        console.log('Modifier:', item);
        // Ouvrir un formulaire d'édition
      }
    }
  ];

  // Configuration des colonnes du tableau (sera mise à jour dans ngAfterViewInit)
  tableColumns: DarkTableColumn[] = [
    {
      key: 'type',
      label: 'Type',
      sortable: true
    },
    {
      key: 'reference',
      label: 'Référence',
      sortable: true
    },
    {
      key: 'entity',
      label: 'Entité',
      sortable: true
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      pipe: 'currency',
      align: 'right'
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      sortable: true
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true
    }
  ];

  // Totaux
  totals = {
    clientsReceivable: 0,
    suppliersPayable: 0,
    overdueTotal: 0,
    pendingTotal: 0
  };

  // Période sélectionnée
  selectedPeriod = '30d';

  constructor(private store: Store<DashboardState>) { }

  ngOnInit(): void {
    // Récupérer les données des comptes bancaires pour simuler les paiements
    this.store.select(DashboardSelectors.selectBankAccounts).pipe(
      map(accounts => {
        if (accounts && accounts.length > 0) {
          // Générer des paiements fictifs basés sur les comptes bancaires
          this.generatePaymentsFromAccounts(accounts);
          this.calculateTotals();
        }
      })
    ).subscribe();
  }
  
  // Après l'initialisation de la vue, associer les templates personnalisés aux colonnes
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tableColumns = [
        {
          key: 'type',
          label: 'Type',
          sortable: true,
          cellTemplate: this.typeColumnTemplate
        },
        {
          key: 'reference',
          label: 'Référence',
          sortable: true
        },
        {
          key: 'entity',
          label: 'Entité',
          sortable: true,
          cellTemplate: this.entityColumnTemplate
        },
        {
          key: 'amount',
          label: 'Montant',
          sortable: true,
          pipe: 'currency',
          align: 'right'
        },
        {
          key: 'dueDate',
          label: 'Échéance',
          sortable: true,
          cellTemplate: this.dueDateColumnTemplate
        },
        {
          key: 'status',
          label: 'Statut',
          sortable: true,
          cellTemplate: this.statusColumnTemplate
        }
      ];
    });
  }
  
  /**
   * Génère des paiements fictifs basés sur les comptes bancaires
   */
  generatePaymentsFromAccounts(accounts: any[]): void {
    // Vider les paiements existants
    this.payments = [];
    
    // Générer des paiements clients et fournisseurs basés sur les comptes
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    accounts.forEach((account, index) => {
      // Paiement client
      this.payments.push({
        id: this.payments.length + 1,
        type: 'client',
        reference: `FAC-${currentYear}-${String(40 + index).padStart(3, '0')}`,
        entity: `Client ${index + 1}`,
        amount: Math.round(Math.random() * 5000 + 1000),
        dueDate: new Date(currentYear, currentMonth, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        status: Math.random() > 0.7 ? 'overdue' : 'pending',
        daysToDue: Math.floor(Math.random() * 30) - 10
      });
      
      // Paiement fournisseur
      this.payments.push({
        id: this.payments.length + 1,
        type: 'supplier',
        reference: `F-${currentYear}-${String(100 + index).padStart(3, '0')}`,
        entity: `Fournisseur ${index + 1}`,
        amount: Math.round(Math.random() * 3000 + 500),
        dueDate: new Date(currentYear, currentMonth, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        status: Math.random() > 0.6 ? 'pending' : (Math.random() > 0.5 ? 'overdue' : 'partial'),
        daysToDue: Math.floor(Math.random() * 30) - 15
      });
    });
    
    // Trier les paiements par date d'échéance
    this.payments.sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  // Calculer les totaux
  calculateTotals(): void {
    this.totals = {
      clientsReceivable: 0,
      suppliersPayable: 0,
      overdueTotal: 0,
      pendingTotal: 0
    };

    this.payments.forEach(payment => {
      if (payment.type === 'client') {
        this.totals.clientsReceivable += payment.amount;
      } else {
        this.totals.suppliersPayable += payment.amount;
      }

      if (payment.status === 'overdue') {
        this.totals.overdueTotal += payment.amount;
      } else if (payment.status === 'pending') {
        this.totals.pendingTotal += payment.amount;
      }
    });
  }

  // Filtrer les paiements
  getFilteredPayments(): PaymentItem[] {
    let filtered = this.payments.filter(payment => {
      // Filtre par type
      if (payment.type === 'client' && !this.activeFilters.clients) {
        return false;
      }
      if (payment.type === 'supplier' && !this.activeFilters.suppliers) {
        return false;
      }

      // Filtre par statut
      if (payment.status === 'pending' && !this.activeFilters.pending) {
        return false;
      }
      if (payment.status === 'overdue' && !this.activeFilters.overdue) {
        return false;
      }
      if (payment.status === 'paid' && !this.activeFilters.paid) {
        return false;
      }
      if (payment.status === 'partial' && !this.activeFilters.partial) {
        return false;
      }

      // Filtre par terme de recherche
      if (this.searchTerm.trim() !== '') {
        const searchLower = this.searchTerm.toLowerCase();
        return (
          payment.entity.toLowerCase().includes(searchLower) ||
          payment.reference.toLowerCase().includes(searchLower) ||
          this.formatCurrency(payment.amount).toLowerCase().includes(searchLower) ||
          this.getStatusLabel(payment.status).toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Tri des résultats
    filtered = this.sortPayments(filtered);

    return filtered;
  }

  // Changer la période
  setPeriod(period: string): void {
    this.selectedPeriod = period;
    // Ici, on pourrait recharger les données en fonction de la période
  }

  // Basculer un filtre
  toggleFilter(filter: 'clients' | 'suppliers' | 'pending' | 'overdue' | 'paid' | 'partial'): void {
    this.activeFilters[filter] = !this.activeFilters[filter];
  }

  // Réinitialiser tous les filtres
  resetFilters(): void {
    this.activeFilters = {
      clients: true,
      suppliers: true,
      pending: true,
      overdue: true,
      paid: true,
      partial: true
    };
    this.searchTerm = '';
  }

  // Trier les paiements (utilisé par le menu déroulant de tri)
  sortBy(criteria: string): void {
    if (this.sortCriteria === criteria) {
      // Inverser l'ordre si on clique sur le même critère
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCriteria = criteria;
      this.sortDirection = 'asc';
    }
  }
  
  // Gérer l'événement de tri émis par le composant DarkDataTableComponent
  onSort(event: {field: string, direction: 'asc' | 'desc'}): void {
    this.sortCriteria = event.field;
    this.sortDirection = event.direction;
  }

  // Appliquer le tri aux paiements
  private sortPayments(payments: PaymentItem[]): PaymentItem[] {
    return [...payments].sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortCriteria) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'entity':
          comparison = a.entity.localeCompare(b.entity);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Formater les montants
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Obtenir la classe CSS pour le statut
  getRowClass = (item: PaymentItem): string => {
    switch (item.status) {
      case 'overdue': return 'table-danger';
      case 'pending': 
        return item.daysToDue && item.daysToDue <= 7 ? 'table-warning' : '';
      case 'paid': return 'table-success';
      case 'partial': return 'table-info';
      default: return '';
    }
  }
  
  // Les méthodes pour les actions ont été déplacées directement dans les définitions d'actions

  // Cette méthode a été supprimée car elle était en double

  // Formater le libellé du statut
  getStatusLabel(status: string): string {
    switch (status) {
      case 'overdue':
        return 'En retard';
      case 'pending':
        return 'À échéance';
      case 'paid':
        return 'Payé';
      case 'partial':
        return 'Partiel';
      default:
        return status;
    }
  }

  // Formater le texte des jours restants
  getDaysText(days: number | undefined): string {
    if (!days && days !== 0) return '';
    
    if (days > 0) {
      return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    } else if (days < 0) {
      const absDays = Math.abs(days);
      return `Retard de ${absDays} jour${absDays > 1 ? 's' : ''}`;
    } else {
      return 'Aujourd\'hui';
    }
  }
}
