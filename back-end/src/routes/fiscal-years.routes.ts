import express, { Router } from 'express';
import { FiscalYearsController } from '../controllers/fiscal-years.controller';

const router: Router = express.Router();
const fiscalYearController = new FiscalYearsController();

// Get all fiscal years
router.get('/', (req, res) => fiscalYearController.getFiscalYears(req, res));

// Get current fiscal year by company ID
router.get('/company/:companyId/current', (req, res) => fiscalYearController.getCurrentFiscalYear(req, res));

// Get all fiscal years by company ID
router.get('/company/:companyId', (req, res) => fiscalYearController.getFiscalYearsByCompany(req, res));

// Get specific fiscal year
router.get('/:id', (req, res) => fiscalYearController.getFiscalYear(req, res));

// Create fiscal year
router.post('/', (req, res) => fiscalYearController.createFiscalYear(req, res));

// Update fiscal year
router.put('/:id', (req, res) => fiscalYearController.updateFiscalYear(req, res));

// Delete fiscal year
router.delete('/:id', (req, res) => fiscalYearController.deleteFiscalYear(req, res));

export default router;
