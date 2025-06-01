import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Alert {
  id: number;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
  icon: string;
}

@Component({
  selector: 'app-dashboard-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-alerts.component.html',
  styleUrls: ['./dashboard-alerts.component.scss']
})
export class DashboardAlertsComponent implements OnInit {
  alerts: Alert[] = [
    {
      id: 1,
      type: 'danger',
      title: 'Facture en retard',
      message: 'La facture #F-2025-042 est en retard de paiement depuis 15 jours.',
      date: '2025-05-23',
      read: false,
      icon: 'bi-exclamation-triangle'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Solde de trésorerie faible',
      message: 'Le solde du compte courant est inférieur au seuil d\'alerte défini.',
      date: '2025-05-22',
      read: false,
      icon: 'bi-cash'
    },
    {
      id: 3,
      type: 'info',
      title: 'Rapprochement bancaire',
      message: 'Le rapprochement bancaire du mois d\'avril est en attente de validation.',
      date: '2025-05-20',
      read: true,
      icon: 'bi-bank'
    },
    {
      id: 4,
      type: 'success',
      title: 'Paiement reçu',
      message: 'Le paiement de la facture #F-2025-038 a été reçu (3 500 €).',
      date: '2025-05-18',
      read: true,
      icon: 'bi-check-circle'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  // Marquer une alerte comme lue
  markAsRead(alert: Alert): void {
    alert.read = true;
  }

  // Supprimer une alerte
  dismissAlert(alertId: number): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }

  // Obtenir le nombre d'alertes non lues
  getUnreadCount(): number {
    return this.alerts.filter(alert => !alert.read).length;
  }

  // Formater la date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      }).format(date);
    }
  }

  // Obtenir la classe CSS pour le type d'alerte
  getAlertClass(type: string): string {
    switch (type) {
      case 'danger':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      default:
        return 'alert-secondary';
    }
  }
}
