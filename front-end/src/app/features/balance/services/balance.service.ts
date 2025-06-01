import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Interface for a balance entry
 */
export interface BalanceEntry {
  account_id: number;
  account_code: string;
  account_name: string;
  type_id: number;
  is_auxiliaire: boolean;
  total_debit: number;
  total_credit: number;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/balances`;

  getBalance(params: {
    companyId: number;
    fiscalYearId: number;
    startDate?: string;
    endDate?: string;
    accountId?: number;
  }): Observable<BalanceEntry[]> {
    // Filtrer les paramètres undefined
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
    
    return this.http.get<BalanceEntry[]>(this.apiUrl, { params: cleanParams as any });
  }
}
