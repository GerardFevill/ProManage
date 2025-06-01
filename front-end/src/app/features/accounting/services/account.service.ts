import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Account, ComptePCGReference, TypeCompte, ClassePCG } from '../models/account.interface';
import { environment } from '../../../../environments/environment';

interface AccountDTO {
  id: number;
  code: string;
  name: string;
  type_id: number;
  type_name: string;
  classe_pcg_id: number;
  classe_name: string;
  parent_id?: number;
  description?: string;
  is_active: boolean;
  is_auxiliaire: boolean;
  code_pcg_reference?: string;
  lettrage?: string;
  created_at: string;
  updated_at: string;
}

interface AccountHierarchyDTO extends AccountDTO {
  path: string;
  id_path: number[];
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/accounts`;

  private typeToId: Record<TypeCompte, number> = {
    [TypeCompte.ACTIF]: 1,
    [TypeCompte.PASSIF]: 2,
    [TypeCompte.CHARGE]: 3,
    [TypeCompte.PRODUIT]: 4,
    [TypeCompte.CAPITAUX_PROPRES]: 5
  };

  private idToType: Record<number, TypeCompte> = {
    1: TypeCompte.ACTIF,
    2: TypeCompte.PASSIF,
    3: TypeCompte.CHARGE,
    4: TypeCompte.PRODUIT,
    5: TypeCompte.CAPITAUX_PROPRES
  };

  private typeToName: Record<TypeCompte, string> = {
    [TypeCompte.ACTIF]: 'Actif',
    [TypeCompte.PASSIF]: 'Passif',
    [TypeCompte.CHARGE]: 'Charge',
    [TypeCompte.PRODUIT]: 'Produit',
    [TypeCompte.CAPITAUX_PROPRES]: 'Capitaux Propres'
  };

  private classePCGToName: Record<ClassePCG, string> = {
    [ClassePCG.CAPITAUX]: 'Comptes de capitaux',
    [ClassePCG.IMMOBILISATIONS]: 'Comptes d\'immobilisations',
    [ClassePCG.STOCKS]: 'Comptes de stocks',
    [ClassePCG.TIERS]: 'Comptes de tiers',
    [ClassePCG.FINANCIER]: 'Comptes financiers',
    [ClassePCG.CHARGES]: 'Comptes de charges',
    [ClassePCG.PRODUITS]: 'Comptes de produits',
    [ClassePCG.SPECIAUX]: 'Comptes spéciaux',
    [ClassePCG.ANALYTIQUE]: 'Comptes de comptabilité analytique'
  };

  constructor(private http: HttpClient) {}

  private mapDtoToAccount(dto: AccountDTO): Account {
    return {
      id: dto.id,
      code: dto.code,
      name: dto.name,
      type: this.idToType[dto.type_id] || TypeCompte.ACTIF,
      classePcg: dto.classe_pcg_id as ClassePCG,
      parentId: dto.parent_id,
      description: dto.description,
      isActive: dto.is_active,
      isAuxiliaire: dto.is_auxiliaire,
      codePcgReference: dto.code_pcg_reference,
      lettrage: dto.lettrage,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at)
    };
  }

  private mapAccountToDto(account: Partial<Account>): Omit<AccountDTO, 'id' | 'created_at' | 'updated_at'> {
    if (!account.type) {
      throw new Error('Le type de compte est requis');
    }

    if (!account.classePcg) {
      throw new Error('La classe PCG est requise');
    }

    return {
      code: account.code || '',
      name: account.name || '',
      type_id: this.typeToId[account.type],
      type_name: this.typeToName[account.type],
      classe_pcg_id: account.classePcg,
      classe_name: this.classePCGToName[account.classePcg],
      parent_id: account.parentId,
      description: account.description,
      is_active: account.isActive ?? true,
      is_auxiliaire: account.isAuxiliaire ?? false,
      code_pcg_reference: account.codePcgReference,
      lettrage: account.lettrage
    };
  }

  // Récupérer tous les comptes
  getAccounts(): Observable<Account[]> {
    return this.http.get<AccountDTO[]>(`${this.apiUrl}`)
      .pipe(
        map(dtos => dtos.map(dto => this.mapDtoToAccount(dto)))
      );
  }

  // Récupérer un compte spécifique
  getAccount(id: number): Observable<Account> {
    return this.http.get<AccountDTO>(`${this.apiUrl}/${id}`)
      .pipe(
        map(dto => this.mapDtoToAccount(dto))
      );
  }

  // Créer un nouveau compte
  createAccount(account: Account): Observable<Account> {
    const dto = this.mapAccountToDto(account);
    return this.http.post<AccountDTO>(`${this.apiUrl}`, dto)
      .pipe(
        map(responseDto => this.mapDtoToAccount(responseDto))
      );
  }

  // Mettre à jour un compte
  updateAccount(id: number, account: Account): Observable<Account> {
    const dto = this.mapAccountToDto(account);
    return this.http.put<AccountDTO>(`${this.apiUrl}/${id}`, dto)
      .pipe(
        map(responseDto => this.mapDtoToAccount(responseDto))
      );
  }

  // Supprimer un compte
  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer la hiérarchie des comptes
  getAccountHierarchy(): Observable<Account[]> {
    return this.http.get<AccountHierarchyDTO[]>(`${this.apiUrl}/accounts-hierarchy`)
      .pipe(
        map(dtos => dtos.map(dto => ({
          ...this.mapDtoToAccount(dto),
          path: dto.path,
          idPath: dto.id_path,
          level: dto.level
        })))
      );
  }

  // Récupérer les classes PCG
  getClassesPCG(): Observable<{ id: number; name: string; description?: string }[]> {
    return this.http.get<{ id: number; name: string; description?: string }[]>(`${this.apiUrl}/classes`);
  }

  // Récupérer les types de compte
  getTypes(): Observable<{ id: number; name: TypeCompte }[]> {
    return this.http.get<{ id: number; name: TypeCompte }[]>(`${this.apiUrl}/types`);
  }

  // Récupérer les références PCG
  getPCGReferences(): Observable<ComptePCGReference[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pcg-references`)
      .pipe(
        map(refs => refs.map(ref => ({
          code: ref.code,
          libelle: ref.libelle,
          classe: ref.classe_id as ClassePCG,
          description: ref.description,
          isCollectif: ref.is_collectif
        })))
      );
  }

  // Récupérer une référence PCG spécifique
  getPCGReference(code: string): Observable<ComptePCGReference> {
    return this.http.get<any>(`${this.apiUrl}/pcg-references/${code}`)
      .pipe(
        map(ref => ({
          code: ref.code,
          libelle: ref.libelle,
          classe: ref.classe_id as ClassePCG,
          description: ref.description,
          isCollectif: ref.is_collectif
        }))
      );
  }
}
