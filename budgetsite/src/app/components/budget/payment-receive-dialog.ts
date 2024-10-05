import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Accounts } from 'src/app/models/accounts.model';
import { AccountsPostings } from 'src/app/models/accountspostings.model';
import { AccountService } from 'src/app/services/account/account.service';
import { DatepickerinputComponent } from 'src/app/shared/datepickerinput/datepickerinput.component';

@Component({
  selector: 'payment-receive-dialog',
  templateUrl: 'payment-receive-dialog.html',
  styleUrls: ['./budget.component.scss'],
})
export class PaymentReceiveDialog implements OnInit, AfterViewInit {
  @ViewChild('datepickerinput') datepickerinput!: DatepickerinputComponent;

  accountsList?: Accounts[];

  accountPostingFormGroup = new FormGroup({
    descriptionFormControl: new FormControl('', Validators.required),
    amountFormControl: new FormControl('', Validators.required),
    accountFormControl: new FormControl('', Validators.required),
    noteFormControl: new FormControl(''),
    typeFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<PaymentReceiveDialog>,
    @Inject(MAT_DIALOG_DATA) public accountPosting: AccountsPostings,
    private accountService: AccountService,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.accountService.readNotDisabled().subscribe({
      next: (accounts) => {
        this.accountsList = accounts;

        if (
          this.accountPosting.type == 'P' &&
          localStorage.getItem('accountIdPayExpense') != null
        ) {
          this.accountPosting.accountId = +localStorage.getItem(
            'accountIdPayExpense'
          )!;
        } else if (
          this.accountPosting.type == 'R' &&
          localStorage.getItem('accountIdReceiveIncome') != null
        ) {
          this.accountPosting.accountId = +localStorage.getItem(
            'accountIdReceiveIncome'
          )!;
        }
      },
    });
  }

  ngAfterViewInit(): void {
    this.accountPosting.date = this.datepickerinput.date.value._d;
    this.cd.detectChanges();

    if (this.accountPosting.amount == null) {
      this.setFocusAmount();
    }
  }

  setFocusAmount() {
    setTimeout(() => {
      const inputElement =
        this.elementRef.nativeElement.querySelector('#amount');

      if (inputElement) {
        inputElement.focus();
      }
    }, 500);
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
    } else if (this.accountPosting.type === 'C') {
      this.accountPosting.description = 'Troco';
    } else {
      if (
        this.accountPosting.description === 'Rendimento' ||
        this.accountPosting.description === 'Troco'
      ) {
        this.accountPosting.description = '';
      }
    }
  }

  setTitle() {
    return this.accountPosting.description.replace('Pag.', 'Pagar');
  }

  setTotalAmount() {
    this.accountPosting.amount = this.accountPosting.remaining
  }
}
