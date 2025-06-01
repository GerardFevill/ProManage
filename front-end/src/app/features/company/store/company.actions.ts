import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Company } from '../models/company.interface';

export const CompanyActions = createActionGroup({
  source: 'Company',
  events: {
    // Load Companies
    'Load Companies': emptyProps(),
    'Load Companies Success': props<{ companies: Company[] }>(),
    'Load Companies Failure': props<{ error: string }>(),

    // Load Single Company
    'Load Company': props<{ id: number }>(),
    'Load Company Success': props<{ company: Company }>(),
    'Load Company Failure': props<{ error: string }>(),

    // Clear Selected Company
    'Clear Selected Company': emptyProps(),

    // Create Company
    'Create Company': props<{ company: Company }>(),
    'Create Company Success': props<{ company: Company }>(),
    'Create Company Failure': props<{ error: string }>(),

    // Update Company
    'Update Company': props<{ id: number; company: Company }>(),
    'Update Company Success': props<{ company: Company }>(),
    'Update Company Failure': props<{ error: string }>(),

    // Delete Company
    'Delete Company': props<{ id: number }>(),
    'Delete Company Success': props<{ id: number }>(),
    'Delete Company Failure': props<{ error: string }>(),
  }
});
