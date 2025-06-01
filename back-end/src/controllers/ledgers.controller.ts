import { Request, Response } from 'express';
import { LedgerFilter, LedgersService } from '../services/ledgers.service';
import { CustomRequest } from '../types/express';

export class LedgerController {
    private ledgersService: LedgersService;

    constructor() {
        this.ledgersService = new LedgersService();
    }

    async getLedgerEntries(req: Request, res: Response): Promise<void> {
        try {
            const filters: LedgerFilter = {
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
                companyId: req.query.companyId ? Number(req.query.companyId) : undefined,
                fiscalYearId: req.query.fiscalYearId ? Number(req.query.fiscalYearId) : undefined
            };
            const entries = await this.ledgersService.getLedger(req as CustomRequest, filters);
            res.json(entries);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
