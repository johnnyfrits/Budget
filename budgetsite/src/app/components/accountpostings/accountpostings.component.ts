import { Component, OnInit, Input, SimpleChanges, Inject } from '@angular/core';
import { AccountsPostings } from '../../models/accountspostings.model'
import { AccountService } from 'src/app/services/account/account.service';
import { AccountPostingsService } from '../../services/accountpostings/accountpostings.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  editing: boolean = false;

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
            this.getAccountTotals();
          },
          error: () => this.hideProgress = true
        });
    }
  }

  getAccountTotals() {

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
  }

  getTotalAmount() {

    this.total =
      this.accountpostings ?
        this.accountpostings.map(t => t.amount).reduce((acc, value) => acc + value, 0) :
        0;
  }

  add() {

    this.editing = false;

    const dialogRef = this.dialog.open(AccountPostingsDialog, {
      width: '400px',
      data: {
        date: new Date(),
        reference: this.reference,
        accountId: this.accountId,
        editing: this.editing,
        type: "R"
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        result.amount = result.amount * (result.type === 'P' ? -1 : 1);

        this.accountPostingsService.create(result).subscribe(
          {
            next: accountpostings => {

              this.accountpostings.push(accountpostings);

              this.getTotalAmount();
              this.getAccountTotals();
            },
            error: () => this.hideProgress = true
          }
        );
      }
    });
  }

  editOrDelete(accountPosting: AccountsPostings) {

    this.editing = true;

    const dialogRef = this.dialog.open(AccountPostingsDialog, {
      width: '400px',
      data: {
        id: accountPosting.id,
        accountId: accountPosting.accountId,
        date: accountPosting.date,
        reference: accountPosting.reference,
        description: accountPosting.description,
        amount: accountPosting.amount,
        note: accountPosting.note,
        editing: this.editing,
        deleting: false,
        type: accountPosting.type
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        if (result.deleting) {

          this.accountPostingsService.delete(result.id).subscribe(
            {
              next: () => {

                this.accountpostings = this.accountpostings.filter(t => t.id! != result.id!);

                this.getTotalAmount();
                this.getAccountTotals();
              },
              error: () => this.hideProgress = true
            }
          );
        } else {

          result.amount = Math.abs(result.amount) * (result.type === 'P' ? -1 : 1);

          this.accountPostingsService.update(result).subscribe(
            {
              next: () => {

                this.accountpostings.filter(t => t.id === result.id).map(t => {
                  t.date = result.date;
                  t.accountId = result.accountId;
                  t.reference = result.reference;
                  t.description = result.description;
                  t.amount = result.amount;
                  t.note = result.note;
                  t.type = result.type;
                });

                this.getTotalAmount();
                this.getAccountTotals();
              },
              error: () => this.hideProgress = true
            }
          );
        }
      }
    });
  }
}

@Component({
  selector: 'accountpostings-dialog',
  templateUrl: 'accountpostings-dialog.html',
})
export class AccountPostingsDialog implements OnInit {

  accountPostingFormGroup = new FormGroup({

    descriptionFormControl: new FormControl('', Validators.required),
    amountFormControl: new FormControl('', Validators.required),
    noteFormControl: new FormControl(''),
    typeFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<AccountPostingsDialog>,
    @Inject(MAT_DIALOG_DATA) public accountPosting: AccountsPostings) {
  }

  ngOnInit(): void {

  }

  cancel(): void {

    this.dialogRef.close();
  }

  currentDateChanged(date: Date) {

    this.accountPosting.date = date;
  }

  save(): void {

    this.dialogRef.close(this.accountPosting);
  }

  delete(): void {

    this.accountPosting.deleting = true;

    this.dialogRef.close(this.accountPosting);
  }

  onTypeChange(): void {

    if (this.accountPosting.type === 'Y') {

      this.accountPosting.description = 'Rendimento';
    }
    else {
      if (this.accountPosting.description === 'Rendimento') {

        this.accountPosting.description = '';
      }
    }
  }
}