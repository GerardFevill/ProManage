import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Company } from '../models/company.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { FiscalYear } from '../../fiscal-year/models/fiscal-year.interface';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  private mapFiscalYear(fy: any): FiscalYear {
    return {
      ...fy,
      startDate: fy.startdate ? new Date(fy.startdate) : null,
      endDate: fy.enddate ? new Date(fy.enddate) : null,
      status: fy.status?.toLowerCase() || 'pending'
    };
  }

  private mapCompany(company: any): Company {
    if (!company) return {} as Company;
    
    return {
      ...company,
      legalForm: company.legal_form,
      vatNumber: company.vat_number,
      fiscalYears: Array.isArray(company.fiscal_years) 
        ? company.fiscal_years
            .filter((fy: any): boolean => fy && typeof fy === 'object')
            .map((fy: any): FiscalYear => this.mapFiscalYear(fy))
        : []
    };
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((companies: any[]): Company[] => 
        companies.map((company: any): Company => this.mapCompany(company))
      )
    );
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((company: any): Company => this.mapCompany(company))
    );
  }

  createCompany(company: Company): Observable<Company> {
    const mappedCompany = {
      ...company,
      legal_form: company.legalForm,
      vat_number: company.vatNumber
    };
    return this.http.post<any>(this.apiUrl, mappedCompany).pipe(
      map((response: any): Company => this.mapCompany(response))
    );
  }

  updateCompany(id: number, company: Company): Observable<Company> {
    const mappedCompany = {
      ...company,
      legal_form: company.legalForm,
      vat_number: company.vatNumber
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, mappedCompany).pipe(
      map((response: any): Company => this.mapCompany(response))
    );
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}