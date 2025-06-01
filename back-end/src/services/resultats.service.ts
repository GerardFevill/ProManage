import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { CustomRequest } from '../types/express';

export class ResultatsService {
    /**
     * Calcule le résultat global à partir des transactions
     */
    async getResultat(req: CustomRequest): Promise<any[]> {
        if (!req.db) {
            throw new Error('Database connection not available');
        }

        try {
            const result: QueryResult = await req.db.query(
                `WITH revenue_accounts AS (
                    -- Classe 7 du PCG : Comptes de produits (revenus)
                    -- Inclut : Ventes de produits, prestations de services, produits financiers
                    SELECT id FROM account WHERE classe_pcg_id = 7
                ),
                expense_accounts AS (
                    -- Classe 6 du PCG : Comptes de charges (dépenses)
                    -- Inclut : Achats, services extérieurs, charges de personnel, charges financières
                    SELECT id FROM account WHERE classe_pcg_id = 6
                )
                SELECT 
                    t.date,
                    t.company_id,
                    t.fiscal_year_id,
                    c.name as company_name,
                    fy.name as fiscal_year_name,
                    -- Calcul des produits (crédit - débit pour les comptes de produits)
                    COALESCE(SUM(CASE 
                        WHEN tl.account_id IN (SELECT id FROM revenue_accounts) THEN 
                            CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                        ELSE 0
                    END), 0) as total_revenue,
                    -- Calcul des charges (débit - crédit pour les comptes de charges)
                    COALESCE(SUM(CASE 
                        WHEN tl.account_id IN (SELECT id FROM expense_accounts) THEN 
                            CASE WHEN tl.is_debit THEN tl.amount ELSE -tl.amount END
                        ELSE 0
                    END), 0) as total_expenses,
                    -- Calcul du résultat net (produits - charges)
                    COALESCE(SUM(CASE 
                        WHEN tl.account_id IN (SELECT id FROM revenue_accounts) THEN 
                            CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                        WHEN tl.account_id IN (SELECT id FROM expense_accounts) THEN 
                            CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                        ELSE 0
                    END), 0) as net_result
                FROM transaction t
                JOIN transaction_lines tl ON t.id = tl.transaction_id
                LEFT JOIN company c ON t.company_id = c.id
                LEFT JOIN fiscal_year fy ON t.fiscal_year_id = fy.id
                -- Exclure les prévisions pour n'avoir que les transactions réelles
                WHERE NOT t.is_forecast
                GROUP BY t.date, t.company_id, t.fiscal_year_id, c.name, fy.name
                ORDER BY t.date DESC`
            );
            return result.rows;
        } catch (error) {
            throw new Error(`Error calculating resultat: ${(error as Error).message}`);
        }
    }

