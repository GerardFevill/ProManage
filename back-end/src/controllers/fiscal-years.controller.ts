import { Request, Response } from 'express';
import { FiscalYearsService } from '../services/fiscalYears.service';

export class FiscalYearsController {
    private fiscalYearsService: FiscalYearsService;

    constructor() {
        this.fiscalYearsService = new FiscalYearsService();
    }

    async getFiscalYears(req: Request, res: Response): Promise<void> {
        try {
            const fiscalYears = await this.fiscalYearsService.getAllFiscalYears(req);
            res.json(fiscalYears);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            const fiscalYear = await this.fiscalYearsService.getFiscalYearById(req);
            if (fiscalYear) {
                res.json(fiscalYear);
            } else {
                res.status(404).json({ message: 'Fiscal year not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getCurrentFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            const fiscalYear = await this.fiscalYearsService.getCurrentFiscalYear(req);
            if (fiscalYear) {
                res.json(fiscalYear);
            } else {
                res.status(404).json({ message: 'Current fiscal year not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async createFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            const newFiscalYear = await this.fiscalYearsService.createFiscalYear(req);
            res.status(201).json(newFiscalYear);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async updateFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            const updatedFiscalYear = await this.fiscalYearsService.updateFiscalYear(req);
            if (updatedFiscalYear) {
                res.json(updatedFiscalYear);
            } else {
                res.status(404).json({ message: 'Fiscal year not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async deleteFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.fiscalYearsService.deleteFiscalYear(req);
            if (deleted) {
                res.json({ message: 'Fiscal year deleted successfully' });
            } else {
                res.status(404).json({ message: 'Fiscal year not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getFiscalYearsByCompany(req: Request, res: Response): Promise<void> {
        try {
            const fiscalYears = await this.fiscalYearsService.getFiscalYearsByCompany(req);
            res.json(fiscalYears);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
