import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(companyId: number, fiscalYearId: number): Observable<DashboardStats> {
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('fiscalYearId', fiscalYearId.toString());

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params });
  }

  getBankAccounts(companyId: number, fiscalYearId: number): Observable<any[]> {
    const params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('fiscalYearId', fiscalYearId.toString());

    return this.http.get<any[]>(`${this.apiUrl}/bank-accounts`, { params });
  }
}
