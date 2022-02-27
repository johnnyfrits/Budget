import { Component, OnInit, Input, SimpleChanges, Inject } from '@angular/core';
import { AccountsPostings } from '../../models/accountspostings.model'
import { AccountService } from 'src/app/services/account/account.service';
import { AccountPostingsService } from '../../services/accountpostings/accountpostings.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Scroll } from './../../common/scroll';

@Component({
  selector: 'app-accountpostings',
  templateUrl: './accountpostings.component.html',
  styleUrls: ['./accountpostings.component.scss']
})
export class AccountPostingsComponent implements OnInit {

  @Input() accountId?: number;
  @Input() reference?: string;

  accountpostings!: AccountsPostings[];
  displayedColumns = ['index', 'date', 'description', 'amount', 'runningAmount'];
  total: number = 0;
  grandTotalBalance?: number = 0;
  totalBalance?: number = 0;
  previousBalance?: number = 0;
  totalYields?: number = 0;
  hideProgress: boolean = true;
  editing: boolean = false;
  maxBalance: number = 0;
  minBalance: number = 0;

  constructor(
    private accountPostingsService: AccountPostingsService,
    private accountService: AccountService,
    public dialog: MatDialog,
    private Scroll: Scroll
  ) { }

  ngOnInit(): void {

    this.getTotalAmount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['accountId']?.currentValue || changes['reference']?.currentValue) {

    this.refresh();
  }

  refresh() {

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

          this.grandTotalBalance = account.grandTotalBalance;
          this.totalBalance = account.totalBalance;
          this.previousBalance = account.previousBalance;
          this.totalYields = account.totalYields;

          let runningValue = this.previousBalance ?? 0;

          this.minBalance = runningValue;
          this.maxBalance = 0;

          this.accountpostings.forEach(accountposting => {

            accountposting.runningAmount = runningValue += accountposting.amount;

            this.minBalance = accountposting.runningAmount < this.minBalance ?
              accountposting.runningAmount :
              this.minBalance;

            this.maxBalance = accountposting.runningAmount > this.maxBalance ?
              accountposting.runningAmount :
              this.maxBalance;
          });

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

        result.position = this.accountpostings.length + 1;

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
        position: accountPosting.position,
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

                this.accountpostings = [...this.accountpostings.filter(ap => ap.reference === this.reference)];

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

  drop(event: CdkDragDrop<any[]>) {

    const previousIndex = this.accountpostings.findIndex(row => row === event.item.data);

    moveItemInArray(this.accountpostings, previousIndex, event.currentIndex);

    this.accountpostings = this.accountpostings.slice();

    this.accountpostings.forEach((accountposting, index) => {

      accountposting.position = index + 1;

    });

    this.accountPostingsService.updatePositions(this.accountpostings).subscribe();
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
    else if (this.accountPosting.type === 'C') {

      this.accountPosting.description = 'Troco';
    }
    else {
      if (this.accountPosting.description === 'Rendimento' ||
        this.accountPosting.description === 'Troco') {

        this.accountPosting.description = '';
      }
    }
  }

  setTitle() {

    return 'Lançamento - ' + (this.accountPosting.editing ? 'Editar' : 'Incluir');
  }
}