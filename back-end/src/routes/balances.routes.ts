import express, { Router } from 'express';
import { BalancesController } from '../controllers/balances.controller';

const router: Router = express.Router();
const balancesController = new BalancesController();

// Get general balance
router.get('/', (req, res) => balancesController.getBalance(req, res));

// Get balance by company
router.get('/company/:companyId', (req, res) => balancesController.getBalanceByCompany(req, res));

// Get balance by period
router.get('/period', (req, res) => balancesController.getBalanceByPeriod(req, res));

export default router;
