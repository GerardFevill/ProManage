import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { Balance } from '../models/balance.model';
import { CustomRequest } from '../types/express';

export class BalancesService {
    async getBalance(req: CustomRequest): Promise<Balance[]> {
        try {
            const { 
                companyId, 
                fiscalYearId,
                startDate,
                endDate,
                accountId,
                
            } = req.query;

            const params: any[] = [companyId];
            let paramCount = 1;

            let query = `
                WITH RECURSIVE account_hierarchy AS (
                    -- Base case: get all accounts
                    SELECT id, code, name, parent_id, type_id, is_auxiliaire
                    FROM account
                    
                    UNION ALL
                    
                    -- Recursive case: get parent accounts
                    SELECT a.id, a.code, a.name, a.parent_id, a.type_id, a.is_auxiliaire
                    FROM account a
                    INNER JOIN account_hierarchy ah ON a.id = ah.parent_id
                ),
                transaction_entries AS (
                    SELECT 
                        tl.account_id,
                        t.date,
                        CASE 
                            WHEN tl.is_debit THEN tl.amount 
                            ELSE 0 
                        END as debit,
                        CASE 
                            WHEN NOT tl.is_debit THEN tl.amount 
                            ELSE 0 
                        END as credit
                    FROM transaction_lines tl
                    INNER JOIN transaction t ON tl.transaction_id = t.id
                    WHERE t.company_id = $${paramCount}
                    AND t.fiscal_year_id = $${++paramCount}
            `;
            params.push(fiscalYearId);

            if (startDate) {
                query += ` AND t.date >= $${++paramCount}`;
                params.push(startDate);
            }

            if (endDate) {
                query += ` AND t.date <= $${++paramCount}`;
                params.push(endDate);
            }


            query += `
                )
                SELECT 
                    ah.id as account_id,
                    ah.code as account_code,
                    ah.name as account_name,
                    ah.type_id,
                    ah.is_auxiliaire,
                    COALESCE(SUM(te.debit), 0) as total_debit,
                    COALESCE(SUM(te.credit), 0) as total_credit,
                    COALESCE(SUM(te.debit - te.credit), 0) as balance
                FROM account_hierarchy ah
                LEFT JOIN transaction_entries te ON te.account_id = ah.id
            `;

            if (accountId) {
                query += ` WHERE ah.id = $${++paramCount}`;
                params.push(accountId);
            }

            query += `
                GROUP BY ah.id, ah.code, ah.name, ah.type_id, ah.is_auxiliaire
                ORDER BY ah.code
            `;

            const result: QueryResult = await req.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching balance: ${(error as Error).message}`);
        }
    }

    async getBalanceByCompany(req: CustomRequest): Promise<Balance[]> {
        return this.getBalance(req);
    }

    async getBalanceByPeriod(req: CustomRequest): Promise<Balance[]> {
        return this.getBalance(req);
    }
}