    /**
     * Calcule les résultats pour une période donnée
     */
    async getResultatByPeriod(req: CustomRequest): Promise<any> {
        if (!req.db) {
            throw new Error('Database connection not available');
        }

        const { startDate, endDate, startDateN1, endDateN1, companyId } = req.query;

        if (!startDate || !endDate || !companyId) {
            throw new Error('Missing required parameters: startDate, endDate, or companyId');
        }

        try {
            const result: QueryResult = await req.db.query(
                `WITH account_balances AS (
                    -- Calcul des soldes pour la période N
                    SELECT 
                        a.code_pcg_reference,
                        a.name as account_name,
                        SUBSTRING(a.code_pcg_reference, 1, 1) as classe_pcg,
                        SUBSTRING(a.code_pcg_reference, 1, 2) as sous_classe_pcg,
                        COALESCE(SUM(CASE 
                            WHEN t.date BETWEEN $1 AND $2 THEN
                                CASE WHEN tl.is_debit THEN tl.amount ELSE -tl.amount END
                            ELSE 0
                        END), 0) as montant_n,
                        COALESCE(SUM(CASE 
                            WHEN t.date BETWEEN $3 AND $4 THEN
                                CASE WHEN tl.is_debit THEN tl.amount ELSE -tl.amount END
                            ELSE 0
                        END), 0) as montant_n1
                    FROM account a
                    LEFT JOIN transaction_lines tl ON a.id = tl.account_id
                    LEFT JOIN transaction t ON tl.transaction_id = t.id
                    WHERE t.company_id = $5
                    AND NOT t.is_forecast
                    AND a.code_pcg_reference IS NOT NULL
                    GROUP BY a.code_pcg_reference, a.name
                )
                SELECT json_build_object(
                    'produits', json_build_object(
                        'exploitation', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE WHEN classe_pcg = '7' THEN -montant_n ELSE montant_n END,
                                'montantN1', CASE WHEN classe_pcg = '7' THEN -montant_n1 ELSE montant_n1 END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '7' 
                            AND sous_classe_pcg IN ('70', '71', '72', '74', '75', '78', '79')
                        ),
                        'financiers', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE WHEN classe_pcg = '7' THEN -montant_n ELSE montant_n END,
                                'montantN1', CASE WHEN classe_pcg = '7' THEN -montant_n1 ELSE montant_n1 END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '7' 
                            AND sous_classe_pcg IN ('76', '78')
                            AND code_pcg_reference LIKE '78%'
                        ),
                        'exceptionnels', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE WHEN classe_pcg = '7' THEN -montant_n ELSE montant_n END,
                                'montantN1', CASE WHEN classe_pcg = '7' THEN -montant_n1 ELSE montant_n1 END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '7' 
                            AND sous_classe_pcg IN ('77', '78')
                            AND code_pcg_reference LIKE '78%'
                        )
                    ),
                    'charges', json_build_object(
                        'exploitation', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE 
                                    WHEN montant_n >= 0 THEN montant_n
                                    ELSE -montant_n 
                                END,
                                'montantN1', CASE 
                                    WHEN montant_n1 >= 0 THEN montant_n1
                                    ELSE -montant_n1 
                                END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '6' 
                            AND sous_classe_pcg IN ('60', '61', '62', '63', '64', '65', '68')
                            AND code_pcg_reference NOT LIKE '68[67]%'
                        ),
                        'financieres', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE 
                                    WHEN montant_n >= 0 THEN montant_n
                                    ELSE -montant_n 
                                END,
                                'montantN1', CASE 
                                    WHEN montant_n1 >= 0 THEN montant_n1
                                    ELSE -montant_n1 
                                END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '6' 
                            AND (sous_classe_pcg = '66' OR code_pcg_reference LIKE '686%')
                        ),
                        'exceptionnelles', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE 
                                    WHEN montant_n >= 0 THEN montant_n
                                    ELSE -montant_n 
                                END,
                                'montantN1', CASE 
                                    WHEN montant_n1 >= 0 THEN montant_n1
                                    ELSE -montant_n1 
                                END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '6' 
                            AND (sous_classe_pcg = '67' OR code_pcg_reference LIKE '687%')
                        ),
                        'impots', (
                            SELECT json_agg(json_build_object(
                                'accountId', code_pcg_reference::integer,
                                'accountName', account_name,
                                'montantN', CASE 
                                    WHEN montant_n >= 0 THEN montant_n
                                    ELSE -montant_n 
                                END,
                                'montantN1', CASE 
                                    WHEN montant_n1 >= 0 THEN montant_n1
                                    ELSE -montant_n1 
                                END,
                                'level', 0
                            ))
                            FROM account_balances
                            WHERE classe_pcg = '6' 
                            AND sous_classe_pcg = '69'
                        )
                    )
                ) as resultat`,
                [
                    startDate, 
                    endDate, 
                    startDateN1 || startDate,  // Si N-1 n'est pas fourni, utiliser la même période
                    endDateN1 || endDate,      // Si N-1 n'est pas fourni, utiliser la même période
                    companyId
                ]
            );
            return result.rows[0].resultat;
        } catch (error) {
            throw new Error(`Error calculating resultat by period: ${(error as Error).message}`);
        }
    }

    /**
     * Calcule les résultats pour une entreprise donnée
     */
    async getResultatByCompany(req: CustomRequest): Promise<any[]> {
        if (!req.db) {
            throw new Error('Database connection not available');
        }

        const { companyId } = req.params;

        if (!companyId) {
            throw new Error('Company ID is required');
        }

        try {
            const result: QueryResult = await req.db.query(
                `WITH revenue_accounts AS (
                    -- Classe 7 du PCG : Comptes de produits
                    -- 70 : Ventes de produits et services
                    -- 71 : Production stockée
                    -- 72 : Production immobilisée
                    -- 74 : Subventions d'exploitation
                    -- 75 : Autres produits de gestion courante
                    -- 76 : Produits financiers
                    -- 77 : Produits exceptionnels
                    -- 78 : Reprises sur amortissements et provisions
                    -- 79 : Transferts de charges
                    SELECT id FROM account WHERE classe_pcg_id = 7
                ),
                expense_accounts AS (
                    -- Classe 6 du PCG : Comptes de charges
                    -- 60 : Achats
                    -- 61 : Services extérieurs
                    -- 62 : Autres services extérieurs
                    -- 63 : Impôts, taxes et versements assimilés
                    -- 64 : Charges de personnel
                    -- 65 : Autres charges de gestion courante
                    -- 66 : Charges financières
                    -- 67 : Charges exceptionnelles
                    -- 68 : Dotations aux amortissements et provisions
                    -- 69 : Participation des salariés, impôts sur les bénéfices
                    SELECT id FROM account WHERE classe_pcg_id = 6
                )
                SELECT 
                    t.fiscal_year_id,
                    fy.name as fiscal_year_name,
                    fy.start_date as fiscal_year_start,
                    fy.end_date as fiscal_year_end,
                    -- Calcul des produits (crédit - débit pour les comptes de produits)
                    COALESCE(SUM(CASE 
                        WHEN tl.account_id IN (SELECT id FROM revenue_accounts) THEN 
                            CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                        ELSE 0
                    END), 0) as total_revenue,
                    -- Calcul des charges (débit - crédit pour les comptes de charges)
                    COALESCE(SUM(CASE 
                        WHEN tl.account_id IN (SELECT id FROM expense_accounts) THEN 
                            CASE WHEN tl.is_debit THEN tl.amount ELSE -tl.amount END
                        ELSE 0
                    END), 0) as total_expenses,
                    -- Calcul du résultat net (produits - charges)
                    COALESCE(SUM(CASE 
                        WHEN tl.account_id IN (SELECT id FROM revenue_accounts) THEN 
                            CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                        WHEN tl.account_id IN (SELECT id FROM expense_accounts) THEN 
                            CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                        ELSE 0
                    END), 0) as net_result
                FROM transaction t
                JOIN transaction_lines tl ON t.id = tl.transaction_id
                LEFT JOIN fiscal_year fy ON t.fiscal_year_id = fy.id
                WHERE t.company_id = $1
                AND NOT t.is_forecast
                GROUP BY t.fiscal_year_id, fy.name, fy.start_date, fy.end_date
                ORDER BY fy.start_date DESC`,
                [companyId]
            );
            return result.rows;
        } catch (error) {
            throw new Error(`Error calculating resultat by company: ${(error as Error).message}`);
        }
    }

