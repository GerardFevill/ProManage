import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Account, TypeCompte, ClassePCG } from '../../models/account.interface';
import { AccountDeleteDialogComponent } from '../account-delete-dialog/account-delete-dialog.component';
import { selectAccounts,selectAccountLoading,selectAccountError } from '../../store/accounting.selectors';
import { AccountingActions } from '../../store/accounting.actions';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AccountDeleteDialogComponent
  ],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {
  accounts$: Observable<Account[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  showDeleteDialog = false;
  selectedAccount: Account | null = null;

  typeCompteLabels: { [key in TypeCompte]: string } = {
    [TypeCompte.ACTIF]: 'Comptes d\'actif',
    [TypeCompte.PASSIF]: 'Comptes de passif',
    [TypeCompte.CHARGE]: 'Comptes de charges',
    [TypeCompte.PRODUIT]: 'Comptes de produits',
    [TypeCompte.CAPITAUX_PROPRES]: 'Comptes de capitaux propres'
  };

  classePCGLabels: { [key in ClassePCG]: string } = {
    [ClassePCG.CAPITAUX]: 'Comptes de capitaux',
    [ClassePCG.IMMOBILISATIONS]: 'Comptes d\'immobilisations',
    [ClassePCG.STOCKS]: 'Comptes de stocks',
    [ClassePCG.TIERS]: 'Comptes de tiers',
    [ClassePCG.FINANCIER]: 'Comptes financiers',
    [ClassePCG.CHARGES]: 'Comptes de charges',
    [ClassePCG.PRODUITS]: 'Comptes de produits',
    [ClassePCG.SPECIAUX]: 'Comptes spéciaux',
    [ClassePCG.ANALYTIQUE]: 'Comptes de comptabilité analytique'
  };

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.accounts$ = this.store.select(selectAccounts);
    this.loading$ = this.store.select(selectAccountLoading);
    this.error$ = this.store.select(selectAccountError);
  }

  ngOnInit(): void {
    this.store.dispatch(AccountingActions.loadAccounts());
  }

  getTypeName(type: TypeCompte): string {
    return this.typeCompteLabels[type] || type;
  }

  getClassePCGName(classe: ClassePCG): string {
    return this.classePCGLabels[classe] || `Classe ${classe}`;
  }

  copyAccount(account: Account): void {
    const nextCode = (parseInt(account.code) + 1).toString().padStart(8, '0');
    
    const accountCopy = {
      ...account,
      name: `${account.name}`,
      code: nextCode,
      codePcgReference: account.codePcgReference || ''
    };
    
    this.router.navigate(['accounting', 'new'], { 
      state: { account: accountCopy }
    });
  }

  confirmDelete(account: Account): void {
    this.selectedAccount = account;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.selectedAccount && this.selectedAccount.id !== undefined) {
      this.store.dispatch(AccountingActions.deleteAccount({ id: this.selectedAccount.id }));
    }
    this.hideDeleteDialog();
  }

  hideDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.selectedAccount = null;
  }
}
