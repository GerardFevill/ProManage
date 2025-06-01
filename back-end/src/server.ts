import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import accountsRoutes from './routes/accounts.routes';
import balancesRoutes from './routes/balances.routes';
import bilansRoutes from './routes/bilans.routes';
import dashboardRoutes from './routes/dashboard.routes';
import fiscalYearsRoutes from './routes/fiscal-years.routes';
import forecastsRoutes from './routes/forecasts.routes';
import ledgersRoutes from './routes/ledgers.routes';
import profilesRoutes from './routes/profiles.routes';
import projectsRoutes from './routes/projects.routes';
import resultatsRoutes from './routes/resultats.routes';
import transactionsRoutes from './routes/transactions.routes';
import companiesRoutes from './routes/companies.routes';

dotenv.config();

const app: Express = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'promanage_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Extend Express Request type to include db
declare global {
  namespace Express {
    interface Request {
      db: Pool;
    }
  }
}

// Make db pool available in req object
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.db = pool;
  next();
});

// Routes
app.use('/api/accounts', accountsRoutes);
app.use('/api/balances', balancesRoutes);
app.use('/api/bilans', bilansRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fiscal-years', fiscalYearsRoutes);
app.use('/api/forecasts', forecastsRoutes);
app.use('/api/ledger', ledgersRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/resultats', resultatsRoutes);
app.use('/api/transactions', transactionsRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
