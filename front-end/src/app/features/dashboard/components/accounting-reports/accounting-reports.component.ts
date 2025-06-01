import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardState } from '../../store/dashboard.state';
import * as DashboardSelectors from '../../store/dashboard.selectors';
import { selectSelectedCompany } from '../../../company/store/company.selectors';
import { selectSelectedFiscalYear } from '../../../fiscal-year/store/fiscal-year.selectors';

interface ReportItem {
  id: number;
  name: string;
  type: 'financial' | 'tax' | 'management';
  lastGenerated?: string;
  frequency?: string;
  favorite: boolean;
}

@Component({
  selector: 'app-accounting-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounting-reports.component.html',
  styleUrls: ['./accounting-reports.component.scss']
})
export class AccountingReportsComponent implements OnInit {
  // Liste des rapports disponibles
  reports: ReportItem[] = [
    {
      id: 1,
      name: 'Grand livre',
      type: 'financial',
      lastGenerated: '2025-05-15',
      frequency: 'Mensuel',
      favorite: true
    },
    {
      id: 2,
      name: 'Balance générale',
      type: 'financial',
      lastGenerated: '2025-05-15',
      frequency: 'Mensuel',
      favorite: true
    },
    {
      id: 3,
      name: 'Journal des ventes',
      type: 'financial',
      lastGenerated: '2025-05-15',
      frequency: 'Mensuel',
      favorite: false
    },
    {
      id: 4,
      name: 'Journal des achats',
      type: 'financial',
      lastGenerated: '2025-05-15',
      frequency: 'Mensuel',
      favorite: false
    },
    {
      id: 5,
      name: 'Compte de résultat',
      type: 'financial',
      lastGenerated: '2025-04-30',
      frequency: 'Mensuel',
      favorite: true
    },
    {
      id: 6,
      name: 'Bilan',
      type: 'financial',
      lastGenerated: '2025-04-30',
      frequency: 'Mensuel',
      favorite: true
    },
    {
      id: 7,
      name: 'Déclaration de TVA',
      type: 'tax',
      lastGenerated: '2025-04-30',
      frequency: 'Trimestriel',
      favorite: true
    },
    {
      id: 8,
      name: 'Liasse fiscale',
      type: 'tax',
      lastGenerated: '2024-12-31',
      frequency: 'Annuel',
      favorite: false
    },
    {
      id: 9,
      name: 'Analyse des marges',
      type: 'management',
      lastGenerated: '2025-05-15',
      frequency: 'Mensuel',
      favorite: false
    },
    {
      id: 10,
      name: 'Analyse des ventes par client',
      type: 'management',
      lastGenerated: '2025-05-15',
      frequency: 'Mensuel',
      favorite: false
    }
  ];

  // Filtre actif
  activeFilter: 'all' | 'financial' | 'tax' | 'management' | 'favorites' = 'all';

  // Période sélectionnée
  selectedPeriod: string = 'current_month';

  // Périodes disponibles
  periods = [
    { id: 'current_month', name: 'Mois en cours' },
    { id: 'previous_month', name: 'Mois précédent' },
    { id: 'current_quarter', name: 'Trimestre en cours' },
    { id: 'ytd', name: 'Cumul annuel' },
    { id: 'previous_year', name: 'Année précédente' },
    { id: 'custom', name: 'Période personnalisée' }
  ];

  // Informations sur l'entreprise et l'année fiscale sélectionnées
  selectedCompany: any;
  selectedFiscalYear: any;

  constructor(private store: Store<DashboardState>) { }

  ngOnInit(): void {
    // Récupérer l'entreprise sélectionnée
    this.store.select(selectSelectedCompany).subscribe(company => {
      if (company) {
        this.selectedCompany = company;
        this.updateReportNames();
      }
    });
    
    // Récupérer l'année fiscale sélectionnée
    this.store.select(selectSelectedFiscalYear).subscribe(fiscalYear => {
      if (fiscalYear) {
        this.selectedFiscalYear = fiscalYear;
        this.updateReportNames();
      }
    });
  }
  
  /**
   * Met à jour les noms des rapports avec les informations de l'entreprise et de l'année fiscale
   */
  updateReportNames(): void {
    if (this.selectedCompany && this.selectedFiscalYear) {
      // Mettre à jour les noms des rapports avec le nom de l'entreprise
      this.reports.forEach(report => {
        // Ajouter la date de dernière génération si elle n'existe pas
        if (!report.lastGenerated) {
          const randomDaysAgo = Math.floor(Math.random() * 30);
          const date = new Date();
          date.setDate(date.getDate() - randomDaysAgo);
          report.lastGenerated = date.toISOString().split('T')[0];
        }
      });
    }
  }

  // Filtrer les rapports
  getFilteredReports(): ReportItem[] {
    switch (this.activeFilter) {
      case 'financial':
        return this.reports.filter(report => report.type === 'financial');
      case 'tax':
        return this.reports.filter(report => report.type === 'tax');
      case 'management':
        return this.reports.filter(report => report.type === 'management');
      case 'favorites':
        return this.reports.filter(report => report.favorite);
      default:
        return this.reports;
    }
  }

  // Définir le filtre actif
  setFilter(filter: 'all' | 'financial' | 'tax' | 'management' | 'favorites'): void {
    this.activeFilter = filter;
  }

  // Basculer un rapport en favori
  toggleFavorite(report: ReportItem): void {
    report.favorite = !report.favorite;
  }

  // Formater la date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  // Obtenir la classe CSS pour le type de rapport
  getTypeClass(type: string): string {
    switch (type) {
      case 'financial':
        return 'badge-primary';
      case 'tax':
        return 'badge-danger';
      case 'management':
        return 'badge-success';
      default:
        return '';
    }
  }

  // Obtenir le libellé pour le type de rapport
  getTypeLabel(type: string): string {
    switch (type) {
      case 'financial':
        return 'Financier';
      case 'tax':
        return 'Fiscal';
      case 'management':
        return 'Gestion';
      default:
        return type;
    }
  }

  // Générer un rapport
  generateReport(report: ReportItem): void {
    // Ici, on simulerait l'appel à l'API pour générer le rapport
    console.log(`Génération du rapport: ${report.name} pour la période: ${this.selectedPeriod}`);
    
    // Mise à jour de la date de dernière génération
    report.lastGenerated = new Date().toISOString().split('T')[0];
  }
}
