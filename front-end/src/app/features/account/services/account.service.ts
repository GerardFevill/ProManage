import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/account`;

  constructor(private http: HttpClient) {}

  getAccounts(companyId: number): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl, {
      params: { companyId: companyId.toString() }
    });
  }
}
