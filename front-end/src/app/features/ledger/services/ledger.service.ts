import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LedgerEntry {
  date: Date;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  lettrage?: string;
}

export interface AccountLedger {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: number;
  classePcg: number;
  isAuxiliaire: boolean;
  codePcgReference?: string;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface LedgerFilter {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  companyId?: number;
  fiscalYearId?: number;
  isAuxiliaire?: boolean;
  typeId?: number;
  classePcgId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LedgerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ledger`;

  getLedger(filters: LedgerFilter): Observable<AccountLedger[]> {
    const params: { [key: string]: string } = {};
    
    // Ajout conditionnel de chaque paramètre
    if (filters.startDate) params['startDate'] = filters.startDate;
    if (filters.endDate) params['endDate'] = filters.endDate;
    if (filters.accountId) params['accountId'] = filters.accountId.toString();
    if (filters.companyId) params['companyId'] = filters.companyId.toString();
    if (filters.fiscalYearId) params['fiscalYearId'] = filters.fiscalYearId.toString();
    if (filters.isAuxiliaire !== undefined) params['isAuxiliaire'] = filters.isAuxiliaire.toString();
    if (filters.typeId) params['typeId'] = filters.typeId.toString();
    if (filters.classePcgId) params['classePcgId'] = filters.classePcgId.toString();

    return this.http.get<AccountLedger[]>(this.apiUrl, { params });
  }
}
