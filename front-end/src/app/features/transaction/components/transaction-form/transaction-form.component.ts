import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Transaction, CreateTransactionDto, TransactionLine } from '../../models/transaction.model';
import { Store } from '@ngrx/store';
import { selectSelectedCompany } from '../../../company/store/company.selectors';
import { filter, take } from 'rxjs/operators';
import { Company } from '../../../company/models/company.interface';
import { TransactionActions } from '../../store/transaction.actions';
import { selectTransactionById } from '../../store/transaction.selectors';
import { AppState } from '../../../../store';
import { Account } from '../../../accounting/models/account.interface';
import { AccountingActions } from '../../../accounting/store/accounting.actions';
import { selectAccounts, selectAccountLoading } from '../../../accounting/store/accounting.selectors';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store<AppState>);
  private location = inject(Location);

  transactionForm!: FormGroup;
  isEditing = false;
  accounts$: Observable<Account[]> = this.store.select(selectAccounts);
  accountsLoading$ = this.store.select(selectAccountLoading);
  private editingId?: number;
  private companyId?: number;
  private fiscalYearId?: number;

  ngOnInit() {
    // Get copied transaction from router state if available
    const navigation = this.router.getCurrentNavigation();
    const copiedTransaction = navigation?.extras?.state?.['copiedTransaction'];

    if (copiedTransaction) {
      this.initForm(copiedTransaction);
    } else {
      // Obtenir le contexte de l'entreprise et de l'année fiscale
      this.store.select(selectSelectedCompany).pipe(
        filter((company): company is NonNullable<Company> => 
          !!company && 
          typeof company.id === 'number' && 
          Array.isArray(company.fiscalYears) && 
          company.fiscalYears.length > 0
        ),
        take(1)
      ).subscribe(company => {
        const activeFiscalYear = company.fiscalYears!.find(fy => fy.status === 'active');
        if (!activeFiscalYear?.id) return;
        if (!company?.id) return;

        this.companyId = company.id;
        this.fiscalYearId = activeFiscalYear.id;

        // Charger les comptes via le store accounting
        this.store.dispatch(AccountingActions.loadAccounts());

        // Initialiser le formulaire après avoir obtenu le contexte
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.editingId = Number(id);
          this.store.select(selectTransactionById(this.editingId)).pipe(
            take(1)
          ).subscribe(transaction => {
            if (transaction) {
              this.isEditing = true;
              this.initForm(transaction);
            } else {
              this.router.navigate(['../..'], { relativeTo: this.route });
            }
          });
        } else {
          this.initForm();
        }
      });
    }
  }

  private initForm(transaction?: Transaction) {
    this.transactionForm = this.fb.group({
      date: [transaction?.date || new Date(), Validators.required],
      reference: [transaction?.reference || ''],
      description: [transaction?.description || '', Validators.required],
      lines: this.fb.array([
        this.createLineFormGroup(
          transaction?.lines?.find(line => line.is_debit) || { is_debit: true, amount: 0 },
          true
        ),
        this.createLineFormGroup(
          transaction?.lines?.find(line => !line.is_debit) || { is_debit: false, amount: 0 },
          false
        )
      ])
    });
  }

  private createLineFormGroup(line: Partial<TransactionLine>, isDebit: boolean) {
    return this.fb.group({
      account_id: [line.account_id?.toString() || '', [Validators.required]],
      amount: [line.amount || 0, [Validators.required, Validators.min(0)]],
      is_debit: [isDebit]
    });
  }

  onSubmit() {
    if (this.transactionForm.invalid) {
      return;
    }

    const formValue = this.transactionForm.value;
    const lines = formValue.lines.map((line: any) => ({
      account_id: Number(line.account_id),
      amount: Number(line.amount),
      is_debit: line.is_debit
    }));

    const transactionDto: CreateTransactionDto = {
      date: new Date(formValue.date),
      description: formValue.description.trim(),
      reference: formValue.reference?.trim() || undefined,
      company_id: this.companyId!,
      fiscal_year_id: this.fiscalYearId!,
      lines: lines
    };

    if (this.isEditing && this.editingId) {
      this.store.dispatch(TransactionActions.updateTransaction({
        id: this.editingId,
        transaction: transactionDto
      }));
    } else {
      this.store.dispatch(TransactionActions.createTransaction({
        transaction: transactionDto
      }));
    }

    this.location.back();
  }

  onCancel() {
    this.location.back();
  }
}
