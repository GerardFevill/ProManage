export interface TypeCompte {
    id: number;
    name: string;
    code: string;
    created_at: Date;
    updated_at: Date;
}

// Constants that match the database values
export enum TypeCompteEnum {
    ACTIF = 1,
    PASSIF = 2,
    CHARGE = 3,
    PRODUIT = 4,
    CAPITAUX_PROPRES = 5
}
