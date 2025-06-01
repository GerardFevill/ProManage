import { FiscalYear } from "../../fiscal-year/models/fiscal-year.interface";

export enum ClassePCG {
  CAPITAUX = 1,        // Comptes de capitaux
  IMMOBILISATIONS = 2, // Comptes d'immobilisations
  STOCKS = 3,          // Comptes de stocks et en-cours
  TIERS = 4,          // Comptes de tiers
  FINANCIER = 5,      // Comptes financiers
  CHARGES = 6,        // Comptes de charges
  PRODUITS = 7,       // Comptes de produits
  SPECIAUX = 8,       // Comptes spéciaux
  ANALYTIQUE = 9      // Comptes de comptabilité analytique
}

export enum TypeCompte {
  ACTIF = 'ACTIF',
  PASSIF = 'PASSIF',
  CHARGE = 'CHARGE',
  PRODUIT = 'PRODUIT',
  CAPITAUX_PROPRES = 'CAPITAUX_PROPRES'
}

export interface Account {
  id?: number;
  code: string;           // Code comptable PCG (ex: 401, 411, etc.)
  name: string;           // Libellé du compte
  type: TypeCompte;       // Type de compte
  classePcg: ClassePCG;   // Classe PCG (1 à 9)
  parentId?: number;      // ID du compte parent (pour la hiérarchie)
  description?: string;   // Description optionnelle
  isActive: boolean;      // Statut du compte
  isAuxiliaire: boolean; // Indique si c'est un compte auxiliaire
  codePcgReference?: string; // Code PCG de référence (pour traçabilité)
  lettrage?: string;     // Code de lettrage pour le rapprochement
  createdAt: Date;       // Date de création
  updatedAt: Date;       // Date de dernière modification
}

export interface ComptePCGReference {
  code: string;          // Code PCG officiel
  libelle: string;       // Libellé officiel du PCG
  classe: ClassePCG;     // Classe PCG
  description?: string;  // Description détaillée
  isCollectif: boolean; // Indique si c'est un compte collectif
}
