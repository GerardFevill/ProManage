import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appAmountColor]',
  standalone: true
})
export class AmountColorDirective implements OnChanges {
  @Input('appAmountColor') amount: number = 0;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['amount']) {
      this.updateColor();
    }
  }

  private updateColor(): void {
    // Supprimer les classes existantes
    this.el.nativeElement.classList.remove('positive', 'negative', 'zero');

    // Ajouter la nouvelle classe selon la valeur
    if (this.amount > 0) {
      this.el.nativeElement.classList.add('positive');
    } else if (this.amount < 0) {
      this.el.nativeElement.classList.add('negative');
    } else {
      this.el.nativeElement.classList.add('zero');
    }
  }
}
