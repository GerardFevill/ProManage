import express, { Request, Response, Router } from 'express';
import { Pool, QueryResult } from 'pg';
import { CompaniesController } from '../controllers/companies.controller';

// Extend Express Request type to include db
interface CustomRequest extends Request {
  db: Pool;
}

const router: Router = express.Router();
const companyController = new CompaniesController();

// Get all companies
router.get('/', async (req: CustomRequest, res: Response) => companyController.getCompanies(req, res));

// Get specific company
router.get('/:id', (req: CustomRequest, res: Response) => companyController.getCompany(req, res));

// Create company
router.post('/', (req: CustomRequest, res: Response) => companyController.createCompany(req, res));

// Update company
router.put('/:id', (req: CustomRequest, res: Response) => companyController.updateCompany(req, res));

// Delete company
router.delete('/:id', (req: CustomRequest, res: Response) => companyController.deleteCompany(req, res));

export default router;
