import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { Company } from '../models/company.model';
import { CustomRequest } from '../types/express';

/**
 * CompaniesService class that handles CRUD operations for companies.
 */
export class CompaniesService {
    async getAllCompanies(req: CustomRequest): Promise<Company[]> {
        try {
            const result: QueryResult = await req.db.query(
                `SELECT c.*, 
                    json_agg(
                        json_build_object(
                            'id', fy.id,
                            'start_date', fy.start_date,
                            'end_date', fy.end_date,
                            'name', fy.name,
                            'status', fy.status,
                            'notes', fy.notes,
                            'created_at', fy.created_at,
                            'updated_at', fy.updated_at
                        ) ORDER BY fy.start_date DESC
                    ) FILTER (WHERE fy.id IS NOT NULL) as fiscal_years
                FROM company c
                LEFT JOIN fiscal_year fy ON c.id = fy.company_id
                GROUP BY c.id
                ORDER BY c.name`
            );
            return result.rows.map(row => ({
                ...row,
                fiscal_years: row.fiscal_years || []
            }));
        } catch (error) {
            throw new Error(`Error fetching companies: ${(error as Error).message}`);
        }
    }

    async getCompanyById(req: CustomRequest): Promise<Company | null> {
        try {
            const id = req.params.id;
            const result: QueryResult = await req.db.query(
                `SELECT c.*, 
                    json_agg(
                        json_build_object(
                            'id', fy.id,
                            'start_date', fy.start_date,
                            'end_date', fy.end_date,
                            'name', fy.name,
                            'status', fy.status,
                            'notes', fy.notes,
                            'created_at', fy.created_at,
                            'updated_at', fy.updated_at
                        ) ORDER BY fy.start_date DESC
                    ) FILTER (WHERE fy.id IS NOT NULL) as fiscal_years
                FROM company c
                LEFT JOIN fiscal_year fy ON c.id = fy.company_id
                WHERE c.id = $1
                GROUP BY c.id`,
                [id]
            );
            const company = result.rows[0];
            if (company) {
                return {
                    ...company,
                    fiscal_years: company.fiscal_years || []
                };
            }
            return null;
        } catch (error) {
            throw new Error(`Error fetching company: ${(error as Error).message}`);
        }
    }

    async createCompany(req: CustomRequest): Promise<Company> {
        try {
            const { name, address, siret, phone, email } = req.body;
            const result: QueryResult = await req.db.query(
                `INSERT INTO company (name, address, siret, phone, email) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [name, address, siret, phone, email]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating company: ${(error as Error).message}`);
        }
    }

    async updateCompany(req: CustomRequest): Promise<Company | null> {
        try {
            const id = req.params.id;
            const { name, address, siret, phone, email } = req.body;
            
            const result: QueryResult = await req.db.query(
                `UPDATE company
                SET name = $1, address = $2, siret = $3, phone = $4, email = $5, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $6 
                RETURNING *`,
                [name, address, siret, phone, email, id]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating company: ${(error as Error).message}`);
        }
    }

    async deleteCompany(req: CustomRequest): Promise<boolean> {
        try {
            const id = req.params.id;
            const result: QueryResult = await req.db.query(
                'DELETE FROM company WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            throw new Error(`Error deleting company: ${(error as Error).message}`);
        }
    }
}
