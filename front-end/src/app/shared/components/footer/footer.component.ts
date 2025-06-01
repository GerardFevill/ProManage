import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectSelectedCompany } from '../../../features/company/store/company.selectors';
import { selectSelectedFiscalYear } from '../../../features/fiscal-year/store/fiscal-year.selectors';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  companyName: string = '';
  fiscalYear: string = '';

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.select(selectSelectedCompany).subscribe(company => {
      this.companyName = company?.name || '';
    });

    this.store.select(selectSelectedFiscalYear).subscribe(fiscalYear => {
      this.fiscalYear = fiscalYear?.name || '';
    });
  }
}
