import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'balance',
  standalone: true
})
export class BalancePipe implements PipeTransform {
  transform(value: number): string {
    const formatter = new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2
    });
    
    return formatter.format(value);
  }
}
