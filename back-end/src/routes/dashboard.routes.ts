import express, { Router, Request, Response } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { CustomRequest } from '../types/express';

const router: Router = express.Router();
const dashboardController = new DashboardController();

// Get dashboard data
router.get('/', (req: CustomRequest, res: Response) => dashboardController.getDashboardData(req, res));

// Get recent transactions
router.get('/transactions', (req: CustomRequest, res: Response) => dashboardController.getRecentTransactions(req, res));

// Get financial summary
router.get('/summary', (req: CustomRequest, res: Response) => dashboardController.getFinancialSummary(req, res));

// Get bank accounts
router.get('/bank-accounts', (req: CustomRequest, res: Response) => dashboardController.getBankAccounts(req, res));

export default router;
