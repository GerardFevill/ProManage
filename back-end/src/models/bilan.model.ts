export interface BilanActif {
    immobilisations: {
        incorporelles: number;
        corporelles: number;
        financieres: number;
        total: number;
    };
    actifCirculant: {
        stocks: number;
        stocks_en_cours: number;
        clients: number;
        securite_sociale: number;
        etat: number;
        debiteurs_divers: number;
        comptes_regularisation: number;
        total: number;
    };
    tresorerie: {
        valeurs_mobilieres: number;
        banques: number;
        caisse: number;
        total: number;
    };
    total: number;
}

export interface BilanPassif {
    capitauxPropres: {
        capital: number;
        report_nouveau: number;
        resultat: number;
        subventions: number;
        provisions_reglementees: number;
        total: number;
    };
    dettes: {
        provisions_risques: number;
        emprunts: number;
        fournisseurs: number;
        personnel: number;
        organismes_sociaux: number;
        etat: number;
        groupe_associes: number;
        crediteurs_divers: number;
        comptes_regularisation: number;
        total: number;
    };
    tresorerie: {
        banques: number;
        total: number;
    };
    total: number;
}

export interface BilanData {
    actif: BilanActif;
    passif: BilanPassif;
}

export interface Bilan {
    id: number;
    company_id: number;
    fiscal_year_id: number;
    data: BilanData;
    created_at: Date;
    updated_at: Date;
}
