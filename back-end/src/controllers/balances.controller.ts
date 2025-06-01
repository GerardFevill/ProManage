import { Request, Response } from 'express';
import { BalancesService } from '../services/balances.service';

export class BalancesController {
    private balancesService: BalancesService;

    constructor() {
        this.balancesService = new BalancesService();
    }

    async getBalance(req: Request, res: Response): Promise<void> {
        try {
            const balance = await this.balancesService.getBalance(req);
            res.json(balance);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getBalanceByCompany(req: Request, res: Response): Promise<void> {
        try {
            const balance = await this.balancesService.getBalanceByCompany(req);
            res.json(balance);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getBalanceByPeriod(req: Request, res: Response): Promise<void> {
        try {
            const balance = await this.balancesService.getBalanceByPeriod(req);
            res.json(balance);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
