import { Request } from 'express';
import { Pool } from 'pg';

export interface CustomRequest extends Request {
    db: Pool;
    user?: { id: number };
}
