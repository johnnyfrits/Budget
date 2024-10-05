import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CardsPostings } from 'src/app/models/cardspostings.model';
import { CategoryService } from 'src/app/services/category/category.service';
import { PeopleService } from 'src/app/services/people/people.service';
import { DatepickerinputComponent } from 'src/app/shared/datepickerinput/datepickerinput.component';
import { CategoryComponent } from '../category/category.component';
import { PeopleComponent } from '../people/people.component';
import { CardPostingsService } from 'src/app/services/cardpostings/cardpostings.service';

@Component({
  selector: 'cardpostings-dialog',
  templateUrl: 'cardpostings-dialog.html',
})
export class CardPostingsDialog implements OnInit, AfterViewInit {
  @ViewChild('datepickerinput') datepickerinput!: DatepickerinputComponent;

  disableCheck: boolean = true;
  editing: boolean = false;

  disableGenerateParcelsCheck: boolean = true;
  disableRepeatParcelsCheck: boolean = false;

  cardPostingFormGroup = new FormGroup({
    cardIdFormControl: new FormControl('', Validators.required),
    descriptionFormControl: new FormControl('', Validators.required),
    totalAmountFormControl: new FormControl('', Validators.required),
    amountFormControl: new FormControl('', Validators.required),
    parcelsFormControl: new FormControl('', Validators.min(1)),
    parcelNumberFormControl: new FormControl('', [
      Validators.required,
      Validators.min(1),
    ]),
    peopleFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
    generateParcelsFormControl: new FormControl(''),
    categoryIdFormControl: new FormControl(''),
    repeatParcelsFormControl: new FormControl(''),
    monthsToRepeatFormControl: new FormControl(''),
  });

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CardPostingsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardPosting: CardsPostings,
    private categoryService: CategoryService,
    private peopleService: PeopleService,
    private cardPostingsService: CardPostingsService,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (!this.cardPosting.id) {
      this.cardPosting.date = this.datepickerinput.date.value._d;
    }

    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.disableCheck =
      this.cardPosting.parcels == undefined ||
      this.cardPosting.parcels == null ||
      this.cardPosting.parcels === 1;

    this.disableGenerateParcelsCheck =
      this.cardPosting.parcels == undefined ||
      this.cardPosting.parcels == null ||
      this.cardPosting.parcels === 1;

    this.cardPosting.monthsToRepeat = 12;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  currentDateChanged(date: Date) {
    this.cardPosting.date = date;
  }

  save(): void {
    this.dialogRef.close(this.cardPosting);
  }

  delete(): void {
    this.cardPosting.deleting = true;

    this.dialogRef.close(this.cardPosting);
  }

  setPeople(): void {
    this.cardPosting.people = this.cardPosting.peopleList?.find(
      (t) => t.id == this.cardPosting.peopleId
    );
  }

  onParcelsChanged(event: any): void {
    this.disableCheck =
      event.target.value == '' || this.cardPosting.parcels! <= 1;

    if (this.disableCheck) {
      this.cardPosting.generateParcels = false;
    } else {
      this.cardPosting.generateParcels = true;
    }

    if (event.target.value == '') {
      this.cardPosting.parcels = 1;
    }

    this.calculateAmount();
  }

  onParcelNumberChanged(event: any): void {
    if (event.target.value == '') {
      this.cardPosting.parcelNumber = 1;
    }
  }

  calculateAmount(): void {
    this.cardPosting.amount = +(
      this.cardPosting.totalAmount! / this.cardPosting.parcels!
    ).toFixed(2);
  }

  setTitle() {
    return 'Compra - ' + (this.cardPosting.editing ? 'Editar' : 'Incluir');
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
            this.cardPosting.peopleList = [
              ...this.cardPosting.peopleList!,
              people,
            ].sort((a, b) => a.id.localeCompare(b.id));
            this.cardPosting.peopleId = people.id;
          },
        });
      }
    });
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
            this.cardPosting.categoriesList = [
              ...this.cardPosting.categoriesList!,
              category,
            ].sort((a, b) => a.name.localeCompare(b.name));
            this.cardPosting.categoryId = category.id;
          },
        });
      }
    });
  }

  onRepeatParcelsChanged(event: any): void {
    if (this.cardPosting.repeatParcels) {
      this.disableGenerateParcelsCheck = true;
    } else {
      if (this.cardPosting.parcels! > 1) {
        this.disableGenerateParcelsCheck = false;
      }
    }
  }

  onDescriptionChange() {
    if (!this.cardPosting.description) return;

    if (this.cardPosting.categoryId != null) return;

    this.cardPostingsService
      .getCategoryByDescription(this.cardPosting.description)
      .subscribe({
        next: (categoryId) => {
          if (categoryId != null) {
            this.cardPosting.categoryId = categoryId.categoryId;
          }
        },
      });
  }
}
