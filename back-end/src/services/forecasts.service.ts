import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { Forecast } from '../models/forecast.model';
import { CustomRequest } from '../types/express';

export class ForecastsService {
    async getAllForecasts(req: CustomRequest): Promise<Forecast[]> {
        try {
            const companyId = req.query.companyId;
            const fiscalYearId = req.query.fiscalYearId;

            let params: any[] = [];
            let whereClause = 'WHERE is_forecast = true';

            if (companyId) {
                params.push(companyId);
                whereClause += ` AND company_id = $${params.length}`;
            }

            if (fiscalYearId) {
                params.push(fiscalYearId);
                whereClause += ` AND fiscal_year_id = $${params.length}`;
            }

            const query = `
                SELECT * 
                FROM transactions t
                ${whereClause}
                ORDER BY t.date DESC
            `;

            const result: QueryResult = await req.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching forecasts: ${(error as Error).message}`);
        }
    }

    async createForecast(req: CustomRequest): Promise<Forecast> {
        try {
            const { date, amount, description, company_id, fiscal_year_id } = req.body;
            const result: QueryResult = await req.db.query(
                `INSERT INTO transactions 
                (date, amount, description, company_id, fiscal_year_id, is_forecast) 
                VALUES ($1, $2, $3, $4, $5, true) 
                RETURNING *`,
                [date, amount, description, company_id, fiscal_year_id]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating forecast: ${(error as Error).message}`);
        }
    }

    async updateForecast(req: CustomRequest): Promise<Forecast> {
        try {
            const id = req.params.id;
            const { date, amount, description } = req.body;
            
            const result: QueryResult = await req.db.query(
                `UPDATE transactions 
                SET date = $1, amount = $2, description = $3, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $4 AND is_forecast = true 
                RETURNING *`,
                [date, amount, description, id]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Forecast not found');
            }
            
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error updating forecast: ${(error as Error).message}`);
        }
    }
}
