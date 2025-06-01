import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Company } from '../../models/company.interface';
import { CompanyActions } from '../../store/company.actions';
import { selectSelectedCompany, selectCompanyLoading } from '../../store/company.selectors';
import { AppState } from '../../../../store';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit {
  companyForm: FormGroup;
  editMode = false;
  companyId?: number;
  loading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loading$ = this.store.select(selectCompanyLoading);
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      siret: [''],
      legalForm: [''],
      vatNumber: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.companyId = +params['id'];
        this.editMode = true;
        this.store.dispatch(CompanyActions.loadCompany({ id: this.companyId }));
        this.store.select(selectSelectedCompany).subscribe(company => {
          if (company) {
            this.companyForm.patchValue(company);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.companyForm.valid) {
      const company: Company = this.companyForm.value;
      if (this.editMode && this.companyId) {
        this.store.dispatch(CompanyActions.updateCompany({ id: this.companyId, company }));
      } else {
        this.store.dispatch(CompanyActions.createCompany({ company }));
      }

      this.router.navigate(['/companies']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/companies']);
  }
}
