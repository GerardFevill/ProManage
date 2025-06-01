import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Account, TypeCompte, ClassePCG } from '../../models/account.interface';
import { AccountService } from '../../services/account.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss']
})
export class AccountFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private store = inject(Store<AppState>);

  accountForm: FormGroup;
  isEditing = false;
  private editingId?: number;

  typeCompteOptions = Object.values(TypeCompte);
  classePCGOptions = Object.values(ClassePCG).filter(value => typeof value === 'number');

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const accountData = navigation?.extras?.state?.['account'];

    this.accountForm = this.fb.group({
      code: [accountData?.code || '', [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]],
      name: [accountData?.name || '', Validators.required],
      type: [accountData?.type || '', Validators.required],
      classePcg: [accountData?.classePcg || '', [
        Validators.required,
        Validators.min(1),
        Validators.max(9)
      ]],
      isAuxiliaire: [false],
      description: [accountData?.description || ''],
      isActive: [true],
      parentId: [null],
      codePcgReference: [accountData?.codePcgReference || ''],
      lettrage: [accountData?.lettrage || '']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId = Number(id);
      this.accountService.getAccount(this.editingId).subscribe({
        next: (account) => {
          this.isEditing = true;
          this.updateForm(account);
        },
        error: () => {
          this.router.navigate(['../..'], { relativeTo: this.route });
        }
      });
    }
  }

  private updateForm(account: Account) {
    this.accountForm.patchValue({
      code: account.code,
      name: account.name,
      type: account.type,
      classePcg: account.classePcg,
      isAuxiliaire: account.isAuxiliaire,
      description: account.description,
      isActive: account.isActive,
      parentId: account.parentId,
      codePcgReference: account.codePcgReference,
      lettrage: account.lettrage
    });
  }

  onSubmit() {
    if (this.accountForm.valid) {
      const formValue = this.accountForm.value;
      
      const account: Account = {
        ...formValue,
        code: String(formValue.code),
        classePcg: Number(formValue.classePcg),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (this.isEditing && this.editingId) {
        this.accountService.updateAccount(this.editingId, account).subscribe({
          next: () => this.router.navigate(['../..'], { relativeTo: this.route }),
          error: (error) => {
            console.error('Erreur lors de la mise à jour du compte', error);
          }
        });
      } else {
        this.accountService.createAccount(account).subscribe({
          next: () => this.router.navigate(['..'], { relativeTo: this.route }),
          error: (error) => {
            console.error('Erreur lors de la création du compte', error);
          }
        });
      }
    }
  }

  onCancel() {
    if (this.isEditing) {
      this.router.navigate(['../..'], { relativeTo: this.route });
    } else {
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  getClasseLibelle(classe: number): string {
    switch (classe) {
      case ClassePCG.CAPITAUX:
        return 'Comptes de capitaux';
      case ClassePCG.IMMOBILISATIONS:
        return 'Comptes d\'immobilisations';
      case ClassePCG.STOCKS:
        return 'Comptes de stocks';
      case ClassePCG.TIERS:
        return 'Comptes de tiers';
      case ClassePCG.FINANCIER:
        return 'Comptes financiers';
      case ClassePCG.CHARGES:
        return 'Comptes de charges';
      case ClassePCG.PRODUITS:
        return 'Comptes de produits';
      case ClassePCG.SPECIAUX:
        return 'Comptes spéciaux';
      case ClassePCG.ANALYTIQUE:
        return 'Comptes de comptabilité analytique';
      default:
        return '';
    }
  }
}
