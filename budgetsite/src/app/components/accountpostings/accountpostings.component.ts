import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { AccountService } from 'src/app/services/account/account.service';
import { AccountsPostings } from '../../models/accountspostings.model'
import { AccountPostingsService } from '../../services/accountpostings/accountpostings.service';

@Component({
  selector: 'app-accountpostings',
  templateUrl: './accountpostings.component.html',
  styleUrls: ['./accountpostings.component.css']
})
export class AccountPostingsComponent implements OnInit {

  @Input() accountId?: number;
  @Input() reference?: string;

  accountpostings!: AccountsPostings[];
  displayedColumns = ['index', 'date', 'description', 'amount'];
  total: number = 0;
  totalBalance?: number = 0;
  previousBalance?: number = 0;
  totalYields?: number = 0;
  hideProgress: boolean = true;

  constructor(private accountPostingsService: AccountPostingsService, private accountService: AccountService) { }

  ngOnInit(): void {

    this.getTotalAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['accountId']?.currentValue || changes['reference']?.currentValue) {
    if (this.accountId) {

      this.hideProgress = false;

      this.accountPostingsService.read(this.accountId!, this.reference!).subscribe(accountpostings => {

        this.accountpostings = accountpostings;

        this.getTotalAmount();

        this.accountService.getAccountTotals(this.accountId, this.reference).subscribe(account => {

          this.totalBalance = account.totalBalance;
          this.previousBalance = account.previousBalance;
          this.totalYields = account.totalYields;

          this.hideProgress = true;
        });
      });
    }
  }

  getTotalAmount() {

    this.total =
      this.accountpostings ?
        this.accountpostings.map(t => t.amount).reduce((acc, value) => acc + value, 0) :
        0;
  }
}
