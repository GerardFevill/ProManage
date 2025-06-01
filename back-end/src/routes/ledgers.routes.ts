import express, { Router } from 'express';
import { LedgerController } from '../controllers/ledgers.controller';

const router: Router = express.Router();
const ledgerController = new LedgerController();

// Get all ledger entries
router.get('/', (req, res) => ledgerController.getLedgerEntries(req, res));

export default router;
