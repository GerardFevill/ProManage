import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { CustomRequest } from '../types/express';

export class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    async getDashboardData(req: CustomRequest, res: Response): Promise<void> {
        try {
            const dashboardData = await this.dashboardService.getDashboardData(req);
            res.json(dashboardData);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getRecentTransactions(req: CustomRequest, res: Response): Promise<void> {
        try {
            const transactions = await this.dashboardService.getRecentTransactions(req);
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getFinancialSummary(req: CustomRequest, res: Response): Promise<void> {
        try {
            const summary = await this.dashboardService.getFinancialSummary(req);
            res.json(summary);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getBankAccounts(req: CustomRequest, res: Response): Promise<void> {
        try {
            const accounts = await this.dashboardService.getBankAccounts(req);
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
