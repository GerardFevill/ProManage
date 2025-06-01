export interface e {
  currentPeriod: {
    assets: BilanSection;
    liabilities: BilanSection;
  };
  previousPeriod: {
    assets: BilanSection;
    liabilities: BilanSection;
  };
}

export interface BilanSection {
  items: BilanItem[];
  total: number;
}

export interface BilanItem {
  category: string;
  amount: number;
  isHeader?: boolean;
  isTotal?: boolean;
}

export interface BilanStructure {
  immobilisations: {
    incorporelles: number;
    corporelles: number;
    financieres: number;
    total: number;
  };
  actifCirculant: {
    stocks: number;
    clients: number;
    etat: number;
    total: number;
  };
  tresorerie: {
    banques: number;
    caisse: number;
    total: number;
  };
  total: number;
}

export interface BilanActifPassif {
  actif: {
    immobilisations: BilanStructure['immobilisations'];
    actifCirculant: BilanStructure['actifCirculant'];
    tresorerie: BilanStructure['tresorerie'];
    total: number;
  };
  passif: {
    capitauxPropres: {
      capital: number;
      resultat: number;
      total: number;
    };
    dettes: {
      emprunts: number;
      fournisseurs: number;
      etat: number;
      total: number;
    };
    total: number;
  };
}

export interface BilanComparison {
  current: BilanActifPassif;
  previous: BilanActifPassif;
}

export interface BilanRow {
  category: string;
  currentAmount: number | null;
  previousAmount: number | null;
  variation: number | null;
  isHeader?: boolean;
  isTotal?: boolean;
  isGrandTotal?: boolean;
}
