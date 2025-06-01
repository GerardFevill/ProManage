import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { Transaction, TransactionLine } from '../models/transaction.model';
import { CustomRequest } from '../types/express';

export class TransactionsService {
    async getAllTransactions(req: CustomRequest): Promise<Transaction[]> {
        try {
            const companyId = req.query.companyId;
            const fiscalYearId = req.query.fiscalYearId;

            let params: any[] = [];
            let whereClause = '';

            if (companyId) {
                params.push(companyId);
                whereClause += `t.company_id = $${params.length}`;
            }

            if (fiscalYearId) {
                params.push(fiscalYearId);
                whereClause += ` AND t.fiscal_year_id = $${params.length}`;
            }

            const query = `
                SELECT t.*,
                    COALESCE(json_agg(
                        json_build_object(
                            'id', tl.id,
                            'transaction_id', tl.transaction_id,
                            'account_id', tl.account_id,
                            'is_debit', tl.is_debit,
                            'amount', tl.amount,
                            'description', tl.description,
                            'created_at', tl.created_at
                        ) ORDER BY tl.id
                    ) FILTER (WHERE tl.id IS NOT NULL), '[]') as lines
                FROM transaction t
                LEFT JOIN transaction_lines tl ON t.id = tl.transaction_id
                WHERE ${whereClause}
                GROUP BY t.id
                ORDER BY t.date DESC, t.created_at DESC
            `;

            const result: QueryResult = await req.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching transactions: ${(error as Error).message}`);
        }
    }

    async getTransactionById(req: CustomRequest): Promise<Transaction | null> {
        try {
            const id = req.params.id;
            const query = `
                SELECT t.*,
                    COALESCE(json_agg(
                        json_build_object(
                            'id', tl.id,
                            'transaction_id', tl.transaction_id,
                            'account_id', tl.account_id,
                            'is_debit', tl.is_debit,
                            'amount', tl.amount,
                            'description', tl.description,
                            'created_at', tl.created_at
                        ) ORDER BY tl.id
                    ) FILTER (WHERE tl.id IS NOT NULL), '[]') as lines
                FROM transaction t
                LEFT JOIN transaction_lines tl ON t.id = tl.transaction_id
                WHERE t.id = $1
                GROUP BY t.id`;

            const result: QueryResult = await req.db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error fetching transaction: ${(error as Error).message}`);
        }
    }

    async createTransaction(req: CustomRequest): Promise<Transaction> {
        const client = await req.db.connect();
        try {
            await client.query('BEGIN');

            const {
                date,
                description,
                reference,
                company_id,
                fiscal_year_id,
                lines
            } = req.body;

            // Créer la transaction
            const transactionResult: QueryResult = await client.query(
                `INSERT INTO transaction 
                (date, description, reference, company_id, fiscal_year_id) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [date, description, reference, company_id, fiscal_year_id]
            );

            const transaction = transactionResult.rows[0];

            // Insérer les lignes de transaction
            if (lines && lines.length > 0) {
                const lineValues = lines.map((line: TransactionLine) => {
                    return `(${transaction.id}, ${line.account_id}, ${line.is_debit}, ${line.amount}, ${line.description ? `'${line.description}'` : 'NULL'})`;
                }).join(', ');

                await client.query(`
                    INSERT INTO transaction_lines 
                    (transaction_id, account_id, is_debit, amount, description)
                    VALUES ${lineValues}
                `);
            }

            await client.query('COMMIT');
            req.params = { id: transaction.id };
            const createdTransaction = await this.getTransactionById(req);
            if (!createdTransaction) {
                throw new Error('Transaction was created but could not be retrieved');
            }
            return createdTransaction;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Error creating transaction: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }

    async updateTransaction(req: CustomRequest): Promise<Transaction | null> {
        const client = await req.db.connect();
        try {
            await client.query('BEGIN');

            const id = req.params.id;
            const {
                date,
                description,
                reference,
                lines
            } = req.body;

            // Mettre à jour la transaction
            await client.query(
                `UPDATE transaction 
                SET date = $1, description = $2, reference = $3,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $5`,
                [date, description, reference, id]
            );

            // Supprimer les anciennes lignes
            await client.query('DELETE FROM transaction_lines WHERE transaction_id = $1', [id]);

            // Insérer les nouvelles lignes
            if (lines && lines.length > 0) {
                const lineValues = lines.map((line: TransactionLine) => {
                    return `(${id}, ${line.account_id}, ${line.is_debit}, ${line.amount}, ${line.description ? `'${line.description}'` : 'NULL'})`;
                }).join(', ');

                await client.query(`
                    INSERT INTO transaction_lines 
                    (transaction_id, account_id, is_debit, amount, description)
                    VALUES ${lineValues}
                `);
            }

            await client.query('COMMIT');
            req.params = { id };
            return this.getTransactionById(req);
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Error updating transaction: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }

    async deleteTransaction(req: CustomRequest): Promise<boolean> {
        const client = await req.db.connect();
        try {
            await client.query('BEGIN');

            const id = req.params.id;
            // Supprimer d'abord les lignes de transaction
            await client.query('DELETE FROM transaction_lines WHERE transaction_id = $1', [id]);
            // Puis supprimer la transaction
            const result: QueryResult = await client.query(
                'DELETE FROM transaction WHERE id = $1 RETURNING id',
                [id]
            );

            await client.query('COMMIT');
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Error deleting transaction: ${(error as Error).message}`);
        } finally {
            client.release();
        }
    }

    async getTransactionsByAccount(req: CustomRequest): Promise<Transaction[]> {
        try {
            const accountId = req.params.accountId;
            const query = `
                SELECT DISTINCT t.*,
                    COALESCE(json_agg(
                        json_build_object(
                            'id', tl.id,
                            'transaction_id', tl.transaction_id,
                            'account_id', tl.account_id,
                            'is_debit', tl.is_debit,
                            'amount', tl.amount,
                            'description', tl.description,
                            'created_at', tl.created_at
                        ) ORDER BY tl.id
                    ) FILTER (WHERE tl.id IS NOT NULL), '[]') as lines
                FROM transaction t
                LEFT JOIN transaction_lines tl ON t.id = tl.transaction_id
                WHERE EXISTS (
                    SELECT 1 FROM transaction_lines tl2 
                    WHERE tl2.transaction_id = t.id 
                    AND tl2.account_id = $1
                )
                GROUP BY t.id
                ORDER BY t.date DESC, t.created_at DESC`;

            const result: QueryResult = await req.db.query(query, [accountId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching transactions by account: ${(error as Error).message}`);
        }
    }

    async getAccountBalance(req: CustomRequest): Promise<{ balance: number }> {
        try {
            const accountId = req.params.accountId;
            const result: QueryResult = await req.db.query(
                `SELECT 
                    COALESCE(SUM(CASE WHEN tl.account_id = $1 AND tl.is_debit THEN tl.amount ELSE 0 END), 0) -
                    COALESCE(SUM(CASE WHEN tl.account_id = $1 AND NOT tl.is_debit THEN tl.amount ELSE 0 END), 0) as balance
                FROM transaction_lines tl
                WHERE tl.account_id = $1`,
                [accountId]
            );
            return { balance: parseFloat(result.rows[0].balance) };
        } catch (error) {
            throw new Error(`Error calculating account balance: ${(error as Error).message}`);
        }
    }
}
