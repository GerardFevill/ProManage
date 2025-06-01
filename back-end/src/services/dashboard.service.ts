import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { DashboardData, FinancialSummary, Transaction, BankAccount } from '../models/dashboard.model';
import { CustomRequest } from '../types/express';

export class DashboardService {
    async getDashboardData(req: CustomRequest): Promise<DashboardData> {
        try {
            const companyId = req.query.companyId;
            const fiscalYearId = req.query.fiscalYearId;

            if (!companyId || !fiscalYearId) {
                throw new Error('Company ID and Fiscal Year ID are required');
            }

            const query = `
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN tl.is_debit THEN tl.amount ELSE 0 END) as total_debits,
                    SUM(CASE WHEN NOT tl.is_debit THEN tl.amount ELSE 0 END) as total_credits
                FROM transaction t
                JOIN transaction_lines tl ON t.id = tl.transaction_id 
                WHERE t.company_id = $1 
                    AND t.fiscal_year_id = $2
            `;

            const result: QueryResult = await req.db.query(query, [companyId, fiscalYearId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw new Error(`Error fetching dashboard data: ${(error as Error).message}`);
        }
    }

    async getRecentTransactions(req: CustomRequest): Promise<Transaction[]> {
        try {
            const companyId = req.query.companyId;
            const fiscalYearId = req.query.fiscalYearId;

            if (!companyId || !fiscalYearId) {
                throw new Error('Company ID and Fiscal Year ID are required');
            }

            const query = `
                SELECT 
                    t.*,
                    a.name as account_name,
                    a.code as account_code,
                    tl.amount,
                    tl.is_debit as type
                FROM transaction t
                JOIN transaction_lines tl ON t.id = tl.transaction_id
                JOIN account a ON tl.account_id = a.id
                WHERE t.company_id = $1 
                    AND t.fiscal_year_id = $2
                ORDER BY t.date DESC
                LIMIT 10
            `;

            const result: QueryResult = await req.db.query(query, [companyId, fiscalYearId]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching recent transactions:', error);
            throw new Error(`Error fetching recent transactions: ${(error as Error).message}`);
        }
    }

    async getFinancialSummary(req: CustomRequest): Promise<FinancialSummary> {
        try {
            const companyId = req.query.companyId;
            const fiscalYearId = req.query.fiscalYearId;

            if (!companyId || !fiscalYearId) {
                throw new Error('Company ID and Fiscal Year ID are required');
            }

            const query = `
                SELECT 
                    date_trunc('month', t.date) as month,
                    SUM(CASE WHEN tl.is_debit THEN tl.amount ELSE 0 END) as total_debits,
                    SUM(CASE WHEN NOT tl.is_debit THEN tl.amount ELSE 0 END) as total_credits,
                    COUNT(DISTINCT t.id) as transaction_count
                FROM transaction t
                JOIN transaction_lines tl ON t.id = tl.transaction_id
                WHERE t.company_id = $1 
                    AND t.fiscal_year_id = $2
            `;

            const result: QueryResult = await req.db.query(query, [companyId, fiscalYearId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching financial summary:', error);
            throw new Error(`Error fetching financial summary: ${(error as Error).message}`);
        }
    }

    async getBankAccounts(req: CustomRequest): Promise<BankAccount[]> {
        try {
            const companyId = req.query.companyId;
            const fiscalYearId = req.query.fiscalYearId;

            if (!companyId || !fiscalYearId) {
                throw new Error('Company ID and Fiscal Year ID are required');
            }

            const query = `
                SELECT 
                    c.id,
                    c.code_pcg_reference as code_pcg_refren,
                    c.name,
                    c.description,
                    c.code,
                    COALESCE(SUM(
                        CASE 
                            WHEN tl.is_debit THEN tl.amount
                            WHEN NOT tl.is_debit THEN -tl.amount
                            ELSE 0 
                        END
                    ), 0) as balance
                FROM account c
                LEFT JOIN transaction_lines tl ON tl.account_id = c.id
                LEFT JOIN transaction t ON t.id = tl.transaction_id
                WHERE c.code_pcg_reference LIKE '512%'
                    AND (t.company_id = $1 OR t.company_id IS NULL)
                    AND (t.fiscal_year_id = $2 OR t.fiscal_year_id IS NULL)
                GROUP BY c.id, c.code_pcg_reference, c.name, c.description, c.code
                ORDER BY c.code ASC
            `;

            const result: QueryResult = await req.db.query(query, [companyId, fiscalYearId]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            throw error;
        }
    }
}
