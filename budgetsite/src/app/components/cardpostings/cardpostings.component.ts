import { Component, OnInit, Input, SimpleChanges, Inject } from '@angular/core';
import { CardsPostings } from '../../models/cardspostings.model'
import { CardPostingsService } from '../../services/cardpostings/cardpostings.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { People } from 'src/app/models/people.model';
import { PeopleService } from 'src/app/services/people/people.service';
import { default as _rollupMoment } from 'moment';
import * as _moment from 'moment';

let moment = _rollupMoment || _moment;
@Component({
  selector: 'app-cardpostings',
  templateUrl: './cardpostings.component.html',
  styleUrls: ['./cardpostings.component.css']
})

export class CardPostingsComponent implements OnInit {

  @Input() cardId?: number;
  @Input() reference?: string;

  cardpostings!: CardsPostings[];
  displayedColumns = ['index', 'date', 'description', 'amount'];
  total: number = 0;
  myTotal: number = 0;
  percMyTotal: string = '0,00%';
  othersTotal: number = 0;
  percOthersTotal: string = '0,00%';
  hideProgress: boolean = true;
  editing: boolean = false;
  peopleList?: People[];

  constructor(private cardPostingsService: CardPostingsService,
    private peopleService: PeopleService,
    public dialog: MatDialog) { }

  ngOnInit(): void {

    this.getTotalAmount();

    this.hideProgress = false;

    this.peopleService.read().subscribe(
      {
        next: people => {

          this.peopleList = people;

          this.hideProgress = true;
        },
        error: () => this.hideProgress = true
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['cardId']?.currentValue || changes['reference']?.currentValue) {
    if (this.cardId) {

      this.hideProgress = false;

      this.cardPostingsService.read(this.cardId!, this.reference!).subscribe(
        {
          next: cardpostings => {

            this.cardpostings = cardpostings.sort((a, b) => a.id! - b.id!);

            this.getTotalAmount();

            this.hideProgress = true;
          },
          error: () => this.hideProgress = true
        }
      );
    }
  }

  getTotalAmount() {

    this.total =
      this.cardpostings ?
        this.cardpostings.map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.myTotal = this.cardpostings ?
      this.cardpostings.filter(t => !t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0

    this.othersTotal = this.cardpostings ?
      this.cardpostings.filter(t => t.others).map(t => t.amount).reduce((acc, value) => acc + value, 0) : 0;

    this.percMyTotal = (this.total ? this.myTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';;
    this.percOthersTotal = (this.total ? this.othersTotal / this.total * 100 : 0).toFixed(2)?.toString() + '%';
  }

  add() {

    this.editing = false;

    const dialogRef = this.dialog.open(CardPostingsDialog, {
      width: '400px',
      data: {
        date: new Date(),
        reference: this.reference,
        cardId: this.cardId,
        parcels: 1,
        parcelNumber: 1,
        peopleList: this.peopleList,
        editing: this.editing
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        this.cardPostingsService.create(result).subscribe(
          {
            next: cardpostings => {

              this.cardpostings.push(cardpostings);

              this.getTotalAmount();

              this.hideProgress = true;
            },
            error: () => this.hideProgress = true
          }
        );
      }
    });
  }

  editOrDelete(cardPosting: CardsPostings) {

    this.editing = true;

    const dialogRef = this.dialog.open(CardPostingsDialog, {
      width: '400px',
      data: {
        id: cardPosting.id,
        cardId: cardPosting.cardId,
        date: cardPosting.date,
        reference: cardPosting.reference,
        description: cardPosting.description,
        peopleId: cardPosting.peopleId,
        parcelNumber: cardPosting.parcelNumber ? cardPosting.parcelNumber : 1,
        parcels: cardPosting.parcels ? cardPosting.parcels : 1,
        amount: cardPosting.amount,
        totalAmount: cardPosting.totalAmount ? cardPosting.totalAmount : cardPosting.amount,
        others: cardPosting.others,
        note: cardPosting.note,
        people: cardPosting.people,
        peopleList: this.peopleList,
        editing: this.editing,
        deleting: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.hideProgress = false;

        if (result.deleting) {

          this.cardPostingsService.delete(result.id).subscribe(
            {
              next: () => {

                this.cardpostings = this.cardpostings.filter(t => t.id! != result.id!);

                this.getTotalAmount();

                this.hideProgress = true;
              },
              error: () => this.hideProgress = true
            }
          );
        } else {

          this.cardPostingsService.update(result).subscribe(
            {
              next: () => {

                this.cardpostings.filter(t => t.id === result.id).map(t => {
                  t.date = result.date;
                  t.reference = result.reference;
                  t.description = result.description;
                  t.peopleId = result.peopleId;
                  t.parcelNumber = result.parcelNumber;
                  t.parcels = result.parcels;
                  t.amount = result.amount;
                  t.totalAmount = result.totalAmount;
                  t.others = result.others;
                  t.note = result.note;
                  t.people = result.people;
                });

                this.getTotalAmount();

                this.hideProgress = true;
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
  selector: 'cardpostings-dialog',
  templateUrl: 'cardpostings-dialog.html',
})
export class CardPostingsDialog implements OnInit {

  people?: People[];

  cardPostingFormGroup = new FormGroup({

    descriptionFormControl: new FormControl('', Validators.required),
    totalAmountFormControl: new FormControl('', Validators.required),
    amountFormControl: new FormControl('', Validators.required),
    parcelsFormControl: new FormControl('', Validators.min(1)),
    parcelNumberFormControl: new FormControl('', [Validators.required, Validators.min(1)]),
    peopleFormControl: new FormControl(''),
    noteFormControl: new FormControl(''),
  });

  constructor(public dialogRef: MatDialogRef<CardPostingsDialog>,
    @Inject(MAT_DIALOG_DATA) public cardPosting: CardsPostings) { }

  ngOnInit(): void {

    this.people = this.cardPosting.peopleList;
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

    this.cardPosting.people = this.cardPosting.peopleList?.find(t => t.id == this.cardPosting.peopleId);
  }
}
