import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BilanComparison } from '../models/bilan.model';
import { FiscalYear } from '../models/fiscal-year.model'; // Assuming FiscalYear model exists

@Injectable({
  providedIn: 'root'
})
export class BilanService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBilanComparison(companyId: number, fiscalYearId: number): Observable<BilanComparison> {
    return this.http.get<BilanComparison>(`${this.baseUrl}/bilans/comparison`, {
      params: {
        companyId: companyId.toString(),
        fiscalYearId: fiscalYearId.toString()
      }
    });
  }
}
