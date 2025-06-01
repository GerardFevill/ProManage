import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Company } from '../../models/company.interface';
import { CompanyService } from '../../services/company.service';
import { FiscalYearCardCompactComponent } from '../fiscal-year-card-compact/fiscal-year-card-compact.component';

@Component({
  selector: 'app-fiscal-year-full-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FiscalYearCardCompactComponent],
  templateUrl: './fiscal-year-full-list.component.html',
  styleUrls: ['./fiscal-year-full-list.component.scss']
})
export class FiscalYearFullListComponent implements OnInit {
  company?: Company;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    const companyId = this.route.snapshot.paramMap.get('id');
    if (companyId) {
      this.company = this.companyService.getCompanyById(Number(companyId));
    }
  }
}
