import { Request, Response } from 'express';
import { TransactionsService } from '../services/transactions.service';

export class TransactionsController {
    private transactionsService: TransactionsService;

    constructor() {
        this.transactionsService = new TransactionsService();
    }

    async getTransactions(req: Request, res: Response): Promise<void> {
        try {
            const transactions = await this.transactionsService.getAllTransactions(req);
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async createTransaction(req: Request, res: Response): Promise<void> {
        try {
            const newTransaction = await this.transactionsService.createTransaction(req);
            res.status(201).json(newTransaction);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
