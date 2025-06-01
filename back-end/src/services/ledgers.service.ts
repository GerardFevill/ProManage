import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { CustomRequest } from '../types/express';

export interface LedgerEntry {
    date: Date;
    reference: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    lettrage?: string;
}

export interface AccountLedger {
    accountId: number;
    accountCode: string;
    accountName: string;
    accountType: number;
    classePcg: number;
    isAuxiliaire: boolean;
    codePcgReference?: string;
    entries: LedgerEntry[];
    totalDebit: number;
    totalCredit: number;
    balance: number;
}

export interface LedgerFilter {
    startDate?: string;
    endDate?: string;
    accountId?: number;
    companyId?: number;
    fiscalYearId?: number;
    isAuxiliaire?: boolean;
    typeId?: number;
    classePcgId?: number;
}

export class LedgersService {
    async getLedger(req: CustomRequest, filters: LedgerFilter): Promise<AccountLedger[]> {
        try {
            // Construction de la requête de base
            let query = `
                WITH RECURSIVE account_hierarchy AS (
                    SELECT DISTINCT
                        a.id, 
                        a.parent_id, 
                        a.code, 
                        a.name,
                        a.type_id,
                        a.classe_pcg_id,
                        a.is_auxiliaire,
                        a.code_pcg_reference,
                        a.lettrage,
                        a.is_active
                    FROM account a
                    INNER JOIN transaction_lines tl ON tl.account_id = a.id
                    INNER JOIN transaction t ON t.id = tl.transaction_id
                    WHERE t.company_id = $1
                        AND a.is_active = true
                        ${filters.accountId ? 'AND a.id = $5' : ''}
                        ${filters.typeId ? 'AND a.type_id = $6' : ''}
                        ${filters.classePcgId ? 'AND a.classe_pcg_id = $7' : ''}
                        ${filters.isAuxiliaire !== undefined ? 'AND a.is_auxiliaire = $8' : ''}
                    
                    UNION ALL
                    
                    SELECT 
                        a.id, 
                        a.parent_id, 
                        a.code, 
                        a.name,
                        a.type_id,
                        a.classe_pcg_id,
                        a.is_auxiliaire,
                        a.code_pcg_reference,
                        a.lettrage,
                        a.is_active
                    FROM account a
                    INNER JOIN account_hierarchy ah ON a.parent_id = ah.id
                    WHERE a.is_active = true
                ),
                transactions_with_lines AS (
                    SELECT 
                        t.id as transaction_id,
                        t.date,
                        t.reference,
                        t.description as transaction_description,
                        tl.account_id,
                        tl.is_debit,
                        tl.amount,
                        tl.description as line_description,
                        a.name as account_name,
                        a.code as account_code,
                        a.type_id as account_type,
                        a.classe_pcg_id,
                        a.is_auxiliaire,
                        a.code_pcg_reference,
                        a.lettrage,
                        fy.status as fiscal_year_status
                    FROM transaction t
                    INNER JOIN transaction_lines tl ON t.id = tl.transaction_id
                    INNER JOIN account_hierarchy a ON tl.account_id = a.id
                    INNER JOIN fiscal_year fy ON t.fiscal_year_id = fy.id
                    WHERE t.company_id = $1
                    ${filters.fiscalYearId ? 'AND t.fiscal_year_id = $2' : ''}
                    ${filters.startDate ? 'AND t.date >= $3' : ''}
                    ${filters.endDate ? 'AND t.date <= $4' : ''}
                    ORDER BY t.date ASC, t.id ASC
                )
                SELECT 
                    account_id,
                    account_code,
                    account_name,
                    account_type,
                    classe_pcg_id,
                    is_auxiliaire,
                    code_pcg_reference,
                    lettrage,
                    date,
                    reference,
                    COALESCE(transaction_description, line_description) as description,
                    CASE WHEN is_debit THEN amount ELSE 0 END as debit,
                    CASE WHEN NOT is_debit THEN amount ELSE 0 END as credit,
                    fiscal_year_status
                FROM transactions_with_lines
                ORDER BY date ASC, transaction_id ASC;
            `;

            // Préparation des paramètres
            const params: any[] = [filters.companyId];
            if (filters.fiscalYearId) params.push(filters.fiscalYearId);
            if (filters.startDate) params.push(filters.startDate);
            if (filters.endDate) params.push(filters.endDate);
            if (filters.accountId) params.push(filters.accountId);
            if (filters.typeId) params.push(filters.typeId);
            if (filters.classePcgId) params.push(filters.classePcgId);
            if (filters.isAuxiliaire !== undefined) params.push(filters.isAuxiliaire);

            // Exécution de la requête
            const result: QueryResult = await req.db.query(query, params);

            // Organisation des résultats par compte
            const accountsMap = new Map<number, AccountLedger>();

            for (const row of result.rows) {
                if (!accountsMap.has(row.account_id)) {
                    accountsMap.set(row.account_id, {
                        accountId: row.account_id,
                        accountCode: row.account_code,
                        accountName: row.account_name,
                        accountType: row.account_type,
                        classePcg: row.classe_pcg_id,
                        isAuxiliaire: row.is_auxiliaire,
                        codePcgReference: row.code_pcg_reference,
                        entries: [],
                        totalDebit: 0,
                        totalCredit: 0,
                        balance: 0
                    });
                }

                const account = accountsMap.get(row.account_id)!;
                const debit = parseFloat(row.debit) || 0;
                const credit = parseFloat(row.credit) || 0;

                // Calcul du solde progressif
                account.totalDebit += debit;
                account.totalCredit += credit;
                account.balance = account.totalDebit - account.totalCredit;

                // Ajout de l'entrée
                account.entries.push({
                    date: row.date,
                    reference: row.reference || '',
                    description: row.description || '',
                    debit,
                    credit,
                    balance: account.balance,
                    lettrage: row.lettrage
                });
            }

            return Array.from(accountsMap.values());
        } catch (error) {
            throw new Error(`Error fetching ledger: ${(error as Error).message}`);
        }
    }
}
