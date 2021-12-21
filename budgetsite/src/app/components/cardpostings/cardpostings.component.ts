import { Component, OnInit, Input, SimpleChanges, Inject } from '@angular/core';
import { CardsPostings } from '../../models/cardspostings.model'
import { CardPostingsService } from '../../services/cardpostings/cardpostings.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { People } from 'src/app/models/people.model';
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';
import { PeopleService } from 'src/app/services/people/people.service';

let moment = _rollupMoment || _moment;

moment.updateLocale('pt-BR', {
  months: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
});

moment.updateLocale('pt-BR', {
  monthsShort: [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ]
});

moment.updateLocale('pt-BR', {
  weekdays: [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
  ]
});

moment.updateLocale('pt-BR', {
  weekdaysShort: [
    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
  ]
});

moment.updateLocale('pt-BR', {
  weekdaysMin: [
    "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
  ]
});

moment.locale('pt-BR');

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

  people?: People[];

  constructor(private cardPostingsService: CardPostingsService,
    private peopleService: PeopleService,
    public dialog: MatDialog) { }

  ngOnInit(): void {

    this.getTotalAmount();

    this.hideProgress = false;

    this.peopleService.read().subscribe(
      {
        next: people => {

          this.people = people;

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

  edit(cardPosting: CardsPostings) {

    const dialogRef = this.dialog.open(CardPostingsDialog, {
      width: '500px',
      data: {
        id: cardPosting.id,
        cardId: cardPosting.cardId,
        reference: cardPosting.reference,
        description: cardPosting.description,
        peopleId: cardPosting.peopleId,
        parcelNumber: cardPosting.parcelNumber,
        parcels: cardPosting.parcels,
        amount: cardPosting.amount,
        totalAmount: cardPosting.totalAmount,
        others: cardPosting.others,
        note: cardPosting.note,
        people: this.people
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }
}

@Component({
  selector: 'cardpostings-dialog',
  templateUrl: 'cardpostings-dialog.html',
})
export class CardPostingsDialog {

  people?: People[];

  date = new FormControl(moment());

  constructor(public dialogRef: MatDialogRef<CardPostingsDialog>, @Inject(MAT_DIALOG_DATA) public cardPosting: CardsPostings) {

    this.date.setValue(moment(cardPosting.date));
    this.people = cardPosting.people;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
