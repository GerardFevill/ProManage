export interface FiscalYear {
  id?: number;
  companyId: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'closed' | 'pending';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
