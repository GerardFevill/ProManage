import { Request, Response } from 'express';
import { CompaniesService } from '../services/companies.service';

export class CompaniesController {
    private companiesService: CompaniesService;

    constructor() {
        this.companiesService = new CompaniesService();
    }

    async getCompanies(req: Request, res: Response): Promise<void> {
        try {
            const companies = await this.companiesService.getAllCompanies(req);
            res.json(companies);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async getCompany(req: Request, res: Response): Promise<void> {
        try {
            const company = await this.companiesService.getCompanyById(req);
            if (company) {
                res.json(company);
            } else {
                res.status(404).json({ message: 'Company not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async createCompany(req: Request, res: Response): Promise<void> {
        try {
            const newCompany = await this.companiesService.createCompany(req);
            res.status(201).json(newCompany);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async updateCompany(req: Request, res: Response): Promise<void> {
        try {
            const updatedCompany = await this.companiesService.updateCompany(req);
            if (updatedCompany) {
                res.json(updatedCompany);
            } else {
                res.status(404).json({ message: 'Company not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async deleteCompany(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.companiesService.deleteCompany(req);
            if (deleted) {
                res.json({ message: 'Company deleted successfully' });
            } else {
                res.status(404).json({ message: 'Company not found' });
            }
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