    /**
     * Calcule le résultat pour une année fiscale spécifique
     */
    async getResultatByFiscalYear(req: CustomRequest): Promise<any[]> {
        if (!req.db) {
            throw new Error('Database connection not available');
        }

        const { fiscalYearId, companyId } = req.query;

        if (!fiscalYearId || !companyId) {
            throw new Error('Fiscal year ID and company ID are required');
        }

        try {
            const result: QueryResult = await req.db.query(
                `WITH revenue_accounts AS (
                    -- Classe 7 du PCG : Comptes de produits
                    -- 70 : Ventes de produits et services
                    -- 71 : Production stockée
                    -- 72 : Production immobilisée
                    -- 74 : Subventions d'exploitation
                    -- 75 : Autres produits de gestion courante
                    -- 76 : Produits financiers
                    -- 77 : Produits exceptionnels
                    -- 78 : Reprises sur amortissements et provisions
                    -- 79 : Transferts de charges
                    SELECT id FROM account WHERE classe_pcg_id = 7
                ),
                expense_accounts AS (
                    -- Classe 6 du PCG : Comptes de charges
                    -- 60 : Achats
                    -- 61 : Services extérieurs
                    -- 62 : Autres services extérieurs
                    -- 63 : Impôts, taxes et versements assimilés
                    -- 64 : Charges de personnel
                    -- 65 : Autres charges de gestion courante
                    -- 66 : Charges financières
                    -- 67 : Charges exceptionnelles
                    -- 68 : Dotations aux amortissements et provisions
                    -- 69 : Participation des salariés, impôts sur les bénéfices
                    SELECT id FROM account WHERE classe_pcg_id = 6
                ),
                monthly_results AS (
                    SELECT 
                        DATE_TRUNC('month', t.date) as month,
                        -- Calcul des produits (crédit - débit pour les comptes de produits)
                        COALESCE(SUM(CASE 
                            WHEN tl.account_id IN (SELECT id FROM revenue_accounts) THEN 
                                CASE WHEN tl.is_debit THEN -tl.amount ELSE tl.amount END
                            ELSE 0
                        END), 0) as monthly_revenue,
                        -- Calcul des charges (débit - crédit pour les comptes de charges)
                        COALESCE(SUM(CASE 
                            WHEN tl.account_id IN (SELECT id FROM expense_accounts) THEN 
                                CASE WHEN tl.is_debit THEN tl.amount ELSE -tl.amount END
                            ELSE 0
                        END), 0) as monthly_expenses
                    FROM transaction t
                    JOIN transaction_lines tl ON t.id = tl.transaction_id
                    WHERE t.fiscal_year_id = $1 
                    AND t.company_id = $2
                    AND NOT t.is_forecast
                    GROUP BY DATE_TRUNC('month', t.date)
                )
                -- Calcul des résultats mensuels et cumulés
                SELECT 
                    month,
                    monthly_revenue,
                    monthly_expenses,
                    monthly_revenue - monthly_expenses as monthly_net_result,
                    SUM(monthly_revenue) OVER (ORDER BY month) as cumulative_revenue,
                    SUM(monthly_expenses) OVER (ORDER BY month) as cumulative_expenses,
                    SUM(monthly_revenue - monthly_expenses) OVER (ORDER BY month) as cumulative_net_result
                FROM monthly_results
                ORDER BY month`,
                [fiscalYearId, companyId]
            );
            return result.rows;
        } catch (error) {
            throw new Error(`Error calculating resultat by fiscal year: ${(error as Error).message}`);
        }
    }
}
