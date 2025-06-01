import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FiscalYear } from '../../models/fiscal-year.interface';
import { FiscalYearService } from '../../services/fiscal-year.service';

@Component({
  selector: 'app-fiscal-year-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fiscal-year-form.component.html',
  styleUrls: ['./fiscal-year-form.component.scss']
})
export class FiscalYearFormComponent implements OnInit {
  fiscalYearForm!: FormGroup;
  isEdit = false;
  loading = false;
  companyId!: number;
  fiscalYearId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private fiscalYearService: FiscalYearService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.fiscalYearForm = this.fb.group({
      name: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      notes: ['']
    }, { validators: this.endDateValidator });
  }

  private loadData(): void {
    const companyId = this.route.snapshot.parent?.paramMap.get('id');
    if (!companyId) {
      this.router.navigate(['/companies']);
      return;
    }
    this.companyId = +companyId;

    const fiscalYearId = this.route.snapshot.paramMap.get('fyId');
    if (fiscalYearId) {
      this.isEdit = true;
      this.fiscalYearId = +fiscalYearId;
      this.loadFiscalYear();
    }
  }

  private loadFiscalYear(): void {
    if (!this.fiscalYearId) return;

    this.loading = true;
    this.fiscalYearService.getFiscalYear(this.fiscalYearId).subscribe({
      next: (fiscalYear) => {
        this.fiscalYearForm.patchValue({
          name: fiscalYear.name,
          startDate: this.formatDateForInput(fiscalYear.startDate),
          endDate: this.formatDateForInput(fiscalYear.endDate),
          status: fiscalYear.status,
          notes: fiscalYear.notes
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading fiscal year:', error);
        this.loading = false;
      }
    });
  }

  private formatDateForInput(date: Date | string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private endDateValidator(group: FormGroup): { [key: string]: any } | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && new Date(end) <= new Date(start)) {
      return { endDateInvalid: true };
    }

    return null;
  }

  get name() { return this.fiscalYearForm.get('name'); }
  get startDate() { return this.fiscalYearForm.get('startDate'); }
  get endDate() { return this.fiscalYearForm.get('endDate'); }
  get status() { return this.fiscalYearForm.get('status'); }

  onSubmit(): void {
    if (this.fiscalYearForm.invalid) return;

    const fiscalYear: FiscalYear = {
      ...this.fiscalYearForm.value,
      companyId: this.companyId,
      id: this.fiscalYearId
    };

    this.loading = true;
    const operation = this.isEdit
      ? this.fiscalYearService.updateFiscalYear(fiscalYear)
      : this.fiscalYearService.createFiscalYear(fiscalYear);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error saving fiscal year:', error);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
