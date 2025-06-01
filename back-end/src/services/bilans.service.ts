import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { CustomRequest } from '../types/express';
import { TypeCompteEnum } from '../models/type-compte.model';
import { BilanData } from '../models/bilan.model';

export class BilansService {
  async getBilan(req: CustomRequest): Promise<BilanData> {
    const { companyId, fiscalYearId } = req.query;
    const { db } = req;

    // Récupérer toutes les transactions pour la période
    const query = `
      WITH account_balances AS (
        SELECT 
          a.id as account_id,
          a.code,
          a.name,
          a.type_id,
          fy.id as fiscal_year_id,
          CASE 
            -- Immobilisations
            WHEN a.code LIKE '20%' THEN 'immo_incorporelles'
            WHEN a.code LIKE '21%' THEN 'immo_corporelles'
            WHEN a.code LIKE '26%' OR a.code LIKE '27%' THEN 'immo_financieres'
            -- Actif Circulant
            WHEN a.code LIKE '31%' OR a.code LIKE '32%' OR a.code LIKE '33%' OR a.code LIKE '34%' OR a.code LIKE '35%' THEN 'stocks'
            WHEN a.code LIKE '37%' THEN 'stocks_en_cours'
            WHEN a.code LIKE '41%' THEN 'clients'
            WHEN a.code LIKE '43%' THEN 'securite_sociale'
            -- TVA - on distingue déductible et collectée
            WHEN a.code LIKE '445%' AND a.type_id = ${TypeCompteEnum.ACTIF} THEN 'etat'
            WHEN a.code LIKE '445%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'etat_passif'
            WHEN a.code LIKE '44%' AND a.type_id = ${TypeCompteEnum.ACTIF} THEN 'etat'
            WHEN a.code LIKE '44%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'etat_passif'
            WHEN a.code LIKE '46%' AND a.type_id = ${TypeCompteEnum.ACTIF} THEN 'debiteurs_divers'
            WHEN a.code LIKE '47%' AND a.type_id = ${TypeCompteEnum.ACTIF} THEN 'comptes_regularisation'
            -- Trésorerie
            WHEN a.code LIKE '50%' THEN 'valeurs_mobilieres'
            WHEN a.code LIKE '51%' AND a.type_id = ${TypeCompteEnum.ACTIF} THEN 'banques'
            WHEN a.code LIKE '53%' THEN 'caisse'
            -- Passif
            WHEN a.code LIKE '10%' THEN 'capital'
            WHEN a.code LIKE '11%' THEN 'report_nouveau'
            WHEN a.code LIKE '12%' THEN 'resultat'
            WHEN a.code LIKE '13%' THEN 'subventions'
            WHEN a.code LIKE '14%' THEN 'provisions_reglementees'
            WHEN a.code LIKE '15%' THEN 'provisions_risques'
            WHEN a.code LIKE '16%' THEN 'emprunts'
            WHEN a.code LIKE '40%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'fournisseurs'
            WHEN a.code LIKE '42%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'personnel'
            WHEN a.code LIKE '43%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'organismes_sociaux'
            WHEN a.code LIKE '45%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'groupe_associes'
            WHEN a.code LIKE '46%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'crediteurs_divers'
            WHEN a.code LIKE '47%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'comptes_regularisation_passif'
            WHEN a.code LIKE '51%' AND a.type_id = ${TypeCompteEnum.PASSIF} THEN 'banques_passif'
            ELSE 'other'
          END as category,
          COALESCE(SUM(
            CASE 
              -- Pour les comptes de TVA (44), on traite différemment selon actif/passif
              WHEN a.code LIKE '44%' THEN
                CASE
                  WHEN a.type_id = ${TypeCompteEnum.PASSIF} THEN
                    CASE 
                      WHEN tl.is_debit THEN -tl.amount 
                      ELSE tl.amount 
                    END
                  ELSE
                    CASE 
                      WHEN tl.is_debit THEN tl.amount 
                      ELSE -tl.amount 
                    END
                END
              -- Pour les autres comptes de passif, comportement normal du passif
              WHEN a.type_id = ${TypeCompteEnum.PASSIF} THEN
                CASE 
                  WHEN tl.is_debit THEN -tl.amount 
                  ELSE tl.amount 
                END
              -- Pour tous les autres comptes, comportement normal
              ELSE
                CASE 
                  WHEN tl.is_debit THEN tl.amount 
                  ELSE -tl.amount 
                END
            END
          ), 0) as balance
        FROM account a
        CROSS JOIN (
          SELECT id, start_date, end_date 
          FROM fiscal_year 
          WHERE id = $2 OR id = (
            SELECT id FROM fiscal_year 
            WHERE company_id = $1 
            AND end_date < (SELECT start_date FROM fiscal_year WHERE id = $2)
            ORDER BY end_date DESC 
            LIMIT 1
          )
        ) fy
        LEFT JOIN transaction_lines tl ON a.id = tl.account_id
        LEFT JOIN transaction t ON tl.transaction_id = t.id
        WHERE t.company_id = $1 
        AND t.fiscal_year_id = fy.id
        AND t.is_forecast = false
        GROUP BY a.id, a.code, a.name, a.type_id, fy.id
      ),
      categorized_balances AS (
        SELECT 
          fiscal_year_id,
          category,
          SUM(balance) as total
        FROM account_balances
        GROUP BY fiscal_year_id, category
      )
      SELECT 
        fiscal_year_id,
        -- Immobilisations détaillées
        MAX(CASE WHEN category = 'immo_incorporelles' THEN total ELSE 0 END) as immo_incorporelles,
        MAX(CASE WHEN category = 'immo_corporelles' THEN total ELSE 0 END) as immo_corporelles,
        MAX(CASE WHEN category = 'immo_financieres' THEN total ELSE 0 END) as immo_financieres,
        -- Actif Circulant détaillé
        MAX(CASE WHEN category = 'stocks' THEN total ELSE 0 END) as stocks,
        MAX(CASE WHEN category = 'stocks_en_cours' THEN total ELSE 0 END) as stocks_en_cours,
        MAX(CASE WHEN category = 'clients' THEN total ELSE 0 END) as clients,
        MAX(CASE WHEN category = 'securite_sociale' THEN total ELSE 0 END) as securite_sociale,
        MAX(CASE WHEN category = 'etat' THEN total ELSE 0 END) as etat,
        MAX(CASE WHEN category = 'debiteurs_divers' THEN total ELSE 0 END) as debiteurs_divers,
        MAX(CASE WHEN category = 'comptes_regularisation' THEN total ELSE 0 END) as comptes_regularisation,
        -- Trésorerie détaillée
        MAX(CASE WHEN category = 'valeurs_mobilieres' THEN total ELSE 0 END) as valeurs_mobilieres,
        MAX(CASE WHEN category = 'banques' THEN total ELSE 0 END) as banques,
        MAX(CASE WHEN category = 'caisse' THEN total ELSE 0 END) as caisse,
        -- Passif détaillé
        MAX(CASE WHEN category = 'capital' THEN total ELSE 0 END) as capital,
        MAX(CASE WHEN category = 'report_nouveau' THEN total ELSE 0 END) as report_nouveau,
        MAX(CASE WHEN category = 'resultat' THEN total ELSE 0 END) as resultat,
        MAX(CASE WHEN category = 'subventions' THEN total ELSE 0 END) as subventions,
        MAX(CASE WHEN category = 'provisions_reglementees' THEN total ELSE 0 END) as provisions_reglementees,
        MAX(CASE WHEN category = 'provisions_risques' THEN total ELSE 0 END) as provisions_risques,
        MAX(CASE WHEN category = 'emprunts' THEN total ELSE 0 END) as emprunts,
        MAX(CASE WHEN category = 'fournisseurs' THEN total ELSE 0 END) as fournisseurs,
        MAX(CASE WHEN category = 'personnel' THEN total ELSE 0 END) as personnel,
        MAX(CASE WHEN category = 'organismes_sociaux' THEN total ELSE 0 END) as organismes_sociaux,
        MAX(CASE WHEN category = 'etat_passif' THEN total ELSE 0 END) as etat_passif,
        MAX(CASE WHEN category = 'groupe_associes' THEN total ELSE 0 END) as groupe_associes,
        MAX(CASE WHEN category = 'crediteurs_divers' THEN total ELSE 0 END) as crediteurs_divers,
        MAX(CASE WHEN category = 'comptes_regularisation_passif' THEN total ELSE 0 END) as comptes_regularisation_passif,
        MAX(CASE WHEN category = 'banques_passif' THEN total ELSE 0 END) as banques_passif
      FROM categorized_balances
      GROUP BY fiscal_year_id
      ORDER BY fiscal_year_id;
    `;

    const result = await db.query(query, [companyId, fiscalYearId]);
    const accounts = result.rows;

    // Calculer les totaux par catégorie
    const bilan: BilanData = {
      actif: {
        immobilisations: {
          incorporelles: 0,
          corporelles: 0,
          financieres: 0,
          total: 0
        },
        actifCirculant: {
          stocks: 0,
          stocks_en_cours: 0,
          clients: 0,
          securite_sociale: 0,
          etat: 0,
          debiteurs_divers: 0,
          comptes_regularisation: 0,
          total: 0
        },
        tresorerie: {
          valeurs_mobilieres: 0,
          banques: 0,
          caisse: 0,
          total: 0
        },
        total: 0
      },
      passif: {
        capitauxPropres: {
          capital: 0,
          report_nouveau: 0,
          resultat: 0,
          subventions: 0,
          provisions_reglementees: 0,
          total: 0
        },
        dettes: {
          provisions_risques: 0,
          emprunts: 0,
          fournisseurs: 0,
          personnel: 0,
          organismes_sociaux: 0,
          etat: 0,
          groupe_associes: 0,
          crediteurs_divers: 0,
          comptes_regularisation: 0,
          total: 0
        },
        tresorerie: {
          banques: 0,
          total: 0
        },
        total: 0
      }
    };

    if (accounts.length > 0) {
      const account = accounts[0];
      
      // Immobilisations
      bilan.actif.immobilisations.incorporelles = parseFloat(account.immo_incorporelles) || 0;
      bilan.actif.immobilisations.corporelles = parseFloat(account.immo_corporelles) || 0;
      bilan.actif.immobilisations.financieres = parseFloat(account.immo_financieres) || 0;
      
      // Actif Circulant
      bilan.actif.actifCirculant.stocks = parseFloat(account.stocks) || 0;
      bilan.actif.actifCirculant.stocks_en_cours = parseFloat(account.stocks_en_cours) || 0;
      bilan.actif.actifCirculant.clients = parseFloat(account.clients) || 0;
      bilan.actif.actifCirculant.securite_sociale = parseFloat(account.securite_sociale) || 0;
      bilan.actif.actifCirculant.etat = parseFloat(account.etat) || 0;
      bilan.actif.actifCirculant.debiteurs_divers = parseFloat(account.debiteurs_divers) || 0;
      bilan.actif.actifCirculant.comptes_regularisation = parseFloat(account.comptes_regularisation) || 0;
      
      // Trésorerie
      bilan.actif.tresorerie.valeurs_mobilieres = parseFloat(account.valeurs_mobilieres) || 0;
      bilan.actif.tresorerie.banques = parseFloat(account.banques) || 0;
      bilan.actif.tresorerie.caisse = parseFloat(account.caisse) || 0;
      
      // Capitaux Propres
      bilan.passif.capitauxPropres.capital = parseFloat(account.capital) || 0;
      bilan.passif.capitauxPropres.report_nouveau = parseFloat(account.report_nouveau) || 0;
      bilan.passif.capitauxPropres.resultat = parseFloat(account.resultat) || 0;
      bilan.passif.capitauxPropres.subventions = parseFloat(account.subventions) || 0;
      bilan.passif.capitauxPropres.provisions_reglementees = parseFloat(account.provisions_reglementees) || 0;
      
      // Dettes
      bilan.passif.dettes.provisions_risques = parseFloat(account.provisions_risques) || 0;
      bilan.passif.dettes.emprunts = parseFloat(account.emprunts) || 0;
      bilan.passif.dettes.fournisseurs = parseFloat(account.fournisseurs) || 0;
      bilan.passif.dettes.personnel = parseFloat(account.personnel) || 0;
      bilan.passif.dettes.organismes_sociaux = parseFloat(account.organismes_sociaux) || 0;
      bilan.passif.dettes.etat = parseFloat(account.etat_passif) || 0;
      bilan.passif.dettes.groupe_associes = parseFloat(account.groupe_associes) || 0;
      bilan.passif.dettes.crediteurs_divers = parseFloat(account.crediteurs_divers) || 0;
      bilan.passif.dettes.comptes_regularisation = parseFloat(account.comptes_regularisation_passif) || 0;
      
      // Trésorerie Passive
      bilan.passif.tresorerie.banques = parseFloat(account.banques_passif) || 0;
      
      // Calculate subtotals
      bilan.actif.immobilisations.total = bilan.actif.immobilisations.incorporelles + 
                                         bilan.actif.immobilisations.corporelles + 
                                         bilan.actif.immobilisations.financieres;
      
      bilan.actif.actifCirculant.total = bilan.actif.actifCirculant.stocks +
                                        bilan.actif.actifCirculant.stocks_en_cours +
                                        bilan.actif.actifCirculant.clients +
                                        bilan.actif.actifCirculant.securite_sociale +
                                        bilan.actif.actifCirculant.etat +
                                        bilan.actif.actifCirculant.debiteurs_divers +
                                        bilan.actif.actifCirculant.comptes_regularisation;
      
      bilan.actif.tresorerie.total = bilan.actif.tresorerie.valeurs_mobilieres +
                                    bilan.actif.tresorerie.banques +
                                    bilan.actif.tresorerie.caisse;
      
      bilan.passif.capitauxPropres.total = bilan.passif.capitauxPropres.capital +
                                          bilan.passif.capitauxPropres.report_nouveau +
                                          bilan.passif.capitauxPropres.resultat +
                                          bilan.passif.capitauxPropres.subventions +
                                          bilan.passif.capitauxPropres.provisions_reglementees;
      
      bilan.passif.dettes.total = bilan.passif.dettes.provisions_risques +
                                 bilan.passif.dettes.emprunts +
                                 bilan.passif.dettes.fournisseurs +
                                 bilan.passif.dettes.personnel +
                                 bilan.passif.dettes.organismes_sociaux +
                                 bilan.passif.dettes.etat +
                                 bilan.passif.dettes.groupe_associes +
                                 bilan.passif.dettes.crediteurs_divers +
                                 bilan.passif.dettes.comptes_regularisation;
      
      bilan.passif.tresorerie.total = bilan.passif.tresorerie.banques;
      
      // Calculate grand totals
      bilan.actif.total = bilan.actif.immobilisations.total + 
                         bilan.actif.actifCirculant.total + 
                         bilan.actif.tresorerie.total;
      
      bilan.passif.total = bilan.passif.capitauxPropres.total + 
                          bilan.passif.dettes.total + 
                          bilan.passif.tresorerie.total;
    }

    return bilan;
  }

  async getBilanComparison(req: CustomRequest): Promise<{ current: BilanData; previous: BilanData | null }> {
    const { companyId, fiscalYearId } = req.query;
    const { db } = req;

    // Récupérer l'exercice fiscal précédent
    const previousFiscalYearQuery = `
      SELECT id, start_date 
      FROM fiscal_year 
      WHERE company_id = $1 
      AND start_date < (
        SELECT start_date 
        FROM fiscal_year 
        WHERE id = $2
      )
      ORDER BY start_date DESC
      LIMIT 1
    `;

    const previousFiscalYear = await db.query(previousFiscalYearQuery, [companyId, fiscalYearId]);

    // Récupérer le bilan actuel
    const currentBilan = await this.getBilan(req);

    // Récupérer le bilan précédent si disponible
    let previousBilan = null;
    if (previousFiscalYear.rows[0]) {
      const modifiedReq = Object.create(req);
      modifiedReq.query = { ...req.query, fiscalYearId: previousFiscalYear.rows[0].id };
      previousBilan = await this.getBilan(modifiedReq);
    }

    return {
      current: currentBilan,
      previous: previousBilan
    };
  }
}
