import { Component, OnInit, AfterViewInit, Inject, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Accounts } from "src/app/models/accounts.model";
import { Cards } from "src/app/models/cards.model";
import { Incomes } from "src/app/models/incomes.model";
import { IncomesTypes } from "src/app/models/types.model";
import { PeopleService } from "src/app/services/people/people.service";
import { PeopleComponent } from "../people/people.component";


@Component({
  selector: 'incomes-dialog',
  templateUrl: 'incomes-dialog.html',
  styleUrls: ['./budget.component.scss'],
})
export class IncomesDialog implements OnInit, AfterViewInit {
  cards?: Cards[];
  accounts?: Accounts[];
  types?: IncomesTypes[];

  editing: boolean = false;

  incomesFormGroup = new FormGroup({
    descriptionFormControl: new FormControl('', Validators.required),
    toReceiveFormControl: new FormControl('', Validators.required),
    receivedFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
    cardIdFormControl: new FormControl(''),
    accountIdFormControl: new FormControl(''),
    typeFormControl: new FormControl(''),
    repeatIncomeFormControl: new FormControl(''),
    monthsToRepeatFormControl: new FormControl(''),
    peopleFormControl: new FormControl(''),
  });

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<IncomesDialog>,
    @Inject(MAT_DIALOG_DATA) public incomes: Incomes,
    private peopleService: PeopleService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cards = this.incomes.cardsList;
    this.accounts = this.incomes.accountsList;
    this.types = this.incomes.typesList;

    this.incomes.monthsToRepeat = 12;
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.incomes);
  }

  delete(): void {
    this.incomes.deleting = true;

    this.dialogRef.close(this.incomes);
  }

  setCard(): void {
    this.incomes.card = this.incomes.cardsList?.find(
      (t) => t.id == this.incomes.cardId
    );
  }

  calculateRemaining(): void {
    this.incomes.received =
      (this.incomes.received ?? 0) > this.incomes.toReceive
        ? this.incomes.toReceive
        : this.incomes.received;
    this.incomes.remaining = +(
      this.incomes.toReceive - (this.incomes.received ?? 0)
    ).toFixed(2);
  }

  setTitle() {
    return 'Receita - ' + (this.incomes.editing ? 'Editar' : 'Incluir');
  }

  addPeople() {
    this.editing = false;

    const dialogRef = this.dialog.open(PeopleComponent, {
      width: '400px',
      data: {
        editing: this.editing,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.peopleService.create(result).subscribe({
          next: (people) => {
            this.incomes.peopleList = [
              ...this.incomes.peopleList!,
              people,
            ].sort((a, b) => a.id.localeCompare(b.id));
            this.incomes.peopleId = people.id;
          },
        });
      }
    });
  }
}
