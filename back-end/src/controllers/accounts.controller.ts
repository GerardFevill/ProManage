import { Response } from 'express';
import { CustomRequest } from '../types/express';
import { AccountsService } from '../services/accounts.service';

export class AccountsController {
    private accountsService: AccountsService;

    constructor() {
        this.accountsService = new AccountsService();
    }

    async getAccounts(req: CustomRequest, res: Response): Promise<void> {
        try {
            const accounts = await this.accountsService.getAccounts(req);
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getAccountById(req: CustomRequest, res: Response): Promise<void> {
        try {
            const account = await this.accountsService.getAccountById(req);
            if (account) {
                res.json(account);
            } else {
                res.status(404).json({ message: 'Account not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async createAccount(req: CustomRequest, res: Response): Promise<void> {
        try {
            const newAccount = await this.accountsService.createAccount(req);
            res.status(201).json(newAccount);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async updateAccount(req: CustomRequest, res: Response): Promise<void> {
        try {
            const updatedAccount = await this.accountsService.updateAccount(req);
            if (updatedAccount) {
                res.json(updatedAccount);
            } else {
                res.status(404).json({ message: 'Account not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async deleteAccount(req: CustomRequest, res: Response): Promise<void> {
        try {
            const deleted = await this.accountsService.deleteAccount(req);
            if (deleted) {
                res.json({ message: 'Account deleted successfully' });
            } else {
                res.status(404).json({ message: 'Account not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getAccountBalance(req: CustomRequest, res: Response): Promise<void> {
        try {
            const balance = await this.accountsService.getAccountBalance(req);
            res.json(balance);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getAccountTransactions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const transactions = await this.accountsService.getAccountTransactions(req);
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async recordTransaction(req: CustomRequest, res: Response): Promise<void> {
        try {
            const transaction = await this.accountsService.recordTransaction(req);
            res.status(201).json(transaction);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
