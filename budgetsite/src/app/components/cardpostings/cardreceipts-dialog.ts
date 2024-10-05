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
import { CardsReceipts } from 'src/app/models/cardsreceipts.model';
import { DatepickerinputComponent } from 'src/app/shared/datepickerinput/datepickerinput.component';

@Component({
  selector: 'cardreceipts-dialog',
  templateUrl: 'cardreceipts-dialog.html',
  styleUrls: ['../budget/budget.component.scss'],
})
export class CardReceiptsDialog implements OnInit, AfterViewInit {
  @ViewChild('datepickerinput') datepickerinput!: DatepickerinputComponent;

  accounts?: Accounts[];

  cardReceiptsFormGroup = new FormGroup({
    dateFormControl: new FormControl(''),
    toReceiveFormControl: new FormControl(''),
    receivedFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    amountFormControl: new FormControl('', Validators.required),
    changeFormControl: new FormControl(''),
    peopleFormControl: new FormControl(''),
    accountFormControl: new FormControl('', Validators.required),
    noteFormControl: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<CardReceiptsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardReceipts: CardsReceipts,
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.accounts = this.cardReceipts.accountsList;

    if (this.cardReceipts.received! > 0) {
      this.cardReceipts.amount = undefined;
    }

    if (localStorage.getItem('accountIdCardReceipts') != null) {
      this.cardReceipts.accountId = +localStorage.getItem(
        'accountIdCardReceipts'
      )!;
    }

    this.cardReceiptsFormGroup.get('toReceiveFormControl')!.disable();
    this.cardReceiptsFormGroup.get('receivedFormControl')!.disable();
    this.cardReceiptsFormGroup.get('remainingFormControl')!.disable();
    this.cardReceiptsFormGroup.get('changeFormControl')!.disable();
  }

  ngAfterViewInit(): void {
    this.cardReceipts.date = this.datepickerinput.date.value._d;
    this.cd.detectChanges();

    if (this.cardReceipts.amount == null) {
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
    this.cardReceipts.date = date;
  }

  save(): void {
    this.dialogRef.close(this.cardReceipts);
  }

  onAmountChange(): void {
    this.cardReceipts.change =
      this.cardReceipts.amount! > this.cardReceipts.toReceive!
        ? +(this.cardReceipts.amount! - this.cardReceipts.remaining!).toFixed(2)
        : 0;
  }

  setTitle() {
    return 'Recebimento de Compra';
  }

  setTotalAmount() {
    this.cardReceipts.amount = this.cardReceipts.remaining;
  }
}
