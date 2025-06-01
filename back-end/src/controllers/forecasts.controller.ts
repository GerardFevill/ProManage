import { Request, Response } from 'express';
import { ForecastsService } from '../services/forecasts.service';

export class ForecastsController {
    private forecastService: ForecastsService;

    constructor() {
        this.forecastService = new ForecastsService();
    }

    async getForecasts(req: Request, res: Response): Promise<void> {
        try {
            const forecasts = await this.forecastService.getAllForecasts(req);
            res.json(forecasts);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async createForecast(req: Request, res: Response): Promise<void> {
        try {
            const newForecast = await this.forecastService.createForecast(req);
            res.status(201).json(newForecast);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    async updateForecast(req: Request, res: Response): Promise<void> {
        try {
            const updatedForecast = await this.forecastService.updateForecast(req);
            res.json(updatedForecast);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }
}
