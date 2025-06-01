import express, { Router } from 'express';
import { BilansController } from '../controllers/bilans.controller';

const router: Router = express.Router();
const bilansController = new BilansController();

// Get bilan for a specific company and fiscal year
router.get('/', (req, res) => bilansController.getBilan(req, res));

// Get bilan comparison with previous fiscal year
router.get('/comparison', (req, res) => bilansController.getBilanComparison(req, res));

export default router;
