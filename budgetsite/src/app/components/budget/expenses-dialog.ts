import { Component, OnInit, AfterViewInit, Inject, ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Cards } from "src/app/models/cards.model";
import { Expenses } from "src/app/models/expenses.model";
import { CategoryService } from "src/app/services/category/category.service";
import { PeopleService } from "src/app/services/people/people.service";
import { CategoryComponent } from "../category/category.component";
import { PeopleComponent } from "../people/people.component";


@Component({
  selector: 'expenses-dialog',
  templateUrl: 'expenses-dialog.html',
  styleUrls: ['./budget.component.scss'],
})
export class ExpensesDialog implements OnInit, AfterViewInit {
  cards?: Cards[];
  editing: boolean = false;

  disableGenerateParcelsCheck: boolean = true;
  disableRepeatParcelsCheck: boolean = false;

  expensesFormGroup = new FormGroup({
    descriptionFormControl: new FormControl('', Validators.required),
    toPayFormControl: new FormControl('', Validators.required),
    paidFormControl: new FormControl(''),
    remainingFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
    cardIdFormControl: new FormControl(''),
    categoryIdFormControl: new FormControl(''),
    dueDateFormControl: new FormControl(''),
    parcelNumberFormControl: new FormControl(''),
    parcelsFormControl: new FormControl(''),
    totalToPayFormControl: new FormControl('', Validators.required),
    generateParcelsFormControl: new FormControl(''),
    repeatParcelsFormControl: new FormControl(''),
    monthsToRepeatFormControl: new FormControl(''),
    scheduledFormControl: new FormControl(''),
    peopleFormControl: new FormControl(''),
  });

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ExpensesDialog>,
    @Inject(MAT_DIALOG_DATA) public expenses: Expenses,
    private categoryService: CategoryService,
    private peopleService: PeopleService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cards = this.expenses.cardsList;

    this.expenses.parcelNumber = this.expenses.parcelNumber ?? 1;
    this.expenses.parcels = this.expenses.parcels ?? 1;

    this.disableGenerateParcelsCheck =
      this.expenses.parcels == undefined ||
      this.expenses.parcels == null ||
      this.expenses.parcels === 1;

    this.expenses.monthsToRepeat = 12;
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.expenses);
  }

  delete(): void {
    this.expenses.deleting = true;

    this.dialogRef.close(this.expenses);
  }

  setCard(): void {
    this.expenses.card = this.expenses.cardsList?.find(
      (t) => t.id == this.expenses.cardId
    );
  }

  calculateRemaining(): void {
    this.expenses.paid =
      (this.expenses.paid ?? 0) > this.expenses.toPay
        ? this.expenses.toPay
        : this.expenses.paid;
    this.expenses.remaining = +(
      this.expenses.toPay - (this.expenses.paid ?? 0)
    ).toFixed(2);
  }

  onParcelNumberChanged(event: any): void { }

  calculateToPay(): void {
    this.expenses.toPay = +(
      this.expenses.totalToPay / this.expenses.parcels!
    ).toFixed(2);

    this.calculateRemaining();
  }

  onParcelsChanged(event: any): void {
    this.disableGenerateParcelsCheck =
      event.target.value == '' || this.expenses.parcels! <= 1;

    if (this.disableGenerateParcelsCheck) {
      this.expenses.generateParcels = false;
    } else {
      this.expenses.generateParcels = true;
    }

    if (event.target.value == '') {
      this.expenses.parcels = 1;
    }

    this.calculateToPay();
  }

  onGenerateParcelsChanged(event: any): void {
    if (this.expenses.generateParcels) {
      this.disableRepeatParcelsCheck = true;
      this.expensesFormGroup.get('monthsToRepeatFormControl')!.disable();
    } else {
      this.disableRepeatParcelsCheck = false;
      this.expensesFormGroup.get('monthsToRepeatFormControl')!.enable();
    }
  }

  onRepeatParcelsChanged(event: any): void {
    if (this.expenses.repeatParcels) {
      this.disableGenerateParcelsCheck = true;
    } else {
      if (this.expenses.parcels! > 1) {
        this.disableGenerateParcelsCheck = false;
      }
    }
  }

  setTitle() {
    return 'Despesa - ' + (this.expenses.editing ? 'Editar' : 'Incluir');
  }

  addCategory() {
    this.editing = false;

    const dialogRef = this.dialog.open(CategoryComponent, {
      width: '400px',
      data: {
        editing: this.editing,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.categoryService.create(result).subscribe({
          next: (category) => {
            this.expenses.categoriesList = [
              ...this.expenses.categoriesList!,
              category,
            ].sort((a, b) => a.name.localeCompare(b.name));
            this.expenses.categoryId = category.id;
          },
        });
      }
    });
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
            this.expenses.peopleList = [
              ...this.expenses.peopleList!,
              people,
            ].sort((a, b) => a.id.localeCompare(b.id));
            this.expenses.peopleId = people.id;
          },
        });
      }
    });
  }
}
