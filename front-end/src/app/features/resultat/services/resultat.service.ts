import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ResultatItem {
  accountId: number;
  accountName: string;
  montantN: number;
  montantN1: number;
  level: number;
}

export interface ResultatSection {
  title: string;
  items: ResultatItem[];
  total: {
    montantN: number;
    montantN1: number;
  };
}

export interface ResultatResponse {
  produits: {
    exploitation: ResultatItem[];
    financiers: ResultatItem[];
    exceptionnels: ResultatItem[];
  };
  charges: {
    exploitation: ResultatItem[];
    financieres: ResultatItem[];
    exceptionnelles: ResultatItem[];
    impots: ResultatItem[];
  };
}

export interface ResultatMensuel {
  month: string;
  monthly_revenue: number;
  monthly_expenses: number;
  monthly_net_result: number;
  cumulative_revenue: number;
  cumulative_expenses: number;
  cumulative_net_result: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResultatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/resultats`;

  /**
   * Récupère les résultats pour une période donnée
   * @param startDate Date de début période N
   * @param endDate Date de fin période N
   * @param startDateN1 Date de début période N-1 (optionnel)
   * @param endDateN1 Date de fin période N-1 (optionnel)
   * @param companyId ID de l'entreprise
   */
  getResultatsByPeriod(
    startDate: string,
    endDate: string,
    companyId: number,
    startDateN1?: string,
    endDateN1?: string
  ): Observable<ResultatResponse> {
    let url = `${this.apiUrl}/period?startDate=${startDate}&endDate=${endDate}&companyId=${companyId}`;
    
    if (startDateN1 && endDateN1) {
      url += `&startDateN1=${startDateN1}&endDateN1=${endDateN1}`;
    }

    return this.http.get<ResultatResponse>(url);
  }

  /**
   * Récupère les résultats mensuels pour un exercice fiscal
   * @param fiscalYearId ID de l'exercice fiscal
   * @param companyId ID de l'entreprise
   */
  getResultatsByFiscalYear(
    fiscalYearId: number,
    companyId: number
  ): Observable<ResultatMensuel[]> {
    return this.http.get<ResultatMensuel[]>(
      `${this.apiUrl}/fiscal-year?fiscalYearId=${fiscalYearId}&companyId=${companyId}`
    );
  }

  /**
   * Transforme les données brutes en sections formatées pour l'affichage
   * @param data Données brutes de l'API
   */
  formatResultatsForDisplay(data: ResultatResponse): {
    produits: ResultatSection[];
    charges: ResultatSection[];
  } {
    if (!data) {
      return {
        produits: [],
        charges: []
      };
    }

    const produits: ResultatSection[] = [
      {
        title: "PRODUITS D'EXPLOITATION",
        items: data.produits?.exploitation || [],
        total: this.calculateTotal(data.produits?.exploitation)
      },
      {
        title: "PRODUITS FINANCIERS",
        items: data.produits?.financiers || [],
        total: this.calculateTotal(data.produits?.financiers)
      },
      {
        title: "PRODUITS EXCEPTIONNELS",
        items: data.produits?.exceptionnels || [],
        total: this.calculateTotal(data.produits?.exceptionnels)
      }
    ];

    const charges: ResultatSection[] = [
      {
        title: "CHARGES D'EXPLOITATION",
        items: data.charges?.exploitation || [],
        total: this.calculateTotal(data.charges?.exploitation)
      },
      {
        title: "CHARGES FINANCIÈRES",
        items: data.charges?.financieres || [],
        total: this.calculateTotal(data.charges?.financieres)
      },
      {
        title: "CHARGES EXCEPTIONNELLES",
        items: data.charges?.exceptionnelles || [],
        total: this.calculateTotal(data.charges?.exceptionnelles)
      },
      {
        title: "IMPÔTS SUR LES BÉNÉFICES",
        items: data.charges?.impots || [],
        total: this.calculateTotal(data.charges?.impots)
      }
    ];

    return { produits, charges };
  }

  /**
   * Calcule le total d'une section
   * @param items Liste des éléments de la section
   */
  private calculateTotal(items: ResultatItem[] = []): { montantN: number; montantN1: number } {
    if (!items || !Array.isArray(items)) {
      return { montantN: 0, montantN1: 0 };
    }

    return items.reduce(
      (acc, item) => ({
        montantN: acc.montantN + (item?.montantN || 0),
        montantN1: acc.montantN1 + (item?.montantN1 || 0)
      }),
      { montantN: 0, montantN1: 0 }
    );
  }
}
