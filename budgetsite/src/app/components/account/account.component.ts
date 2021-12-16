import { Component, OnInit } from '@angular/core';
import { Accounts } from 'src/app/models/accounts.model';
import { AccountService } from 'src/app/services/account/account.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  accounts?: Accounts[];
  accountId?: number;
  reference?: string;
  account!: Accounts;
  monthName: string = "";
  hideProgress: boolean = false;
  buttonName: string = "";

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {

    this.accountService.read().subscribe(accounts => {

      this.accounts = accounts;

      this.hideProgress = true;
    });
  }

  getAccountTotals(account: Accounts) {

    if (account) {

      this.buttonName = account.name;
      this.hideProgress = false;

      this.accountId = account.id;
      this.account = account;
    }

    this.hideProgress = true;
  }
}
