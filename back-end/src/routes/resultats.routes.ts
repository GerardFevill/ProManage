import express, { Router } from 'express';
import { ResultatsController } from '../controllers/resultats.controller';

const router: Router = express.Router();
const resultatController = new ResultatsController();

// Get general resultat
router.get('/', (req, res) => resultatController.getResultat(req, res));

// Get resultat by company
router.get('/company/:companyId', (req, res) => resultatController.getResultatByCompany(req, res));

// Get resultat by period
router.get('/period', (req, res) => resultatController.getResultatByPeriod(req, res));

// Get resultat by fiscal year
router.get('/fiscal-year', (req, res) => resultatController.getResultatByFiscalYear(req, res));

export default router;
