import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Account } from '../../models/account.interface';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit {
  account$ = new BehaviorSubject<Account | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  deleting$ = new BehaviorSubject<boolean>(false);

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.loadAccount(id);
    }
  }

  private loadAccount(id: number): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.accountService.getAccount(id).subscribe({
      next: (account) => {
        this.account$.next(account);
        this.loading$.next(false);
      },
      error: (error) => {
        this.error$.next(error.message || 'Erreur lors du chargement du compte');
        this.loading$.next(false);
      }
    });
  }

  onDelete(): void {
    const account = this.account$.value;
    if (!account?.id) return;

    this.deleting$.next(true);
    this.error$.next(null);

    this.accountService.deleteAccount(account.id).subscribe({
      next: () => {
        this.deleting$.next(false);
        this.router.navigate(['/accounting']);
      },
      error: (error) => {
        this.error$.next(error.message || 'Erreur lors de la suppression du compte');
        this.deleting$.next(false);
      }
    });
  }
}
