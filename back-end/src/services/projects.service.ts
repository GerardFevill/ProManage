import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { Project } from '../models/project.model';
import { CustomRequest } from '../types/express';

export class ProjectsService {
    async getProjects(req: CustomRequest): Promise<Project[]> {
        try {
            const companyId = req.query.companyId;
            let query = 'SELECT * FROM projects';
            const params: any[] = [];

            if (companyId) {
                query += ' WHERE company_id = $1';
                params.push(companyId);
            }

            query += ' ORDER BY created_at DESC';

            const result: QueryResult = await req.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching projects: ${(error as Error).message}`);
        }
    }

    async getProjectById(req: CustomRequest): Promise<Project | null> {
        try {
            const id = req.params.id;
            const result: QueryResult = await req.db.query(
                'SELECT * FROM projects WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error fetching project: ${(error as Error).message}`);
        }
    }

    async createProject(req: CustomRequest): Promise<Project> {
        try {
            const { 
                name, 
                description, 
                start_date, 
                end_date, 
                budget, 
                company_id,
                status 
            } = req.body;

            const result: QueryResult = await req.db.query(
                `INSERT INTO projects 
                (name, description, start_date, end_date, budget, company_id, status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *`,
                [name, description, start_date, end_date, budget, company_id, status]
            );
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error creating project: ${(error as Error).message}`);
        }
    }

    async updateProject(req: CustomRequest): Promise<Project | null> {
        try {
            const id = req.params.id;
            const { 
                name, 
                description, 
                start_date, 
                end_date, 
                budget,
                status 
            } = req.body;

            const result: QueryResult = await req.db.query(
                `UPDATE projects 
                SET name = $1, description = $2, start_date = $3, end_date = $4, 
                    budget = $5, status = $6, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $7 
                RETURNING *`,
                [name, description, start_date, end_date, budget, status, id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating project: ${(error as Error).message}`);
        }
    }

    async deleteProject(req: CustomRequest): Promise<boolean> {
        try {
            const id = req.params.id;
            const result: QueryResult = await req.db.query(
                'DELETE FROM projects WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            throw new Error(`Error deleting project: ${(error as Error).message}`);
        }
    }
}
