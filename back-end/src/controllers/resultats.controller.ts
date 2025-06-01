import { Request, Response } from 'express';
import { ResultatsService } from '../services/resultats.service';

export class ResultatsController {
    private resultatsService: ResultatsService;

    constructor() {
        this.resultatsService = new ResultatsService();
    }

    async getResultat(req: Request, res: Response): Promise<void> {
        try {
            const resultat = await this.resultatsService.getResultat(req);
            res.json(resultat);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getResultatByPeriod(req: Request, res: Response): Promise<void> {
        try {
            const resultat = await this.resultatsService.getResultatByPeriod(req);
            res.json(resultat);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getResultatByCompany(req: Request, res: Response): Promise<void> {
        try {
            const resultat = await this.resultatsService.getResultatByCompany(req);
            res.json(resultat);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getResultatByFiscalYear(req: Request, res: Response): Promise<void> {
        try {
            const resultat = await this.resultatsService.getResultatByFiscalYear(req);
            res.json(resultat);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
