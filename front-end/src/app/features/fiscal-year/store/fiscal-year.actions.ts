import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FiscalYear } from '../models/fiscal-year.interface';

export const FiscalYearActions = createActionGroup({
  source: 'Fiscal Year',
  events: {
    'Load Fiscal Years': props<{ companyId: number }>(),
    'Load Fiscal Years Success': props<{ fiscalYears: FiscalYear[] }>(),
    'Load Fiscal Years Failure': props<{ error: string }>(),

    'Load Fiscal Year': props<{ id: number }>(),
    'Load Fiscal Year Success': props<{ fiscalYear: FiscalYear }>(),
    'Load Fiscal Year Failure': props<{ error: string }>(),

    'Create Fiscal Year': props<{ fiscalYear: FiscalYear }>(),
    'Create Fiscal Year Success': props<{ fiscalYear: FiscalYear }>(),
    'Create Fiscal Year Failure': props<{ error: string }>(),

    'Update Fiscal Year': props<{ fiscalYear: FiscalYear }>(),
    'Update Fiscal Year Success': props<{ fiscalYear: FiscalYear }>(),
    'Update Fiscal Year Failure': props<{ error: string }>(),

    'Delete Fiscal Year': props<{ id: number }>(),
    'Delete Fiscal Year Success': props<{ id: number }>(),
    'Delete Fiscal Year Failure': props<{ error: string }>(),

    'Clear Selected Fiscal Year': emptyProps(),
  },
});
