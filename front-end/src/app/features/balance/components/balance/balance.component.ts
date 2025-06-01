import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AmountPipe } from '../../../../shared/pipes/amount.pipe';
import { BalancePipe } from '../../../../shared/pipes/balance.pipe';
import { BalanceService, BalanceEntry } from '../../services/balance.service';
import { selectCompanyId, selectFiscalYearId } from '../../../transaction/store/transaction.selectors';
import { selectSelectedFiscalYear } from '../../../fiscal-year/store/fiscal-year.selectors';
import { combineLatest } from 'rxjs';
import { selectSelectedCompany } from '../../../company/store/company.selectors';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AmountPipe, BalancePipe],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {
  private balanceService = inject(BalanceService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  filterForm!: FormGroup;
  balanceEntries: BalanceEntry[] = [];
  totals = {
    debit: 0,
    credit: 0,
    balance: 0
  };

  ngOnInit() {
    this.initForm();
    this.loadBalance();
  }

  private initForm() {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      accountId: ['']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.loadBalance();
    });
  }

  private loadBalance() {
    console.log("loadBalance called");
    const filters = this.filterForm.value;
    console.log("Form filters:", filters);
    
    combineLatest([
      this.store.select(selectSelectedCompany),
      this.store.select(selectSelectedFiscalYear)
    ]).subscribe(([company, fiscalYear]) => {
      console.log("Store values:", { 
        company: { id: company?.id, name: company?.name },
        fiscalYear: { 
          id: fiscalYear?.id, 
          startDate: fiscalYear?.startDate,
          endDate: fiscalYear?.endDate
        }
      });
      
      if (company?.id && fiscalYear?.id) {
        const startDate = filters.startDate || this.formatDate(fiscalYear.startDate);
        console.log("Using startDate:", startDate, 
          filters.startDate ? "(from filter)" : "(from fiscal year)");

        // Créer les paramètres en excluant les valeurs undefined
        const params: any = {
          companyId: company.id,
          fiscalYearId: fiscalYear.id,
          startDate
        };

        if (filters.endDate) {
          params.endDate = filters.endDate;
          console.log("Using endDate from filter:", filters.endDate);
        }
        if (filters.accountId) {
          params.accountId = Number(filters.accountId);
          console.log("Filtering by account:", params.accountId);
        }
        console.log("Calling balance service with params:", params);

        this.balanceService.getBalance(params).subscribe({
          next: (entries) => {
            console.log(`Received ${entries.length} balance entries`);
            this.balanceEntries = entries;
            this.calculateTotals();
          },
          error: (error) => {
            console.error("Error fetching balance:", error);
            this.balanceEntries = [];
            this.calculateTotals();
          }
        });
      } else {
        console.log("Missing required values:", { 
          companyId: company?.id, 
          fiscalYearId: fiscalYear?.id 
        });
        this.balanceEntries = [];
        this.calculateTotals();
      }
    });
  }

  private calculateTotals() {
    console.log("Calculating totals for", this.balanceEntries.length, "entries");

    this.totals = this.balanceEntries.reduce((acc, entry) => {
      // Assurer que les valeurs sont des nombres
      const debit = Number(entry.total_debit) || 0;
      const credit = Number(entry.total_credit) || 0;
      const balance = Number(entry.balance) || 0;

      return {
        debit: acc.debit + debit,
        credit: acc.credit + credit,
        balance: acc.balance + balance
      };
    }, { debit: 0, credit: 0, balance: 0 });

    console.log("Calculated totals:", {
      debit: this.totals.debit,
      credit: this.totals.credit,
      balance: this.totals.balance
    });
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
