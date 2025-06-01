import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { FiscalYear } from '../models/fiscalYear.model';
import { CustomRequest } from '../types/express';

export class FiscalYearsService {
    async getAllFiscalYears(req: CustomRequest): Promise<FiscalYear[]> {
        try {
            const companyId = req.query.companyId;
            let query = 'SELECT * FROM fiscal_year';
            let params: any[] = [];

            if (companyId) {
                query += ' WHERE company_id = $1';
                params.push(companyId);
            }

            query += ' ORDER BY start_date DESC';

            const result: QueryResult = await req.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching fiscal years: ${(error as Error).message}`);
        }
    }

    async getFiscalYearById(req: CustomRequest): Promise<FiscalYear | null> {
        try {
            const id = req.params.id;
            const result: QueryResult = await req.db.query(
                'SELECT * FROM fiscal_year WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error fetching fiscal year: ${(error as Error).message}`);
        }
    }

    async getCurrentFiscalYear(req: CustomRequest): Promise<FiscalYear | null> {
        try {
            const companyId = req.params.companyId;
            const result: QueryResult = await req.db.query(
                `SELECT * FROM fiscal_year 
                WHERE company_id = $1 
                AND start_date <= CURRENT_DATE 
                AND end_date >= CURRENT_DATE
                ORDER BY start_date DESC 
                LIMIT 1`,
                [companyId]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error fetching current fiscal year: ${(error as Error).message}`);
        }
    }

    async createFiscalYear(req: CustomRequest): Promise<FiscalYear> {
        try {
            const { start_date, end_date, company_id, name, notes } = req.body;
            const result: QueryResult = await req.db.query(
                `INSERT INTO fiscal_year (start_date, end_date, company_id, name, status, notes) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [start_date, end_date, company_id, name, 'active', notes]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating fiscal year: ${(error as Error).message}`);
        }
    }

    async updateFiscalYear(req: CustomRequest): Promise<FiscalYear | null> {
        try {
            const id = req.params.id;
            const { start_date, end_date, name, status, notes } = req.body;
            
            const result: QueryResult = await req.db.query(
                `UPDATE fiscal_year 
                SET start_date = $1, end_date = $2, name = $3, status = $4, notes = $5, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $6 
                RETURNING *`,
                [start_date, end_date, name, status, notes, id]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating fiscal year: ${(error as Error).message}`);
        }
    }

    async deleteFiscalYear(req: CustomRequest): Promise<boolean> {
        try {
            const id = req.params.id;
            const result: QueryResult = await req.db.query(
                'DELETE FROM fiscal_year WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            throw new Error(`Error deleting fiscal year: ${(error as Error).message}`);
        }
    }

    async getFiscalYearsByCompany(req: CustomRequest): Promise<FiscalYear[]> {
        try {
            const companyId = req.params.companyId;
            const result: QueryResult = await req.db.query(
                'SELECT * FROM fiscal_year WHERE company_id = $1 ORDER BY start_date DESC',
                [companyId]
            );
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching fiscal years by company: ${(error as Error).message}`);
        }
    }
}
