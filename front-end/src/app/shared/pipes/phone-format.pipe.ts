import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(phoneNumber: string): string {
    if (!phoneNumber) {
      return '';
    }

    // Supprimer tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format français : XX XX XX XX XX
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    // Format international
    if (cleaned.length > 10 && cleaned.startsWith('33')) {
      const withoutCountryCode = cleaned.substring(2);
      if (withoutCountryCode.length === 9) {
        return '+33 ' + withoutCountryCode.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      }
    }
    
    // Si le format ne correspond pas aux cas ci-dessus, retourner tel quel avec des espaces tous les 2 chiffres
    return cleaned.replace(/(\d{2})/g, '$1 ').trim();
  }
}
