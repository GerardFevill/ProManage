export interface Account {
  id: number;
  code: string;
  name: string;
  type?: string;
  companyId: number;
}

export interface CreateAccountDto {
  code: string;
  name: string;
  type?: string;
  companyId: number;
}
