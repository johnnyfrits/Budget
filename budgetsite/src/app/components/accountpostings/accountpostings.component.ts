import { Component, OnInit, Input, SimpleChanges, Inject } from '@angular/core';
import { AccountsPostings } from '../../models/accountspostings.model'
import { AccountService } from 'src/app/services/account/account.service';
import { AccountPostingsService } from '../../services/accountpostings/accountpostings.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';

let moment = _rollupMoment || _moment;

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

  constructor(
    private accountPostingsService: AccountPostingsService,
    private accountService: AccountService,
    public dialog: MatDialog) { }

  ngOnInit(): void {

    this.getTotalAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['accountId']?.currentValue || changes['reference']?.currentValue) {
    if (this.accountId) {

      this.hideProgress = false;

      this.accountPostingsService.read(this.accountId!, this.reference!).subscribe(
        {
          next: accountpostings => {

            this.accountpostings = accountpostings;

            this.getTotalAmount();

            this.accountService.getAccountTotals(this.accountId, this.reference).subscribe(
              {
                next: account => {

                  this.totalBalance = account.totalBalance;
                  this.previousBalance = account.previousBalance;
                  this.totalYields = account.totalYields;

                  this.hideProgress = true;
                },
                error: () => this.hideProgress = true
              });
          },
          error: () => this.hideProgress = true
        });
    }
  }

  getTotalAmount() {

    this.total =
      this.accountpostings ?
        this.accountpostings.map(t => t.amount).reduce((acc, value) => acc + value, 0) :
        0;
  }

  edit(accountPosting: AccountsPostings) {

    const dialogRef = this.dialog.open(AccountPostingsDialog, {
      width: '400px',
      data: {
        id: accountPosting.id,
        accountId: accountPosting.accountId,
        date: accountPosting.date,
        reference: accountPosting.reference,
        description: accountPosting.description,
        amount: accountPosting.amount,
        note: accountPosting.note
      }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
}

@Component({
  selector: 'accountpostings-dialog',
  templateUrl: 'accountpostings-dialog.html',
})
export class AccountPostingsDialog implements OnInit {

  date = new FormControl(moment());

  constructor(
    public dialogRef: MatDialogRef<AccountPostingsDialog>,
    @Inject(MAT_DIALOG_DATA) public accountPosting: AccountsPostings) {
  }

  ngOnInit(): void {

    this.date.setValue(moment(this.accountPosting.date));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  currentDateChanged(date: Date) {

    this.accountPosting.date = date;
  }
}