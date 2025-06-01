import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FiscalYear } from '../models/fiscal-year.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiscalYearService {
  private apiUrl = `${environment.apiUrl}/fiscal-years`;

  constructor(private http: HttpClient) {}

  private mapFiscalYear(fy: any): FiscalYear {
    return {
      ...fy,
      startDate: fy.start_date ? new Date(fy.start_date) : null,
      endDate: fy.end_date ? new Date(fy.end_date) : null,
      companyId: fy.company_id,
      status: fy.status?.toLowerCase() || 'pending'
    };
  }

  getFiscalYears(companyId: number): Observable<FiscalYear[]> {
    if (!companyId) {
      return throwError(() => new Error('Company ID is required'));
    }
    return this.http.get<any[]>(`${this.apiUrl}/company/${companyId}`).pipe(
      map(fiscalYears => 
        fiscalYears.map(fy => this.mapFiscalYear(fy))
      ),
      catchError(error => throwError(() => error))
    );
  }

  getFiscalYear(id: number): Observable<FiscalYear> {
    if (!id) {
      return throwError(() => new Error('Fiscal Year ID is required'));
    }
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(fy => this.mapFiscalYear(fy)),
      catchError(error => throwError(() => error))
    );
  }

  createFiscalYear(fiscalYear: FiscalYear): Observable<FiscalYear> {
    if (!fiscalYear.companyId) {
      return throwError(() => new Error('Company ID is required'));
    }

    const mappedFiscalYear = {
      company_id: fiscalYear.companyId,
      name: fiscalYear.name,
      start_date: fiscalYear.startDate,
      end_date: fiscalYear.endDate,
      status: fiscalYear.status,
      notes: fiscalYear.notes
    };

    return this.http.post<any>(this.apiUrl, mappedFiscalYear).pipe(
      map(fy => this.mapFiscalYear(fy)),
      catchError(error => throwError(() => error))
    );
  }

  updateFiscalYear(fiscalYear: FiscalYear): Observable<FiscalYear> {
    if (!fiscalYear.id) {
      return throwError(() => new Error('Fiscal Year ID is required'));
    }

    const mappedFiscalYear = {
      company_id: fiscalYear.companyId,
      name: fiscalYear.name,
      start_date: fiscalYear.startDate,
      end_date: fiscalYear.endDate,
      status: fiscalYear.status,
      notes: fiscalYear.notes
    };

    return this.http.put<any>(`${this.apiUrl}/${fiscalYear.id}`, mappedFiscalYear).pipe(
      map(fy => this.mapFiscalYear(fy)),
      catchError(error => throwError(() => error))
    );
  }

  deleteFiscalYear(id: number): Observable<void> {
    if (!id) {
      return throwError(() => new Error('Fiscal Year ID is required'));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
