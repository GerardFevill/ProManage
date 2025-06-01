import express, { Router } from 'express';
import { TransactionsController } from '../controllers/transactions.controller';

const router: Router = express.Router();
const transactionsController = new TransactionsController();

// Get all transactions
router.get('/', (req, res) => transactionsController.getTransactions(req, res));

// Create transaction
router.post('/', (req, res) => transactionsController.createTransaction(req, res));

export default router;
