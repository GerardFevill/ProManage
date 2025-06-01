import { Request, Response } from 'express';
import { CustomRequest } from '../types/express';
import { BilansService } from '../services/bilans.service';

export class BilansController {
  private bilansService: BilansService;

  constructor() {
    this.bilansService = new BilansService();
  }

  async getBilan(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { companyId, fiscalYearId } = req.query;
      
      if (!companyId || !fiscalYearId) {
        res.status(400).json({ error: 'Company ID and Fiscal Year ID are required' });
        return;
      }

      const bilan = await this.bilansService.getBilan(req);
      res.json(bilan);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getBilanComparison(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { companyId, fiscalYearId } = req.query;
      
      if (!companyId || !fiscalYearId) {
        res.status(400).json({ error: 'Company ID and Fiscal Year ID are required' });
        return;
      }

      const comparison = await this.bilansService.getBilanComparison(req);
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
